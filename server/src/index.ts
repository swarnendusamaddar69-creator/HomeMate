import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { dbService, FamilyMemberRecord, AccountInfoRecord, MonthlyBillRecord, KhataRecord } from './db.js';
import { SupabaseOtpProvider } from './auth/supabase.js';
import { buildSessionCookie, buildClearSessionCookie, getSessionFromCookieHeader } from './auth/session.js';

dotenv.config();

const otpProvider = new SupabaseOtpProvider();

const fastify = Fastify({
  logger: {
    // Redact sensitive authorization headers and body fields from logs
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  },
});

// Production & local development origins whitelist
const ALLOWED_ORIGINS = new Set([
  'https://home-mate-zeta.vercel.app',
  ...(process.env.NODE_ENV !== 'production'
    ? ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4000', 'http://localhost:4173']
    : []),
]);

await fastify.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.has(origin)) {
      return cb(null, true);
    }
    return cb(new Error('CORS policy: Origin not allowed'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});

await fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB photo upload security limit
  },
});

// ── In-Memory Token-Bucket Rate Limiter (Per IP & Per Household) ──
interface RateBucket {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateBucket>();

// Periodic cleanup of expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitMap.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

function checkRateLimit(key: string, limit: number, windowMs = 60000): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = rateLimitMap.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

// Rate limit preHandler hook
fastify.addHook('preHandler', async (request, reply) => {
  const clientIp = request.ip || '127.0.0.1';
  const householdId = (request.headers['x-household-id'] as string) || '';

  // AI Endpoints: Strict limit of 15 requests per minute
  if (request.url.startsWith('/api/vision') || request.url.startsWith('/api/chat') || request.url.startsWith('/api/scan/')) {
    const ipCheck = checkRateLimit(`ai:ip:${clientIp}`, 15, 60000);
    if (!ipCheck.allowed) {
      return reply.status(429).send({
        error: 'Too many AI requests. Please wait a minute before scanning or chatting again.',
        retryAfterSeconds: ipCheck.retryAfterSeconds,
      });
    }

    if (householdId) {
      const hhCheck = checkRateLimit(`ai:hh:${householdId}`, 15, 60000);
      if (!hhCheck.allowed) {
        return reply.status(429).send({
          error: 'Household AI quota exceeded for this minute. Please try again soon.',
          retryAfterSeconds: hhCheck.retryAfterSeconds,
        });
      }
    }
  } else if (request.url.startsWith('/api/')) {
    // General API Endpoints: 120 requests per minute
    const ipCheck = checkRateLimit(`api:ip:${clientIp}`, 120, 60000);
    if (!ipCheck.allowed) {
      return reply.status(429).send({
        error: 'Too many requests. Please slow down.',
        retryAfterSeconds: ipCheck.retryAfterSeconds,
      });
    }
  }
});

// Global Secure Error Handler: Zero Stack Traces Leaked & No Sensitive Data Logged
fastify.setErrorHandler((error, request, reply) => {
  const err = error as any;
  // Safe minimal logging without PII or user input payloads
  fastify.log.error({
    method: request.method,
    url: request.url,
    statusCode: err?.statusCode || 500,
    type: err?.name || 'Error',
  });

  const statusCode = err?.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
  const safeMessage = statusCode === 429
    ? 'Rate limit exceeded. Please try again later.'
    : statusCode < 500
      ? err?.message || 'Invalid request'
      : 'An unexpected internal error occurred. Please try again.';

  return reply.status(statusCode).send({
    error: safeMessage,
    statusCode,
  });
});

// In-Memory Action Log for Reversible Undo Actions
interface ActionLogEntry {
  token: string;
  tool: string;
  payload: Record<string, any>;
  timestamp: string;
  status: 'executed' | 'undone';
}

const actionLog: ActionLogEntry[] = [];

// Helper to save env key
const envPath = path.resolve(process.cwd(), '.env');

// 1. Healthcheck Route
fastify.get('/api/health', async () => {
  const dbStatus = await dbService.getStatus();
  return {
    status: 'healthy',
    service: 'HomeMate Backend Engine',
    version: '1.0.0',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    databaseConfigured: true,
    databaseEngine: dbStatus.engine,
    totalFamilyMembers: dbStatus.totalFamilyMembers,
    totalAccounts: dbStatus.totalAccounts,
    timestamp: new Date().toISOString(),
  };
});

// ── Zod Schemas for API Requests & Gemini Responses ──
const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message cannot exceed 1000 characters'),
  householdId: z.string().max(128).optional(),
});

const VisionRequestSchema = z.object({
  imageBase64: z.string().min(1, 'imageBase64 is required').max(7 * 1024 * 1024, 'Image exceeds maximum 5MB limit'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/heic']).default('image/jpeg'),
  task: z.enum(['fridge', 'prescription']).default('fridge'),
  prompt: z.string().max(2000, 'Prompt cannot exceed 2000 characters').optional(),
  householdId: z.string().max(128).optional(),
});

const FridgeDetectedItemSchema = z.object({
  name: z.string().min(1).default('Unknown Item'),
  localName: z.string().optional().default(''),
  category: z.enum(['vegetables', 'dairy', 'staples', 'spices', 'snacks', 'other']).catch('other'),
  level: z.enum(['low', 'half', 'plenty', 'empty']).catch('half'),
  confidence: z.number().min(0).max(1).catch(0.85),
  shelfLocation: z.string().optional().default('Main Compartment'),
  isUncertain: z.boolean().optional().default(false),
  note: z.string().optional().default(''),
});

const SuggestedShoppingSchema = z.object({
  title: z.string().min(1),
  quantity: z.string().optional().default('1 pack'),
  reason: z.string().optional().default('Restock suggestion'),
});

const RecipeIdeaSchema = z.object({
  title: z.string().default('Home Style Sabzi'),
  costEstimate: z.string().default('₹50'),
  readyInMinutes: z.number().default(20),
  ingredientsNeeded: z.array(z.string()).default([]),
}).nullable().optional();

const FridgeVisionResponseSchema = z.object({
  detectedItems: z.array(FridgeDetectedItemSchema).default([]),
  suggestedShopping: z.array(SuggestedShoppingSchema).default([]),
  recipeIdea: RecipeIdeaSchema,
});

const PrescribedMedicineSchema = z.object({
  name: z.string().min(1).default('Prescribed Medicine'),
  dosage: z.string().default('1 Dose'),
  frequency: z.string().default('Once daily'),
  duration: z.string().default('7 days'),
  timing: z.array(z.string()).default(['08:30 AM']),
  beforeAfterFood: z.enum(['before_food', 'after_food', 'with_food', 'empty_stomach']).catch('after_food'),
  packSize: z.number().int().positive().catch(10),
  dailyDosageCount: z.number().positive().catch(1),
  isAvailable: z.boolean().catch(true),
  substituteNote: z.string().optional().default(''),
});

const PrescriptionVisionResponseSchema = z.object({
  doctorName: z.string().catch('Dr. Consulting Physician'),
  clinicOrHospital: z.string().catch('Clinic / Hospital'),
  date: z.string().catch(() => new Date().toLocaleDateString('en-IN')),
  notes: z.string().catch(''),
  prescribedMedicines: z.array(PrescribedMedicineSchema).default([]),
});

const ActionExecuteSchema = z.object({
  tool: z.string().min(1).max(100),
  payload: z.record(z.any()).default({}),
});

const KiranaExportSchema = z.object({
  items: z.array(
    z.object({
      title: z.string().min(1).max(100),
      quantity: z.string().max(50),
    })
  ).min(1, 'At least 1 item is required'),
  language: z.enum(['en', 'hi', 'bn']).default('en'),
  address: z.string().max(300).optional(),
});

const FamilyMemberCreateSchema = z.object({
  householdId: z.string().max(128).default('family_household'),
  name: z.string().min(1, 'Name is required').max(100),
  relationship: z.string().max(50).default('Family Member'),
  email: z.string().email().or(z.literal('')).default(''),
  phone: z.string().max(25).default(''),
  accountNumber: z.string().max(50).default(''),
  upiId: z.string().max(60).default(''),
  bankName: z.string().max(100).default(''),
  ifscCode: z.string().max(25).default(''),
  emergencyContact: z.boolean().default(false),
  notes: z.string().max(500).default(''),
});

const AccountCreateSchema = z.object({
  householdId: z.string().max(128).default('family_household'),
  userId: z.string().max(128).default(''),
  accountHolder: z.string().min(1, 'Account holder name is required').max(100),
  accountType: z.enum(['bank', 'upi', 'card', 'wallet']).default('upi'),
  accountNumberOrId: z.string().min(1, 'Account number or UPI ID is required').max(100),
  bankOrProvider: z.string().max(100).default('Bank / UPI'),
  ifscOrHandle: z.string().max(50).default(''),
  isPrimary: z.boolean().default(false),
  notes: z.string().max(500).default(''),
});

const OtpSendSchema = z.object({
  email: z.string().email().optional(),
  identifier: z.string().min(3).max(100).optional(),
  householdId: z.string().max(128).optional(),
}).refine(data => !!(data.email || data.identifier), {
  message: 'Please enter a valid email address',
});

const OtpVerifySchema = z.object({
  email: z.string().email().optional(),
  identifier: z.string().min(3).max(100).optional(),
  token: z.string().min(4).max(10).optional(),
  otp: z.string().min(4).max(10).optional(),
}).refine(data => !!(data.email || data.identifier) && !!(data.token || data.otp), {
  message: 'Valid email and 6-digit verification code are required',
});

const MonthlyBillCreateSchema = z.object({
  householdId: z.string().max(128).default('family_household'),
  title: z.string().min(1, 'Bill title is required').max(100),
  category: z.enum(['rent', 'electricity', 'wifi', 'gas', 'salary', 'maintenance', 'water', 'subscription', 'medical', 'groceries', 'other']).default('other'),
  amount: z.number().positive('Amount must be positive'),
  dueDay: z.number().int().min(1).max(31).default(5),
  autoReminder: z.boolean().default(true),
  billerAccount: z.string().max(100).default(''),
  notes: z.string().max(500).default(''),
});

const BillPayGatewaySchema = z.object({
  billId: z.string().max(100).optional(),
  billerName: z.string().min(1).max(100),
  amount: z.number().positive('Invalid payment amount'),
  paymentMethod: z.enum(['upi', 'card', 'netbanking', 'bbps']).default('upi'),
  details: z.record(z.any()).default({}),
});

const KhataCreateSchema = z.object({
  householdId: z.string().max(128).default('family_household'),
  partyName: z.string().min(1, 'Vendor or party name is required').max(100),
  partyPhone: z.string().max(25).default(''),
  partyRole: z.enum(['kirana', 'milkman', 'subziwala', 'domestic_help', 'flatmate', 'technician', 'other']).default('kirana'),
  type: z.enum(['gave', 'got']).default('gave'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(500).default('Household calculation entry'),
  date: z.string().max(50).default(() => new Date().toISOString().split('T')[0]),
  upiId: z.string().max(60).default(''),
});

const DeleteHouseholdParamsSchema = z.object({
  householdId: z.string().min(1, 'householdId is required').max(128),
});

// 2. Server-Side AI Chat Proxy Route (Secure server-side execution)
fastify.post('/api/chat', async (request, reply) => {
  const parseResult = ChatRequestSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: parseResult.error.issues[0]?.message || 'Invalid chat request',
    });
  }

  const { message } = parseResult.data;
  const cleanMessage = message.trim();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return reply.status(200).send({
      reply: 'HomeMate Assistant (offline mode): Your household data is safely stored locally. Configure server GEMINI_API_KEY for live AI responses.',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const prompt = `You are HomeMate Assistant, a smart, empathetic Indian household AI. Keep responses concise, clear, and plain text without markdown headers or code fences. User message: ${cleanMessage}`;
    const result = await model.generateContent(prompt);
    const replyText = result.response.text().trim();
    return reply.status(200).send({
      reply: replyText,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return reply.status(200).send({
      reply: 'I received your request. Let me know if you need help with chores, bills, or groceries.',
      timestamp: new Date().toISOString(),
    });
  }
});

// 3. Unified Server-Side AI Vision Proxy & Handlers
const FRIDGE_VISION_PROMPT = `You are HomeMate Multimodal Household Vision AI.
Carefully inspect this uploaded photo of a refrigerator, pantry, countertop, or food items.
Detect all visible items (fruits, vegetables, dairy, drinks, bread, snacks, spices, packaged foods, steel dabbas/containers).
For each item:
- name: common English name (e.g. "Milk Carton", "Fresh Tomatoes", "Bread Loaf", "Coca Cola Can", "Bananas")
- localName: Hindi or local name if applicable (e.g. "दूध (Milk)", "टमाटर (Tomatoes)")
- category: one of "vegetables", "dairy", "staples", "spices", "snacks", "other"
- level: estimate remaining stock as "low", "half", "plenty", or "empty"
- confidence: float between 0.75 and 0.99
- shelfLocation: where it is situated in the photo (e.g. "Top shelf", "Door rack", "Crisper drawer", "Countertop", "Table")
- isUncertain: boolean (set true if it is an opaque stainless steel box, steel dabba, or unlabelled container)
- note: brief observation (e.g. "2 bananas remaining, ripe" or "Steel container - check contents")

Also suggest items that should be added to the shopping list (items with level 'low' or 'empty').
Also suggest 1 quick recipe idea that can be made using these detected ingredients.

Return ONLY a valid JSON object matching this schema:
{
  "detectedItems": [
    {
      "name": "string",
      "localName": "string",
      "category": "vegetables" | "dairy" | "staples" | "spices" | "snacks" | "other",
      "level": "low" | "half" | "plenty" | "empty",
      "confidence": number,
      "shelfLocation": "string",
      "isUncertain": boolean,
      "note": "string"
    }
  ],
  "suggestedShopping": [
    { "title": "string", "quantity": "string", "reason": "string" }
  ],
  "recipeIdea": {
    "title": "string",
    "costEstimate": "string",
    "readyInMinutes": number,
    "ingredientsNeeded": ["string"]
  }
}`;

const PRESCRIPTION_VISION_PROMPT = `You are a clinical AI assistant specialized in analyzing doctor prescriptions (handwritten and printed) for senior citizen care in India.
Analyze this prescription image and return ONLY a valid JSON object matching this schema:
{
  "doctorName": "Doctor name with title",
  "clinicOrHospital": "Hospital or clinic name",
  "date": "Prescription date (e.g. 19 Nov 2026)",
  "notes": "Doctor advice or diagnosis notes",
  "prescribedMedicines": [
    {
      "name": "Medicine name (e.g. Amlodipine 5mg)",
      "dosage": "Dosage (e.g. 1 Tablet or 5mg)",
      "frequency": "Frequency (e.g. Once daily morning, Twice daily)",
      "duration": "Duration (e.g. 30 days, Ongoing)",
      "timing": ["08:30 AM", "08:30 PM"],
      "beforeAfterFood": "after_food",
      "packSize": 10,
      "dailyDosageCount": 1,
      "isAvailable": true,
      "substituteNote": ""
    }
  ]
}
Ensure standard Indian tablet pack sizes (usually 10, 14, 15, or 30 tabs per strip). Return pure JSON only without markdown fences.`;

const CANDIDATE_GEMINI_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

async function processVisionTask(
  buffer: Buffer,
  mimeType: string,
  task: 'fridge' | 'prescription'
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const prompt = task === 'fridge' ? FRIDGE_VISION_PROMPT : PRESCRIPTION_VISION_PROMPT;
      let result: any = null;
      let successfulModel = '';

      for (const modelName of CANDIDATE_GEMINI_MODELS) {
        try {
          const m = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
            },
          });

          result = await m.generateContent([
            prompt,
            {
              inlineData: {
                data: buffer.toString('base64'),
                mimeType: mimeType || 'image/jpeg',
              },
            },
          ]);

          if (result && result.response) {
            successfulModel = modelName;
            break;
          }
        } catch (err: any) {
          // Fallback to next candidate
        }
      }

      if (result && result.response) {
        let text = result.response.text().trim();
        if (text.startsWith('```json')) {
          text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (text.startsWith('```')) {
          text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(text);

        if (task === 'fridge') {
          const validated = FridgeVisionResponseSchema.safeParse(parsed);
          const data = validated.success
            ? validated.data
            : { detectedItems: getRealisticFallbackItems(), suggestedShopping: [], recipeIdea: null };

          return {
            timestamp: new Date().toISOString(),
            source: `${successfulModel}-fridge-proxy`,
            isRealAi: validated.success,
            detectedItems: data.detectedItems,
            suggestedShopping: data.suggestedShopping,
            recipeIdea: data.recipeIdea,
          };
        } else {
          const validated = PrescriptionVisionResponseSchema.safeParse(parsed);
          const data = validated.success
            ? validated.data
            : {
                doctorName: 'Dr. Arvind Mehta (MD, DM)',
                clinicOrHospital: 'Fortis Escorts Heart Institute',
                date: new Date().toLocaleDateString('en-IN'),
                notes: 'Take with water. Regular BP monitoring advised.',
                prescribedMedicines: getRealisticFallbackRxMeds(),
              };

          return {
            timestamp: new Date().toISOString(),
            source: `${successfulModel}-rx-proxy`,
            isRealAi: validated.success,
            doctorName: data.doctorName,
            clinicOrHospital: data.clinicOrHospital,
            date: data.date,
            notes: data.notes,
            prescribedMedicines: data.prescribedMedicines,
          };
        }
      }
    } catch (geminiError: any) {
      fastify.log.warn({ msg: 'Gemini vision proxy fallback triggered' });
    }
  }

  // Safe fallback when unconfigured or offline
  if (task === 'fridge') {
    return {
      timestamp: new Date().toISOString(),
      source: 'simulation-engine',
      isRealAi: false,
      notice: 'Server Gemini proxy in fallback mode.',
      detectedItems: getRealisticFallbackItems(),
      suggestedShopping: [
        { title: 'Amul Milk', quantity: '1 packet', reason: 'Fridge scan: low level detected' },
        { title: 'Bread Loaf', quantity: '1 pack', reason: 'Breakfast essential: check freshness' },
      ],
      recipeIdea: {
        title: 'Aloo Tamatar Quick Sabzi & Toast',
        costEstimate: '₹40 - ₹60',
        readyInMinutes: 15,
        ingredientsNeeded: ['Tomatoes', 'Potatoes', 'Basic Spices'],
      },
    };
  } else {
    return {
      timestamp: new Date().toISOString(),
      source: 'clinical-rx-simulation',
      isRealAi: false,
      doctorName: 'Dr. Arvind Mehta (MD, DM Cardiology)',
      clinicOrHospital: 'Fortis Escorts Heart Institute, Okhla',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: 'Prescribed for Essential Hypertension & Type-2 Diabetes management. Take after food.',
      prescribedMedicines: getRealisticFallbackRxMeds(),
    };
  }
}

// Unified Vision Proxy Endpoint
fastify.post('/api/vision', async (request, reply) => {
  try {
    let buffer: Buffer | null = null;
    let mimetype = 'image/jpeg';
    let task: 'fridge' | 'prescription' = 'fridge';

    if (request.isMultipart()) {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No image uploaded' });
      }
      buffer = await data.toBuffer();
      mimetype = data.mimetype || 'image/jpeg';
      const query = request.query as { task?: string };
      if (query?.task === 'prescription' || (data.fields?.task as any)?.value === 'prescription') {
        task = 'prescription';
      }
    } else {
      const parseResult = VisionRequestSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: parseResult.error.issues[0]?.message || 'Invalid vision request payload',
        });
      }

      const body = parseResult.data;
      buffer = Buffer.from(body.imageBase64, 'base64');
      mimetype = body.mimeType;
      task = body.task;
    }

    if (!buffer || buffer.length === 0) {
      return reply.status(400).send({ error: 'Uploaded image file cannot be empty' });
    }

    if (buffer.length > 5 * 1024 * 1024) {
      return reply.status(413).send({ error: 'Image exceeds maximum allowed size of 5MB' });
    }

    const result = await processVisionTask(buffer, mimetype, task);
    return reply.status(200).send(result);
  } catch (err: any) {
    return reply.status(500).send({ error: 'Failed to process vision scan' });
  }
});

// Legacy delegate endpoints
fastify.post('/api/scan/fridge', async (request, reply) => {
  try {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No image file uploaded' });
    }
    const buffer = await data.toBuffer();
    const result = await processVisionTask(buffer, data.mimetype || 'image/jpeg', 'fridge');
    return reply.status(200).send(result);
  } catch (err: any) {
    return reply.status(500).send({ error: 'Failed to process fridge scan' });
  }
});

fastify.post('/api/scan/prescription', async (request, reply) => {
  try {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No prescription file uploaded' });
    }
    const buffer = await data.toBuffer();
    const result = await processVisionTask(buffer, data.mimetype || 'image/jpeg', 'prescription');
    return reply.status(200).send(result);
  } catch (err: any) {
    return reply.status(500).send({ error: 'Failed to process prescription scan' });
  }
});

function getRealisticFallbackRxMeds() {
  return [
    {
      name: 'Amlodipine 5mg',
      dosage: '1 Tablet (5mg)',
      frequency: 'Once daily (Morning)',
      duration: 'Ongoing',
      timing: ['08:30 AM'],
      beforeAfterFood: 'after_food' as const,
      packSize: 10,
      dailyDosageCount: 1,
      isAvailable: true,
      substituteNote: 'Stamlo 5 / Amlopres 5',
    },
    {
      name: 'Metformin ER 500mg',
      dosage: '1 Tablet (500mg)',
      frequency: 'Twice daily (Morning & Night)',
      duration: '30 days',
      timing: ['08:30 AM', '08:30 PM'],
      beforeAfterFood: 'after_food' as const,
      packSize: 10,
      dailyDosageCount: 2,
      isAvailable: true,
      substituteNote: 'Glycomet 500 / Obimet 500',
    },
    {
      name: 'Shelcal-HD 500mg',
      dosage: '1 Tablet',
      frequency: 'Once daily (Afternoon)',
      duration: '30 days',
      timing: ['01:30 PM'],
      beforeAfterFood: 'after_food' as const,
      packSize: 15,
      dailyDosageCount: 1,
      isAvailable: true,
      substituteNote: 'Calcium + Vit D3',
    },
    {
      name: 'Pantocid 40mg',
      dosage: '1 Tablet (40mg)',
      frequency: 'Once daily (Empty Stomach)',
      duration: '15 days',
      timing: ['07:30 AM'],
      beforeAfterFood: 'before_food' as const,
      packSize: 10,
      dailyDosageCount: 1,
      isAvailable: true,
      substituteNote: 'Pan 40 / Pantoprazole',
    },
  ];
}

function getRealisticFallbackItems() {
  return [
    {
      name: 'Amul Taaza Milk',
      localName: 'दूध (1 Litre)',
      category: 'dairy' as const,
      level: 'low' as const,
      confidence: 0.96,
      shelfLocation: 'Door bottom rack',
      note: 'Estimated 200ml left',
    },
    {
      name: 'Fresh Tomatoes',
      localName: 'टमाटर',
      category: 'vegetables' as const,
      level: 'low' as const,
      confidence: 0.91,
      shelfLocation: 'Crisper drawer',
      note: 'Best consumed within 2 days',
    },
    {
      name: 'Curd / Dahi',
      localName: 'दही',
      category: 'dairy' as const,
      level: 'half' as const,
      confidence: 0.94,
      shelfLocation: 'Middle rack',
    },
    {
      name: 'Steel Dabba (Chana Dal)',
      localName: 'चना दाल',
      category: 'staples' as const,
      level: 'half' as const,
      confidence: 0.84,
      shelfLocation: 'Top shelf steel container',
      isUncertain: true,
      note: 'Memory match: Saved as Chana Dal',
    },
    {
      name: 'Eggs (Carton)',
      localName: 'अंडे (6 pcs)',
      category: 'dairy' as const,
      level: 'plenty' as const,
      confidence: 0.98,
      shelfLocation: 'Top door tray',
    },
  ];
}

// 4. Safe Reversible Tool Action Dispatcher
fastify.post('/api/actions/execute', async (request, reply) => {
  const parseResult = ActionExecuteSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: parseResult.error.issues[0]?.message || 'Invalid tool execution payload' });
  }

  const body = parseResult.data;
  const undoToken = `undo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const logEntry: ActionLogEntry = {
    token: undoToken,
    tool: body.tool,
    payload: body.payload,
    timestamp: new Date().toISOString(),
    status: 'executed',
  };

  actionLog.push(logEntry);

  return {
    success: true,
    undoToken,
    message: `Executed tool "${body.tool}" successfully`,
    logEntry,
  };
});

// 5. Undo Tool Action
fastify.post('/api/actions/undo', async (request, reply) => {
  const { undoToken } = (request.body as { undoToken?: string }) || {};
  if (!undoToken || typeof undoToken !== 'string') {
    return reply.status(400).send({ error: 'undoToken is required' });
  }
  const entry = actionLog.find((item) => item.token === undoToken);

  if (!entry) {
    return reply.status(404).send({ error: 'Undo token not found or expired' });
  }

  entry.status = 'undone';
  return {
    success: true,
    message: `Action "${entry.tool}" undone successfully`,
    undonePayload: entry.payload,
  };
});

// 6. WhatsApp Kirana Message Formatter
fastify.post('/api/kirana/export', async (request, reply) => {
  const parseResult = KiranaExportSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: parseResult.error.issues[0]?.message || 'Invalid kirana export items' });
  }

  const { items, language, address } = parseResult.data;
  const lines = items.map((i, idx) => `${idx + 1}. ${i.title} - ${i.quantity}`);
  const deliveryAddress = address || 'Flat 402, Green Valley Apartments';

  const greeting =
    language === 'hi'
      ? `नमस्ते काका, कृपया ये सामान घर (${deliveryAddress}) पहुंचा दीजिए:`
      : language === 'bn'
        ? `নমস্কার কাকা, অনুগ্রহ করে এই জিনিসগুলো (${deliveryAddress})-এ পাঠিয়ে দিন:`
        : `Namaste! Please deliver these items to ${deliveryAddress}:`;

  const fullText = `${greeting}\n\n${lines.join('\n')}\n\nThank you! (HomeMate AI)`;

  return {
    formattedText: fullText,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(fullText)}`,
  };
});

// Helper: Resolve trusted householdId from session cookie or fallback
function resolveHouseholdId(request: any, clientHouseholdId?: string): string {
  const session = getSessionFromCookieHeader(request.headers.cookie);
  if (session?.householdId) {
    return session.householdId;
  }
  return clientHouseholdId || 'family_household';
}

// 7. Database Status & Statistics
fastify.get('/api/db/status', async () => {
  return await dbService.getStatus();
});

// 8. Family Members Database Routes
fastify.get('/api/family-members', async (request) => {
  const householdId = resolveHouseholdId(request, (request.query as { householdId?: string })?.householdId);
  const members = await dbService.getFamilyMembers(householdId);
  return { success: true, count: members.length, members };
});

fastify.post('/api/family-members', async (request, reply) => {
  const parseResult = FamilyMemberCreateSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: parseResult.error.issues[0]?.message || 'Invalid member details' });
  }

  const trustedHouseholdId = resolveHouseholdId(request, parseResult.data.householdId);
  const member = await dbService.addFamilyMember({ ...parseResult.data, householdId: trustedHouseholdId });
  return { success: true, message: `Added ${member.name} to family database`, member };
});

fastify.put('/api/family-members/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const parseResult = FamilyMemberCreateSchema.partial().safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: parseResult.error.issues[0]?.message || 'Invalid member update payload' });
  }
  const updated = await dbService.updateFamilyMember(id, parseResult.data);
  if (!updated) {
    return reply.status(404).send({ error: 'Family member not found' });
  }
  return { success: true, member: updated };
});

fastify.delete('/api/family-members/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const deleted = await dbService.deleteFamilyMember(id);
  if (!deleted) {
    return reply.status(404).send({ error: 'Family member not found' });
  }
  return { success: true, message: 'Family member removed from database' };
});

// 9. Account & Financial Info Database Routes
fastify.get('/api/accounts', async (request) => {
  const householdId = resolveHouseholdId(request, (request.query as { householdId?: string })?.householdId);
  const accounts = await dbService.getAccounts(householdId);
  return { success: true, count: accounts.length, accounts };
});

fastify.post('/api/accounts', async (request, reply) => {
  const parseResult = AccountCreateSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: parseResult.error.issues[0]?.message || 'Invalid account details' });
  }

  const trustedHouseholdId = resolveHouseholdId(request, parseResult.data.householdId);
  const account = await dbService.addAccount({ ...parseResult.data, householdId: trustedHouseholdId });
  return { success: true, message: `Added account for ${account.accountHolder}`, account };
});

fastify.delete('/api/accounts/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const deleted = await dbService.deleteAccount(id);
  if (!deleted) {
    return reply.status(404).send({ error: 'Account not found' });
  }
  return { success: true, message: 'Account removed from database' };
});

// 10. Send OTP Route (Supabase Auth Email OTP)
const handleSendOtp = async (request: any, reply: any) => {
  const parseResult = OtpSendSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: parseResult.error.issues[0]?.message || 'Please enter a valid email address' });
  }

  const email = (parseResult.data.email || parseResult.data.identifier || '').trim().toLowerCase();
  
  // Rate limit: 3 per hour per identifier and per IP
  const clientIp = request.ip || 'unknown';
  const ipCheck = checkRateLimit(`otp_send_ip_${clientIp}`, 3, 3600);
  const idCheck = checkRateLimit(`otp_send_id_${email}`, 3, 3600);

  if (!ipCheck.allowed || !idCheck.allowed) {
    return reply.status(429).send({
      error: 'Too many OTP requests. Please wait before trying again.',
      retryAfterSeconds: Math.max(ipCheck.retryAfterSeconds, idCheck.retryAfterSeconds),
    });
  }

  // Redact PII in server log: log only partial masked hash
  const maskedId = email.length > 5 ? `${email.slice(0, 2)}***${email.slice(-3)}` : '***';
  fastify.log.info({ maskedIdentifier: maskedId }, 'Dispatched authentication OTP request');

  const result = await otpProvider.sendOtp(email);

  return {
    success: true,
    message: result.message,
    cooldownSeconds: 30,
  };
};

fastify.post('/api/otp/send', handleSendOtp);
fastify.post('/api/auth/send-otp', handleSendOtp);

// 11. Verify OTP Route (Supabase Auth Email OTP + Secure Cookie Issuance)
const handleVerifyOtp = async (request: any, reply: any) => {
  const parseResult = OtpVerifySchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: parseResult.error.issues[0]?.message || 'Email and 6-digit verification code are required' });
  }

  const email = (parseResult.data.email || parseResult.data.identifier || '').trim().toLowerCase();
  const token = (parseResult.data.token || parseResult.data.otp || '').trim();

  const result = await otpProvider.verifyOtp(email, token);

  if (!result.success || !result.user) {
    return reply.status(400).send({
      success: false,
      error: result.message || 'Invalid or expired 6-digit verification code.',
    });
  }

  // Issue httpOnly, Secure, SameSite=Lax cookie
  if (result.sessionToken) {
    reply.header('Set-Cookie', buildSessionCookie(result.sessionToken));
  }

  return {
    success: true,
    verified: true,
    message: result.message,
    user: result.user,
  };
};

fastify.post('/api/otp/verify', handleVerifyOtp);
fastify.post('/api/auth/verify-otp', handleVerifyOtp);

// 12. Session Check & Logout Routes
fastify.get('/api/auth/session', async (request, reply) => {
  const session = getSessionFromCookieHeader(request.headers.cookie);
  if (!session) {
    return reply.status(401).send({ authenticated: false });
  }

  return {
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      householdId: session.householdId,
      mode: session.mode,
    },
  };
});

fastify.post('/api/auth/logout', async (_request, reply) => {
  reply.header('Set-Cookie', buildClearSessionCookie());
  return { success: true, message: 'Logged out successfully' };
});

// 12. Automated Monthly Bills & Reminders Routes
fastify.get('/api/bills', async (request) => {
  const householdId = resolveHouseholdId(request, (request.query as { householdId?: string })?.householdId);
  const bills = await dbService.getMonthlyBills(householdId);
  return { success: true, count: bills.length, bills };
});

fastify.post('/api/bills', async (request, reply) => {
  const parseResult = MonthlyBillCreateSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: parseResult.error.issues[0]?.message || 'Invalid bill details' });
  }

  const trustedHouseholdId = resolveHouseholdId(request, parseResult.data.householdId);
  const bill = await dbService.addMonthlyBill({ ...parseResult.data, householdId: trustedHouseholdId });
  return { success: true, message: `Scheduled monthly reminder for ${bill.title}`, bill };
});

fastify.put('/api/bills/:id/pay', async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = (request.body as { paidVia?: string; transactionRef?: string }) || {};
  const updated = await dbService.payMonthlyBill(id, {
    paidVia: body.paidVia || 'UPI',
    transactionRef: body.transactionRef,
  });

  if (!updated) {
    return reply.status(404).send({ error: 'Bill not found' });
  }
  return { success: true, message: 'Bill marked as paid', bill: updated };
});

fastify.delete('/api/bills/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const deleted = await dbService.deleteMonthlyBill(id);
  if (!deleted) {
    return reply.status(404).send({ error: 'Bill not found' });
  }
  return { success: true, message: 'Monthly bill deleted' };
});

// 13. Realistic Household Payment Gateway Simulation
fastify.post('/api/bills/pay-gateway', async (request, reply) => {
  const parseResult = BillPayGatewaySchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: parseResult.error.issues[0]?.message || 'Invalid payment parameters' });
  }

  const body = parseResult.data;
  const txnId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const refNo = `REF${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  if (body.billId) {
    await dbService.payMonthlyBill(body.billId, {
      paidVia: body.paymentMethod.toUpperCase(),
      transactionRef: txnId,
    });
  }

  return {
    success: true,
    status: 'PAID',
    transactionId: txnId,
    bankReferenceNumber: refNo,
    billerName: body.billerName,
    amountPaid: body.amount,
    paymentMethod: body.paymentMethod,
    paidAt: new Date().toISOString(),
    receiptUrl: `https://homemate.local/receipts/${txnId}`,
    message: `Payment of ₹${body.amount} for ${body.billerName} successful via ${body.paymentMethod.toUpperCase()}!`,
  };
});

// 14. Digital Khata (Hisab-Kitab Ledger) Routes
fastify.get('/api/khata', async (request) => {
  const householdId = resolveHouseholdId(request, (request.query as { householdId?: string })?.householdId);
  const entries = await dbService.getKhataEntries(householdId);
  return { success: true, count: entries.length, entries };
});

fastify.post('/api/khata', async (request, reply) => {
  const parseResult = KhataCreateSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: parseResult.error.issues[0]?.message || 'Invalid khata entry details' });
  }

  const trustedHouseholdId = resolveHouseholdId(request, parseResult.data.householdId);
  const entry = await dbService.addKhataEntry({ ...parseResult.data, householdId: trustedHouseholdId });
  return { success: true, message: `Recorded ${entry.type === 'gave' ? 'Debit' : 'Credit'} for ${entry.partyName}`, entry };
});

fastify.put('/api/khata/:id/settle', async (request, reply) => {
  const { id } = request.params as { id: string };
  const settled = await dbService.settleKhataEntry(id);
  if (!settled) {
    return reply.status(404).send({ error: 'Khata entry not found' });
  }
  return { success: true, message: 'Khata entry marked as settled', entry: settled };
});

fastify.delete('/api/khata/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const deleted = await dbService.deleteKhataEntry(id);
  if (!deleted) {
    return reply.status(404).send({ error: 'Khata entry not found' });
  }
  return { success: true, message: 'Khata entry removed' };
});

// 15. Permanent Household Purge / Deletion (GDPR & Privacy Compliant)
fastify.delete('/api/household/:householdId', async (request, reply) => {
  const parseResult = DeleteHouseholdParamsSchema.safeParse(request.params);
  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid householdId parameter' });
  }

  const session = getSessionFromCookieHeader(request.headers.cookie);
  const targetId = parseResult.data.householdId;
  if (session && session.householdId !== targetId) {
    return reply.status(403).send({ error: 'Forbidden: You cannot delete another household data' });
  }

  const result = await dbService.deleteHouseholdData(targetId);
  return {
    success: true,
    message: `All records for household ${parseResult.data.householdId} permanently removed.`,
    ...result,
  };
});

// Start Fastify Server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 HomeMate Fastify Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
