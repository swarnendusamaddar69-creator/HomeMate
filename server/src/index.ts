import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

// Register plugins
await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

await fastify.register(multipart, {
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB photo upload limit
  },
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
  return {
    status: 'healthy',
    service: 'HomeMate Backend Engine',
    version: '1.0.0',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    databaseConfigured: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString(),
  };
});

// 2. Gemini API Key Configuration Routes
fastify.get('/api/config/gemini-key', async () => {
  const key = process.env.GEMINI_API_KEY || '';
  return {
    configured: !!key,
    preview: key ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}` : null,
  };
});

fastify.post('/api/config/gemini-key', async (request, reply) => {
  const { apiKey } = (request.body as { apiKey: string }) || {};

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
    return reply.status(400).send({ error: 'Please provide a valid Gemini API key' });
  }

  const cleanKey = apiKey.trim();
  process.env.GEMINI_API_KEY = cleanKey;

  // Persist to .env file in server root
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${cleanKey}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${cleanKey}\n`;
      }
    } else {
      envContent = `PORT=4000\nGEMINI_API_KEY=${cleanKey}\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
  } catch (err) {
    fastify.log.warn({ err }, 'Could not write to .env file, key stored in memory');
  }

  return {
    success: true,
    configured: true,
    message: 'Google Gemini API Key successfully saved and activated!',
    preview: `${cleanKey.substring(0, 6)}...${cleanKey.substring(cleanKey.length - 4)}`,
  };
});

// 3. Real Multimodal Fridge & Pantry Vision Scan
fastify.post('/api/scan/fridge', async (request, reply) => {
  try {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No image file uploaded' });
    }

    const buffer = await data.toBuffer();
    const apiKey = process.env.GEMINI_API_KEY;

    // REAL GOOGLE GEMINI VISION SCAN
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-3.8-flash for high-speed, modern multimodal vision
        let model = genAI.getGenerativeModel({
          model: 'gemini-3.8-flash',
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const prompt = `You are HomeMate Multimodal Household Vision AI.
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

        const candidateModels = [
          'gemini-3.8-flash',
          'gemini-3.5-flash',
          'gemini-3.1-flash-lite',
          'gemini-flash-lite-latest',
        ];

        let result: any = null;
        let successfulModel = '';
        let lastError: any = null;

        for (const modelName of candidateModels) {
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
                  mimeType: data.mimetype || 'image/jpeg',
                },
              },
            ]);

            if (result && result.response) {
              successfulModel = modelName;
              break;
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`Model ${modelName} encountered error (${err.status || err.message}), trying next candidate...`);
          }
        }

        if (!result) {
          throw lastError || new Error('All candidate vision models failed to respond');
        }

        let text = result.response.text().trim();
        if (text.startsWith('```json')) {
          text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (text.startsWith('```')) {
          text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(text);

        return reply.status(200).send({
          timestamp: new Date().toISOString(),
          source: `${successfulModel}-vision`,
          isRealAi: true,
          detectedItems: parsed.detectedItems || [],
          suggestedShopping: parsed.suggestedShopping || [],
          recipeIdea: parsed.recipeIdea || null,
        });
      } catch (geminiError: any) {
        console.error('Detailed Gemini Vision API error:', geminiError);
        return reply.status(200).send({
          timestamp: new Date().toISOString(),
          source: 'gemini-error-fallback',
          isRealAi: false,
          errorNotice: `Gemini API Error: ${geminiError.message || 'Failed to call Gemini'}. Showing fallback detection.`,
          detectedItems: getRealisticFallbackItems(),
          suggestedShopping: [
            { title: 'Milk', quantity: '1 packet', reason: 'Low stock detected' },
            { title: 'Fresh Produce', quantity: '1 kg', reason: 'Restock needed' },
          ],
          recipeIdea: {
            title: 'Simple Vegetable Stir-Fry & Toast',
            costEstimate: '₹35 total',
            readyInMinutes: 10,
            ingredientsNeeded: ['Vegetables', 'Bread', 'Butter', 'Spices'],
          },
        });
      }
    }

    // Fallback when no Gemini API key is configured yet
    return reply.status(200).send({
      timestamp: new Date().toISOString(),
      source: 'simulation-engine',
      isRealAi: false,
      notice: 'Gemini API Key not configured. Add your key to enable live AI vision recognition.',
      detectedItems: getRealisticFallbackItems(),
      suggestedShopping: [
        { title: 'Amul Milk', quantity: '1 packet', reason: 'Fridge scan: low level detected' },
        { title: 'Tomatoes', quantity: '1 kg', reason: 'Fridge scan: only 2 left in crisper' },
      ],
      recipeIdea: {
        title: 'Quick Dahi Aloo & Paratha',
        costEstimate: '₹42 total',
        readyInMinutes: 15,
        ingredientsNeeded: ['Potatoes', 'Curd', 'Green Chillies', 'Spices'],
      },
    });
  } catch (err: any) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Failed to process fridge scan', message: err.message });
  }
});

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
  const body = request.body as { tool: string; payload: Record<string, any> };
  const undoToken = `undo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

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
  const { undoToken } = request.body as { undoToken: string };
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
fastify.post('/api/kirana/export', async (request) => {
  const { items, language, address } = request.body as {
    items: { title: string; quantity: string }[];
    language?: 'en' | 'hi' | 'bn';
    address?: string;
  };

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
