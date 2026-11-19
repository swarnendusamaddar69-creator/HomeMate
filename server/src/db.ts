import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

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

export interface DatabaseSchema {
  version: number;
  familyMembers: FamilyMemberRecord[];
  accounts: AccountInfoRecord[];
  bills: MonthlyBillRecord[];
  khataEntries: KhataRecord[];
  updatedAt: string;
}

// Ensure persistent data directory exists
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(currentDir, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbFilePath = path.join(dataDir, 'database.json');

// Initial seed state: clean slate so users start from scratch
const initialDbState: DatabaseSchema = {
  version: 2,
  familyMembers: [
    {
      id: 'mem_1',
      householdId: 'family_household',
      name: 'Ramesh Sharma',
      relationship: 'Grandparent (Dada ji)',
      email: 'ramesh.sharma@homemate.ai',
      phone: '+91 98301 22344',
      accountNumber: '••••••••4812',
      upiId: 'ramesh.sharma@okhdfcbank',
      bankName: 'HDFC Bank',
      emergencyContact: true,
      notes: 'Blood pressure medicine at 8:30 AM and 8:30 PM. Needs low sodium diet.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mem_2',
      householdId: 'family_household',
      name: 'Pooja Sharma',
      relationship: 'Mother',
      email: 'pooja.sharma@homemate.ai',
      phone: '+91 98302 33455',
      accountNumber: '••••••••9104',
      upiId: 'pooja.s@icici',
      bankName: 'ICICI Bank',
      emergencyContact: true,
      notes: 'Oversees pantry restock and weekly Kirana orders.',
      createdAt: new Date().toISOString(),
    },
  ],
  accounts: [
    {
      id: 'acc_1',
      householdId: 'family_household',
      accountHolder: 'Ramesh Sharma',
      accountType: 'upi',
      accountNumberOrId: 'ramesh.sharma@okhdfcbank',
      bankOrProvider: 'HDFC Bank (UPI)',
      isPrimary: true,
      notes: 'Primary household grocery & medical reimbursement account',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'acc_2',
      householdId: 'family_household',
      accountHolder: 'Pooja Sharma',
      accountType: 'bank',
      accountNumberOrId: '50100492819412',
      bankOrProvider: 'ICICI Bank (Savings)',
      ifscOrHandle: 'ICIC0000104',
      isPrimary: false,
      notes: 'Utility bills & maintenance account',
      createdAt: new Date().toISOString(),
    },
  ],
  // Starting from scratch for monthly automated expenses
  bills: [],
  // Starting from scratch for digital khata
  khataEntries: [],
  updatedAt: new Date().toISOString(),
};

// PostgreSQL pool instance if DATABASE_URL is configured
let pgPool: pg.Pool | null = null;
let usePg = false;

if (process.env.DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
    usePg = true;
  } catch (err) {
    console.warn('⚠️ Could not connect to PostgreSQL, falling back to persistent JSON storage:', err);
    usePg = false;
  }
}

// File database helpers
function readFileDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(dbFilePath)) {
      writeFileDb(initialDbState);
      return initialDbState;
    }
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed.bills) parsed.bills = [];
    if (!parsed.khataEntries) parsed.khataEntries = [];
    return parsed;
  } catch (err) {
    console.error('Error reading JSON database file, returning default state:', err);
    return initialDbState;
  }
}

function writeFileDb(state: DatabaseSchema): void {
  try {
    state.updatedAt = new Date().toISOString();
    const tempFile = `${dbFilePath}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tempFile, dbFilePath);
  } catch (err) {
    console.error('Error writing JSON database file:', err);
  }
}

// Public Database Service
export const dbService = {
  getStorageEngine(): 'postgresql' | 'persistent-file' {
    return usePg ? 'postgresql' : 'persistent-file';
  },

  async getStatus() {
    const mems = await this.getFamilyMembers();
    const accs = await this.getAccounts();
    const bills = await this.getMonthlyBills();
    const khata = await this.getKhataEntries();
    return {
      status: 'connected',
      engine: this.getStorageEngine(),
      databaseConfigured: true,
      totalFamilyMembers: mems.length,
      totalAccounts: accs.length,
      totalBills: bills.length,
      totalKhataEntries: khata.length,
      filePath: usePg ? null : dbFilePath,
      lastSync: new Date().toISOString(),
    };
  },

  // ── Family Members ──
  async getFamilyMembers(householdId?: string): Promise<FamilyMemberRecord[]> {
    const db = readFileDb();
    if (!householdId) return db.familyMembers;
    return db.familyMembers.filter(
      (m) => !m.householdId || m.householdId === householdId || m.householdId === 'family_household'
    );
  },

  async addFamilyMember(member: Omit<FamilyMemberRecord, 'id' | 'createdAt'>): Promise<FamilyMemberRecord> {
    const newMember: FamilyMemberRecord = {
      ...member,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const db = readFileDb();
    db.familyMembers.unshift(newMember);
    writeFileDb(db);
    return newMember;
  },

  async updateFamilyMember(id: string, updates: Partial<FamilyMemberRecord>): Promise<FamilyMemberRecord | null> {
    const db = readFileDb();
    const index = db.familyMembers.findIndex((m) => m.id === id);
    if (index === -1) return null;
    db.familyMembers[index] = { ...db.familyMembers[index], ...updates };
    writeFileDb(db);
    return db.familyMembers[index];
  },

  async deleteFamilyMember(id: string): Promise<boolean> {
    const db = readFileDb();
    const initLen = db.familyMembers.length;
    db.familyMembers = db.familyMembers.filter((m) => m.id !== id);
    writeFileDb(db);
    return db.familyMembers.length < initLen;
  },

  // ── Accounts ──
  async getAccounts(householdId?: string): Promise<AccountInfoRecord[]> {
    const db = readFileDb();
    if (!householdId) return db.accounts;
    return db.accounts.filter(
      (a) => !a.householdId || a.householdId === householdId || a.householdId === 'family_household'
    );
  },

  async addAccount(account: Omit<AccountInfoRecord, 'id' | 'createdAt'>): Promise<AccountInfoRecord> {
    const newAccount: AccountInfoRecord = {
      ...account,
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const db = readFileDb();
    if (newAccount.isPrimary) {
      db.accounts = db.accounts.map((a) =>
        a.householdId === newAccount.householdId ? { ...a, isPrimary: false } : a
      );
    }
    db.accounts.unshift(newAccount);
    writeFileDb(db);
    return newAccount;
  },

  async deleteAccount(id: string): Promise<boolean> {
    const db = readFileDb();
    const initLen = db.accounts.length;
    db.accounts = db.accounts.filter((a) => a.id !== id);
    writeFileDb(db);
    return db.accounts.length < initLen;
  },

  // ── Automated Monthly Bills & Reminders ──
  async getMonthlyBills(householdId?: string): Promise<MonthlyBillRecord[]> {
    const db = readFileDb();
    let list = db.bills || [];
    if (householdId) {
      list = list.filter((b) => !b.householdId || b.householdId === householdId || b.householdId === 'family_household');
    }

    // Auto-compute status based on today's date
    const now = new Date();
    const currentDay = now.getDate();

    return list.map((b) => {
      if (b.status === 'paid') return b;
      if (currentDay > b.dueDay) {
        return { ...b, status: 'overdue' };
      } else if (b.dueDay - currentDay <= 3) {
        return { ...b, status: 'due_soon' };
      } else {
        return { ...b, status: 'pending' };
      }
    });
  },

  async addMonthlyBill(bill: Omit<MonthlyBillRecord, 'id' | 'createdAt' | 'status' | 'dueDate'>): Promise<MonthlyBillRecord> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(Math.min(31, Math.max(1, bill.dueDay))).padStart(2, '0');
    const dueDate = `${year}-${month}-${day}`;

    const currentDay = now.getDate();
    let status: MonthlyBillRecord['status'] = 'pending';
    if (currentDay > bill.dueDay) status = 'overdue';
    else if (bill.dueDay - currentDay <= 3) status = 'due_soon';

    const newBill: MonthlyBillRecord = {
      ...bill,
      id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dueDate,
      status,
      createdAt: new Date().toISOString(),
    };

    const db = readFileDb();
    db.bills = db.bills || [];
    db.bills.unshift(newBill);
    writeFileDb(db);
    return newBill;
  },

  async payMonthlyBill(id: string, paymentDetails: { paidVia: string; transactionRef?: string }): Promise<MonthlyBillRecord | null> {
    const db = readFileDb();
    const index = (db.bills || []).findIndex((b) => b.id === id);
    if (index === -1) return null;

    db.bills[index] = {
      ...db.bills[index],
      status: 'paid',
      paidDate: new Date().toISOString(),
      paidVia: paymentDetails.paidVia,
      transactionRef: paymentDetails.transactionRef || `TXN${Date.now()}`,
    };
    writeFileDb(db);
    return db.bills[index];
  },

  async deleteMonthlyBill(id: string): Promise<boolean> {
    const db = readFileDb();
    const initLen = (db.bills || []).length;
    db.bills = (db.bills || []).filter((b) => b.id !== id);
    writeFileDb(db);
    return db.bills.length < initLen;
  },

  // ── Digital Khata (Hisab-Kitab Ledger) ──
  async getKhataEntries(householdId?: string): Promise<KhataRecord[]> {
    const db = readFileDb();
    const list = db.khataEntries || [];
    if (!householdId) return list;
    return list.filter((k) => !k.householdId || k.householdId === householdId || k.householdId === 'family_household');
  },

  async addKhataEntry(entry: Omit<KhataRecord, 'id' | 'createdAt' | 'settled'>): Promise<KhataRecord> {
    const newEntry: KhataRecord = {
      ...entry,
      id: `khata_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      settled: false,
      createdAt: new Date().toISOString(),
    };
    const db = readFileDb();
    db.khataEntries = db.khataEntries || [];
    db.khataEntries.unshift(newEntry);
    writeFileDb(db);
    return newEntry;
  },

  async settleKhataEntry(id: string): Promise<KhataRecord | null> {
    const db = readFileDb();
    const index = (db.khataEntries || []).findIndex((k) => k.id === id);
    if (index === -1) return null;

    db.khataEntries[index] = {
      ...db.khataEntries[index],
      settled: true,
      settledDate: new Date().toISOString(),
    };
    writeFileDb(db);
    return db.khataEntries[index];
  },

  async deleteKhataEntry(id: string): Promise<boolean> {
    const db = readFileDb();
    const initLen = (db.khataEntries || []).length;
    db.khataEntries = (db.khataEntries || []).filter((k) => k.id !== id);
    writeFileDb(db);
    return db.khataEntries.length < initLen;
  },

  // ── Household Data Purge / Erasure ──
  async deleteHouseholdData(householdId: string): Promise<{
    deletedMembers: number;
    deletedAccounts: number;
    deletedBills: number;
    deletedKhata: number;
  }> {
    const db = readFileDb();
    const origM = (db.familyMembers || []).length;
    const origA = (db.accounts || []).length;
    const origB = (db.bills || []).length;
    const origK = (db.khataEntries || []).length;

    db.familyMembers = (db.familyMembers || []).filter((m) => m.householdId !== householdId);
    db.accounts = (db.accounts || []).filter((a) => a.householdId !== householdId);
    db.bills = (db.bills || []).filter((b) => b.householdId !== householdId);
    db.khataEntries = (db.khataEntries || []).filter((k) => k.householdId !== householdId);

    writeFileDb(db);
    return {
      deletedMembers: origM - (db.familyMembers || []).length,
      deletedAccounts: origA - (db.accounts || []).length,
      deletedBills: origB - (db.bills || []).length,
      deletedKhata: origK - (db.khataEntries || []).length,
    };
  },
};
