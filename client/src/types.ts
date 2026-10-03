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
  password?: string;
  displayName: string;
  role: 'admin' | 'member';
  householdId: string;
  householdName: string;
  mode: AppMode;
  avatar?: string;
}

export interface Household {
  id: string;
  name: string;
  mode: AppMode;
  accessCode: string;
  adminUsername: string;
  members: string[]; // list of usernames or display names
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

export interface Prescription {
  id: string;
  doctorName: string;
  clinicOrHospital: string;
  date: string;
  notes: string;
  prescribedMedicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  imageUrl?: string;
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
