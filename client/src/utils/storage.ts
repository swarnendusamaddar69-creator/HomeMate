import {
  PantryItem,
  ShoppingItem,
  Medicine,
  HostelChore,
  HostelExpense,
  MessMenuDay,
  ElderTodo,
  UserAccount,
  Household,
  FamilyChore,
  Prescription,
  MedicineToBuy,
  FamilyMemberRecord,
  AccountInfoRecord,
  LinkedBlinkitAccount,
} from '../types';

// Real-World Production Architecture: All initial state is raw & empty until provided by users
export const INITIAL_PANTRY: PantryItem[] = [];
export const INITIAL_PANTRY_ELDER: PantryItem[] = [];
export const INITIAL_PANTRY_HOSTEL: PantryItem[] = [];
export const INITIAL_PANTRY_FAMILY: PantryItem[] = [];

export const INITIAL_SHOPPING: ShoppingItem[] = [];
export const INITIAL_SHOPPING_ELDER: ShoppingItem[] = [];
export const INITIAL_SHOPPING_HOSTEL: ShoppingItem[] = [];
export const INITIAL_SHOPPING_FAMILY: ShoppingItem[] = [];

export const INITIAL_MEDICINES: Medicine[] = [];
export const INITIAL_ELDER_TODOS: ElderTodo[] = [];
export const INITIAL_HOSTEL_CHORES: HostelChore[] = [];
export const INITIAL_HOSTEL_EXPENSES: HostelExpense[] = [];
export const INITIAL_MESS_MENU: MessMenuDay[] = [];
export const INITIAL_FAMILY_CHORES: FamilyChore[] = [];
export const INITIAL_PRESCRIPTIONS: Prescription[] = [];
export const INITIAL_MEDS_TO_BUY: MedicineToBuy[] = [];

export const DEFAULT_HOUSEHOLDS: Household[] = [];
export const DEFAULT_USERS: UserAccount[] = [];

export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(`homemate_${key}`);
    return val ? JSON.parse(val) : defaultValue;
  } catch (err) {
    console.warn(`Error reading localStorage for ${key}:`, err);
    return defaultValue;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`homemate_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving localStorage for ${key}:`, err);
  }
}

export function getAllUsers(): UserAccount[] {
  return getStoredData<UserAccount[]>('users_v3', []);
}

export function saveAllUsers(users: UserAccount[]): void {
  saveStoredData('users_v3', users);
}

export function getAllHouseholds(): Household[] {
  return getStoredData<Household[]>('households_v3', []);
}

export function saveAllHouseholds(households: Household[]): void {
  saveStoredData('households_v3', households);
}

export function getCurrentUser(): UserAccount | null {
  return getStoredData<UserAccount | null>('current_user_v3', null);
}

export function setCurrentUser(user: UserAccount | null): void {
  saveStoredData('current_user_v3', user);
}

export function getStoredFamilyMembers(): FamilyMemberRecord[] {
  return getStoredData<FamilyMemberRecord[]>('family_members_v3', [
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
  ]);
}

export function saveStoredFamilyMembers(members: FamilyMemberRecord[]): void {
  saveStoredData('family_members_v3', members);
}

export function getStoredAccounts(): AccountInfoRecord[] {
  return getStoredData<AccountInfoRecord[]>('accounts_v3', [
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
  ]);
}

export function saveStoredAccounts(accounts: AccountInfoRecord[]): void {
  saveStoredData('accounts_v3', accounts);
}

// ── Linked Blinkit Account ──
export function getLinkedBlinkitAccount(): LinkedBlinkitAccount | null {
  return getStoredData<LinkedBlinkitAccount | null>('blinkit_linked_acc_v1', {
    phoneNumber: '+91 98765 43210',
    customerName: 'Swarnendu Samaddar',
    deliveryAddress: 'Flat 402, Green Glen Layout, Outer Ring Road, Bellandur',
    pincode: '560103',
    landmark: 'Opposite Central Mall',
    darkStoreLocation: 'Blinkit Bellandur Darkstore #14 (ETA 8 mins)',
    isLinked: true,
    linkedAt: new Date().toISOString(),
    blinkitClubMember: true,
    savedPaymentMethod: 'UPI (swarnendu@okhdfcbank)',
  });
}

export function saveLinkedBlinkitAccount(acc: LinkedBlinkitAccount | null): void {
  saveStoredData('blinkit_linked_acc_v1', acc);
}
