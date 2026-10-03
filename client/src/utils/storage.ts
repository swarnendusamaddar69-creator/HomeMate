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
