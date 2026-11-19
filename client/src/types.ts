export type AppMode = 'elder' | 'hostel' | 'family';
export type Language = 'en' | 'hi' | 'bn';
export type ItemLevel = 'plenty' | 'half' | 'low' | 'empty';

export interface PantryItem {
  id: string;
  name: string;
  localName: string;
  category: 'vegetables' | 'dairy' | 'staples' | 'spices' | 'snacks' | 'other';
  level: ItemLevel;
  expiryDays?: number;
  locationHint?: string;
  confidence: number;
  lastUpdated: string;
}

export interface ShoppingItem {
  id: string;
  title: string;
  localTitle?: string;
  quantity?: string;
  category: string;
  addedBy: string;
  status: 'pending' | 'bought';
  reason: 'scan' | 'voice' | 'manual' | 'routine';
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  scheduleTimes: string[]; // e.g. ["08:30 AM", "08:30 PM"]
  pillColor: string;
  pillPhoto?: string;
  currentStock: number;
  refillThreshold: number;
  todayStatus: 'pending' | 'taken' | 'skipped';
  // Med pack intelligence & prescription scheduling
  packSize?: number; // total units in pack (e.g. 10 tabs, 15 tabs, 30 capsules)
  dailyDosageCount?: number; // pills taken per day
  prescribedBy?: string; // doctor name / clinic
  prescriptionId?: string;
  isAvailable?: boolean; // false if med is unavailable at chemist
  substituteNote?: string;
  startDate?: string;
  estimatedRunOutDate?: string;
  lastRefillDate?: string;
}

export interface ElderTodo {
  id: string;
  task: string;
  category: 'health' | 'routine' | 'wellness' | 'family';
  time: string;
  completed: boolean;
  notificationEnabled?: boolean;
}

export interface HostelChore {
  id: string;
  task: string;
  assignee: string;
  room: string;
  dueDate: string;
  status: 'pending' | 'completed';
  skipCount: number;
}

export interface HostelExpense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  splitWith: string[];
  upiId: string;
  settled: boolean;
  date: string;
}

export interface MessMenuDay {
  day: string;
  lunch: string;
  dinner: string;
  skippedDinnerToday?: boolean;
}

export interface DetectedFridgeItem {
  name: string;
  localName: string;
  category: PantryItem['category'];
  level: ItemLevel;
  confidence: number;
  isUncertain?: boolean;
  shelfLocation: string;
  note?: string;
}

export interface ScanResponse {
  timestamp: string;
  detectedItems: DetectedFridgeItem[];
  suggestedShopping: { title: string; quantity: string; reason: string }[];
  recipeIdea?: { title: string; costEstimate: string; readyInMinutes: number; ingredientsNeeded: string[] };
}

export interface BackendHealth {
  status: string;
  service: string;
  version: string;
  geminiConfigured: boolean;
  databaseConfigured: boolean;
  timestamp: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  password?: string;
  displayName: string;
  role: 'admin' | 'member';
  householdId: string;
  householdName: string;
  mode: AppMode;
  avatar?: string;
  city?: string;
  createdAt?: string;
}

export interface Household {
  id: string;
  name: string;
  mode: AppMode;
  accessCode: string;
  adminUsername: string;
  members: string[]; // list of usernames or display names
  city?: string;
  createdAt?: string;
}

export interface FamilyChore {
  id: string;
  task: string;
  assignedTo: string;
  dueDate: string;
  category: 'cleaning' | 'kitchen' | 'shopping' | 'repairs' | 'plants' | 'other';
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  points: number;
}

export interface SplitwiseDebt {
  from: string;
  to: string;
  amount: number;
  fromUpi?: string;
  toUpi?: string;
}

export interface PrescribedMedicineItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing?: string[]; // e.g. ["08:30 AM", "08:30 PM"]
  beforeAfterFood?: 'before_food' | 'after_food' | 'with_food';
  packSize?: number;
  dailyDosageCount?: number;
  isAvailable?: boolean;
  substituteNote?: string;
  pillColor?: string;
}

export interface Prescription {
  id: string;
  doctorName: string;
  clinicOrHospital: string;
  date: string;
  notes: string;
  prescribedMedicines: PrescribedMedicineItem[];
  imageUrl?: string;
}

export interface PrescriptionScanResponse {
  timestamp: string;
  doctorName: string;
  clinicOrHospital: string;
  date: string;
  notes?: string;
  prescribedMedicines: PrescribedMedicineItem[];
  isRealAi?: boolean;
  source?: string;
  errorNotice?: string;
}

export interface MedicineToBuy {
  id: string;
  name: string;
  dosage: string;
  quantity: string;
  prescribedBy?: string;
  urgency: 'high' | 'medium' | 'routine';
  status: 'needed' | 'ordered' | 'received';
  estimatedCost: number;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: 'groceries' | 'chores' | 'bills' | 'meds' | 'maintenance' | 'other';
  date: string;
  source: string;
  paidBy?: string;
}

export interface HouseholdEnvironment {
  temp: number;
  indoorTemp: number;
  humidity: number;
  aqi: number;
  condition: 'Sunny' | 'Pleasant' | 'Humid' | 'Cool';
  tips: string;
}

export interface FamilyMemberRecord {
  id: string;
  householdId: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  accountNumber?: string;
  upiId?: string;
  bankName?: string;
  ifscCode?: string;
  emergencyContact: boolean;
  notes?: string;
  createdAt: string;
}

export interface LinkedBlinkitAccount {
  phoneNumber: string;
  customerName: string;
  deliveryAddress: string;
  pincode: string;
  landmark?: string;
  darkStoreLocation?: string;
  isLinked: boolean;
  linkedAt: string;
  blinkitClubMember?: boolean;
  savedPaymentMethod?: string;
}

export interface AccountInfoRecord {
  id: string;
  householdId: string;
  userId?: string;
  accountHolder: string;
  accountType: 'bank' | 'upi' | 'card' | 'wallet';
  accountNumberOrId: string;
  bankOrProvider: string;
  ifscOrHandle?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
}

export interface DatabaseStatus {
  status: string;
  engine: string;
  databaseConfigured: boolean;
  totalFamilyMembers: number;
  totalAccounts: number;
  totalBills?: number;
  totalKhataEntries?: number;
  filePath?: string | null;
  lastSync: string;
}

export interface MonthlyBillRecord {
  id: string;
  householdId: string;
  title: string;
  category: 'rent' | 'electricity' | 'wifi' | 'gas' | 'salary' | 'maintenance' | 'water' | 'subscription' | 'medical' | 'groceries' | 'other';
  amount: number;
  dueDay: number; // 1 - 31
  dueDate: string; // e.g. "2026-11-05"
  status: 'pending' | 'due_soon' | 'overdue' | 'paid';
  paidDate?: string;
  paidVia?: string; // 'UPI' | 'Card' | 'Net Banking' | 'BBPS' | 'Cash'
  transactionRef?: string;
  billerAccount?: string;
  autoReminder: boolean;
  notes?: string;
  createdAt: string;
}

export interface KhataRecord {
  id: string;
  householdId: string;
  partyName: string;
  partyPhone?: string;
  partyRole: 'kirana' | 'milkman' | 'subziwala' | 'domestic_help' | 'flatmate' | 'technician' | 'other';
  type: 'gave' | 'got'; // 'gave' = Maine Diye / Debit (-₹), 'got' = Maine Liye / Credit (+₹)
  amount: number;
  description: string;
  date: string;
  settled: boolean;
  settledDate?: string;
  upiId?: string;
  createdAt: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  status: string;
  transactionId: string;
  bankReferenceNumber: string;
  billerName: string;
  amountPaid: number;
  paymentMethod: string;
  paidAt: string;
  receiptUrl: string;
  message: string;
}
