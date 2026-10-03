import { PantryItem, ShoppingItem, Medicine, HostelChore, HostelExpense, MessMenuDay, ElderTodo, UserAccount, Household, FamilyChore, Prescription, MedicineToBuy } from '../types';

export const INITIAL_PANTRY: PantryItem[] = [
  { id: 'p-1', name: 'Fresh Milk', localName: 'Milk (Amul Taaza 1L)', category: 'dairy', level: 'low', expiryDays: 1, locationHint: 'Door bottom rack', confidence: 0.96, lastUpdated: 'Today, 8:00 AM' },
  { id: 'p-2', name: 'Curd / Dahi', localName: 'Curd (Mother Dairy)', category: 'dairy', level: 'half', expiryDays: 2, locationHint: 'Middle rack', confidence: 0.94, lastUpdated: 'Yesterday' },
  { id: 'p-3', name: 'Farm Eggs', localName: 'Eggs (Carton 6 pcs)', category: 'dairy', level: 'plenty', expiryDays: 8, locationHint: 'Egg tray', confidence: 0.98, lastUpdated: '2 days ago' },
  { id: 'p-4', name: 'Tomatoes', localName: 'Fresh Country Tomatoes', category: 'vegetables', level: 'low', expiryDays: 3, locationHint: 'Crisper drawer', confidence: 0.91, lastUpdated: 'Yesterday' },
  { id: 'p-5', name: 'Potatoes (Aloo)', localName: 'Aloo / Potatoes (5kg bag)', category: 'vegetables', level: 'plenty', expiryDays: 14, locationHint: 'Vegetable basket', confidence: 0.99, lastUpdated: '3 days ago' },
  { id: 'p-6', name: 'Steel Dabba (Chana Dal)', localName: 'Chana Dal (Steel Container)', category: 'staples', level: 'half', expiryDays: 60, locationHint: 'Pantry Shelf 2 (Steel Box)', confidence: 0.85, lastUpdated: 'Verified by User' },
];

export const INITIAL_PANTRY_ELDER: PantryItem[] = [
  { id: 'pe-1', name: 'Low-Fat Cow Milk (500ml)', localName: 'Cow Milk', category: 'dairy', level: 'half', expiryDays: 1, locationHint: 'Fridge Door Shelf', confidence: 0.97, lastUpdated: 'Today, 8:00 AM' },
  { id: 'pe-2', name: 'Fresh Curd / Dahi', localName: 'Mother Dairy Curd', category: 'dairy', level: 'half', expiryDays: 2, locationHint: 'Top shelf', confidence: 0.95, lastUpdated: 'Yesterday' },
  { id: 'pe-3', name: 'Yellow Moong Dal Container', localName: 'Moong Dal Jar', category: 'staples', level: 'plenty', expiryDays: 45, locationHint: 'Pantry Shelf 1', confidence: 0.91, lastUpdated: '2 days ago' },
  { id: 'pe-4', name: 'Sweet Kashmiri Apples', localName: 'Red Apples (3 pcs)', category: 'vegetables', level: 'low', expiryDays: 4, locationHint: 'Dining fruit basket', confidence: 0.93, lastUpdated: 'Yesterday' },
];

export const INITIAL_PANTRY_HOSTEL: PantryItem[] = [
  { id: 'ph-1', name: 'Farm Fresh Eggs', localName: 'Eggs (4 left)', category: 'dairy', level: 'half', expiryDays: 6, locationHint: 'Fridge Egg Tray', confidence: 0.98, lastUpdated: 'Today' },
  { id: 'ph-2', name: 'Maggi Noodles', localName: 'Maggi (2 pkts)', category: 'snacks', level: 'low', expiryDays: 90, locationHint: 'Cupboard Snack Box', confidence: 0.95, lastUpdated: 'Yesterday' },
  { id: 'ph-3', name: 'Whole Wheat Bread', localName: 'Bread (Half loaf)', category: 'staples', level: 'low', expiryDays: 2, locationHint: 'Kitchen counter', confidence: 0.93, lastUpdated: 'Yesterday' },
  { id: 'ph-4', name: 'Nescafe Classic Coffee', localName: 'Coffee Jar', category: 'staples', level: 'plenty', expiryDays: 120, locationHint: 'Balcony Shelf', confidence: 0.89, lastUpdated: '3 days ago' },
];

export const INITIAL_PANTRY_FAMILY: PantryItem[] = [
  { id: 'pf-1', name: 'Fresh Milk', localName: 'Milk (Amul Taaza 1L)', category: 'dairy', level: 'low', expiryDays: 1, locationHint: 'Door bottom rack', confidence: 0.96, lastUpdated: 'Today, 8:00 AM' },
  { id: 'pf-2', name: 'Curd / Dahi', localName: 'Curd (Mother Dairy)', category: 'dairy', level: 'half', expiryDays: 2, locationHint: 'Middle rack', confidence: 0.94, lastUpdated: 'Yesterday' },
  { id: 'pf-3', name: 'Fresh Country Tomatoes', localName: 'Tomatoes', category: 'vegetables', level: 'low', expiryDays: 3, locationHint: 'Crisper drawer', confidence: 0.91, lastUpdated: 'Yesterday' },
  { id: 'pf-4', name: 'Potatoes (Aloo 5kg)', localName: 'Aloo Basket', category: 'vegetables', level: 'plenty', expiryDays: 14, locationHint: 'Vegetable basket', confidence: 0.99, lastUpdated: '3 days ago' },
  { id: 'pf-5', name: 'Steel Dabba (Chana Dal)', localName: 'Chana Dal', category: 'staples', level: 'half', expiryDays: 60, locationHint: 'Pantry Shelf 2', confidence: 0.85, lastUpdated: 'Verified by Mom' },
];

export const INITIAL_SHOPPING: ShoppingItem[] = [
  { id: 's-1', title: 'Milk (1 Litre)', localTitle: 'Amul Taaza Milk', quantity: '1 packet', category: 'dairy', addedBy: 'Fridge Scan', status: 'pending', reason: 'scan' },
  { id: 's-2', title: 'Tomatoes', localTitle: 'Fresh Tomatoes', quantity: '1 kg', category: 'vegetables', addedBy: 'Fridge Scan', status: 'pending', reason: 'scan' },
  { id: 's-3', title: 'Ginger & Green Chillies', localTitle: 'Adrak & Hari Mirch', quantity: '250g', category: 'vegetables', addedBy: 'Voice HUD', status: 'pending', reason: 'voice' },
  { id: 's-4', title: 'Whole Wheat Bread', localTitle: 'Brown Bread', quantity: '1 loaf', category: 'staples', addedBy: 'Manual', status: 'pending', reason: 'manual' },
];

export const INITIAL_SHOPPING_ELDER: ShoppingItem[] = [
  { id: 'se-1', title: 'Low-Fat Cow Milk (500ml)', localTitle: 'Cow Milk', quantity: '1 packet', category: 'dairy', addedBy: 'Daily Kirana', status: 'pending', reason: 'manual' },
  { id: 'se-2', title: 'Ripe Papaya & Soft Fruits', localTitle: 'Papaya', quantity: '1 kg', category: 'vegetables', addedBy: 'Diet Routine', status: 'pending', reason: 'manual' },
  { id: 'se-3', title: 'Digestive Marie Biscuits', localTitle: 'Marie Gold', quantity: '1 pack', category: 'snacks', addedBy: 'Tea Routine', status: 'pending', reason: 'manual' },
  { id: 'se-4', title: 'Ginger & Fresh Tulsi Leaves', localTitle: 'Adrak & Tulsi', quantity: '200g', category: 'vegetables', addedBy: 'Immunity Routine', status: 'pending', reason: 'voice' },
];

export const INITIAL_SHOPPING_HOSTEL: ShoppingItem[] = [
  { id: 'sh-1', title: 'Maggi 2-Minute Noodles (Pack of 4)', localTitle: 'Maggi', quantity: '2 packs', category: 'snacks', addedBy: 'Flat Midnight Run', status: 'pending', reason: 'manual' },
  { id: 'sh-2', title: 'Farm Fresh Eggs (6 pcs)', localTitle: 'Eggs Tray', quantity: '1 box', category: 'dairy', addedBy: 'Rohan', status: 'pending', reason: 'manual' },
  { id: 'sh-3', title: 'Amul Salted Butter (100g)', localTitle: 'Butter', quantity: '1 unit', category: 'dairy', addedBy: 'Vikram', status: 'pending', reason: 'manual' },
  { id: 'sh-4', title: 'Bisleri 20L Water Canister', localTitle: 'Water Canister', quantity: '1 can', category: 'other', addedBy: 'Ankit', status: 'pending', reason: 'manual' },
];

export const INITIAL_SHOPPING_FAMILY: ShoppingItem[] = [
  { id: 'sf-1', title: 'Amul Taaza Toned Milk (1 Litre)', localTitle: 'Amul Milk 1L', quantity: '2 packets', category: 'dairy', addedBy: 'Sunita (Mom)', status: 'pending', reason: 'manual' },
  { id: 'sf-2', title: 'Fresh Country Tomatoes', localTitle: 'Tamatar', quantity: '1 kg', category: 'vegetables', addedBy: 'Rajesh (Dad)', status: 'pending', reason: 'scan' },
  { id: 'sf-3', title: 'Ginger & Green Chillies', localTitle: 'Adrak & Hari Mirch', quantity: '250g', category: 'vegetables', addedBy: 'Voice HUD', status: 'pending', reason: 'voice' },
  { id: 'sf-4', title: 'Whole Wheat Brown Bread', localTitle: 'Brown Bread', quantity: '1 loaf', category: 'staples', addedBy: 'Priya', status: 'pending', reason: 'manual' },
  { id: 'sf-5', title: 'Aashirvaad Shudh Chakki Atta (5kg)', localTitle: 'Wheat Flour', quantity: '1 bag', category: 'staples', addedBy: 'Monthly Kirana', status: 'pending', reason: 'manual' },
];

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'm-1',
    name: 'Metformin (Glycomet 500mg)',
    dosage: '1 Tablet after Breakfast',
    instructions: 'Take with a glass of warm water after meals',
    scheduleTimes: ['09:00 AM'],
    pillColor: 'bg-emerald-100 border-2 border-emerald-500 text-emerald-900',
    currentStock: 4,
    refillThreshold: 5,
    todayStatus: 'pending'
  },
  {
    id: 'm-2',
    name: 'Telmisartan (Telma 40mg)',
    dosage: '1 Tablet Morning',
    instructions: 'Blood pressure control before 10 AM',
    scheduleTimes: ['09:30 AM'],
    pillColor: 'bg-amber-100 border-2 border-amber-500 text-amber-900',
    currentStock: 18,
    refillThreshold: 5,
    todayStatus: 'taken'
  },
  {
    id: 'm-3',
    name: 'Calcium + Vit D3 (Shelcal 500)',
    dosage: '1 Tablet after Lunch',
    instructions: 'Daily bone supplement with water',
    scheduleTimes: ['02:00 PM'],
    pillColor: 'bg-sky-100 border-2 border-sky-500 text-sky-900',
    currentStock: 12,
    refillThreshold: 6,
    todayStatus: 'pending'
  }
];

export const INITIAL_ELDER_TODOS: ElderTodo[] = [
  { id: 'et-1', task: 'Morning gentle walk in park or balcony (15 mins)', category: 'wellness', time: '07:30 AM', completed: true, notificationEnabled: true },
  { id: 'et-2', task: 'Drink 2 glasses of lukewarm water with lemon', category: 'health', time: '08:00 AM', completed: true, notificationEnabled: true },
  { id: 'et-3', task: 'Check Blood Pressure & write in diary', category: 'health', time: '10:00 AM', completed: false, notificationEnabled: true },
  { id: 'et-4', task: 'Sit in garden / balcony for morning sunshine', category: 'wellness', time: '10:45 AM', completed: false, notificationEnabled: true },
  { id: 'et-5', task: 'Evening ginger tea & call Priya (Daughter)', category: 'family', time: '05:30 PM', completed: false, notificationEnabled: true },
];

export const INITIAL_HOSTEL_CHORES: HostelChore[] = [
  { id: 'c-1', task: 'Clean Bathroom & Geyser check', assignee: 'Rohan', room: 'B-302', dueDate: 'Today, 8 PM', status: 'pending', skipCount: 0 },
  { id: 'c-2', task: 'Throw out Kitchen Garbage', assignee: 'Vikram', room: 'B-302', dueDate: 'Yesterday', status: 'completed', skipCount: 1 },
  { id: 'c-3', task: 'Wash Fridge & Wipe Trays', assignee: 'Ankit', room: 'B-302', dueDate: 'Saturday', status: 'pending', skipCount: 0 },
  { id: 'c-4', task: 'Refill 20L Water Canister', assignee: 'Rohan', room: 'B-302', dueDate: 'Tomorrow', status: 'pending', skipCount: 2 }
];

export const INITIAL_HOSTEL_EXPENSES: HostelExpense[] = [
  { id: 'e-1', title: 'Wifi Bill (Airtel Xstream Fiber)', amount: 943, paidBy: 'Rohan', splitWith: ['Rohan', 'Vikram', 'Ankit'], upiId: 'rohan@okhdfcbank', settled: false, date: '02 Oct' },
  { id: 'e-2', title: 'Midnight Maggi & Eggs run', amount: 180, paidBy: 'Vikram', splitWith: ['Rohan', 'Vikram', 'Ankit'], upiId: 'vikram@paytm', settled: true, date: '01 Oct' },
  { id: 'e-3', title: 'Water Purifier Filter replacement', amount: 450, paidBy: 'Ankit', splitWith: ['Rohan', 'Vikram', 'Ankit'], upiId: 'ankit@upi', settled: false, date: 'Today' }
];

export const INITIAL_MESS_MENU: MessMenuDay[] = [
  { day: 'Monday', lunch: 'Rajma, Steamed Rice, Jeera Aloo, Fresh Curd', dinner: 'Egg Curry / Paneer Bhurji, Phulka, Kheer', skippedDinnerToday: false },
  { day: 'Tuesday', lunch: 'Chole Bhature, Boondi Raita, Onion Salad', dinner: 'Mix Veg, Dal Tadka, Phulka', skippedDinnerToday: false },
  { day: 'Wednesday', lunch: 'Kadhi Pakoda, Jeera Rice, Roasted Papad', dinner: 'Chicken Biryani / Soya Biryani, Raita', skippedDinnerToday: false },
  { day: 'Thursday', lunch: 'Aloo Gobi, Dal Fry, Tawa Roti, Salad', dinner: 'Dal Makhani, Butter Roti, Gulab Jamun', skippedDinnerToday: false },
  { day: 'Friday', lunch: 'Puri, Chana Masala, Suji Halwa', dinner: 'Fish Curry / Malai Kofta, Jeera Rice', skippedDinnerToday: false },
];

export const INITIAL_FAMILY_CHORES: FamilyChore[] = [
  { id: 'fc-1', task: 'Water balcony garden plants & Tulsi', assignedTo: 'Sunita (Mom)', dueDate: 'Daily Morning', category: 'plants', completed: true, completedBy: 'Sunita (Mom)', completedAt: '08:15 AM', points: 10 },
  { id: 'fc-2', task: 'Take out kitchen segregated dry & wet garbage', assignedTo: 'Aarav (Son)', dueDate: 'Today, 8 PM', category: 'cleaning', completed: true, completedBy: 'Aarav (Son)', completedAt: '09:00 AM', points: 10 },
  { id: 'fc-3', task: 'Pick up 2L fresh milk & brown bread from Mother Dairy', assignedTo: 'Rajesh (Dad)', dueDate: 'Today, 6 PM', category: 'shopping', completed: false, points: 15 },
  { id: 'fc-4', task: 'Fold dried laundry and organize bedroom cupboards', assignedTo: 'Priya (Daughter)', dueDate: 'Today Evening', category: 'cleaning', completed: false, points: 15 },
  { id: 'fc-5', task: 'Wipe kitchen dining table and stove counter', assignedTo: 'Rajesh (Dad)', dueDate: 'Night', category: 'kitchen', completed: false, points: 10 },
];

export const DEFAULT_HOUSEHOLDS: Household[] = [
  {
    id: 'elder_home',
    name: 'Senior Living Sanctuary',
    mode: 'elder',
    accessCode: 'ELDER',
    adminUsername: 'nanaji',
    members: ['nanaji'],
  },
  {
    id: 'flat_b302',
    name: 'Hostel Flat B-302',
    mode: 'hostel',
    accessCode: 'FLAT302',
    adminUsername: 'rohan',
    members: ['rohan', 'vikram', 'ankit'],
  },
  {
    id: 'sharma_family',
    name: 'The Sharma Family',
    mode: 'family',
    accessCode: 'SHARMA',
    adminUsername: 'rajesh',
    members: ['rajesh', 'sunita', 'priya', 'aarav'],
  },
];

export const DEFAULT_USERS: UserAccount[] = [
  // 1. Elder Account (Living alone)
  {
    id: 'u-elder-1',
    username: 'nanaji',
    password: '123',
    displayName: 'Nanaji / Dadu',
    role: 'admin',
    householdId: 'elder_home',
    householdName: 'Senior Living Sanctuary',
    mode: 'elder',
    avatar: '🧓',
  },
  // 2. Hostel Accounts (Main user + Roommates)
  {
    id: 'u-hostel-1',
    username: 'rohan',
    password: '123',
    displayName: 'Rohan (Flat Admin)',
    role: 'admin',
    householdId: 'flat_b302',
    householdName: 'Hostel Flat B-302',
    mode: 'hostel',
    avatar: '🎓',
  },
  {
    id: 'u-hostel-2',
    username: 'vikram',
    password: '123',
    displayName: 'Vikram (Roommate - B2)',
    role: 'member',
    householdId: 'flat_b302',
    householdName: 'Hostel Flat B-302',
    mode: 'hostel',
    avatar: '🧑‍💻',
  },
  {
    id: 'u-hostel-3',
    username: 'ankit',
    password: '123',
    displayName: 'Ankit (Roommate - B3)',
    role: 'member',
    householdId: 'flat_b302',
    householdName: 'Hostel Flat B-302',
    mode: 'hostel',
    avatar: '🎧',
  },
  // 3. Family Accounts (Main user + Family Members)
  {
    id: 'u-family-1',
    username: 'rajesh',
    password: '123',
    displayName: 'Rajesh (Dad / Head)',
    role: 'admin',
    householdId: 'sharma_family',
    householdName: 'The Sharma Family',
    mode: 'family',
    avatar: '👨‍💼',
  },
  {
    id: 'u-family-2',
    username: 'sunita',
    password: '123',
    displayName: 'Sunita (Mom)',
    role: 'member',
    householdId: 'sharma_family',
    householdName: 'The Sharma Family',
    mode: 'family',
    avatar: '👩‍🏫',
  },
  {
    id: 'u-family-3',
    username: 'priya',
    password: '123',
    displayName: 'Priya (Daughter)',
    role: 'member',
    householdId: 'sharma_family',
    householdName: 'The Sharma Family',
    mode: 'family',
    avatar: '👧',
  },
  {
    id: 'u-family-4',
    username: 'aarav',
    password: '123',
    displayName: 'Aarav (Son)',
    role: 'member',
    householdId: 'sharma_family',
    householdName: 'The Sharma Family',
    mode: 'family',
    avatar: '👦',
  },
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-1',
    doctorName: 'Dr. Alok Verma, MD (Internal Medicine)',
    clinicOrHospital: 'Max Super Specialty Hospital, Saket',
    date: '28 Sep 2026',
    notes: 'Maintain low sodium, regular morning walks, avoid oily food. Review HbA1c in 3 months.',
    prescribedMedicines: [
      { name: 'Metformin (Glycomet 500mg)', dosage: '1 Tab', frequency: 'Twice daily after meals', duration: 'Ongoing' },
      { name: 'Telmisartan (Telma 40mg)', dosage: '1 Tab', frequency: 'Morning once daily', duration: 'Ongoing' },
      { name: 'Shelcal 500 (Calcium + D3)', dosage: '1 Tab', frequency: 'Once daily after lunch', duration: '60 days' },
    ],
  },
  {
    id: 'rx-2',
    doctorName: 'Dr. Neha Sengupta, MS (Ophthalmology)',
    clinicOrHospital: 'Netralaya Eye Care Institute',
    date: '15 Aug 2026',
    notes: 'Dry eye drops 3 times a day. Wear UV protection glasses when stepping outdoors.',
    prescribedMedicines: [
      { name: 'Refresh Tears Lubricant Eye Drops', dosage: '1-2 drops', frequency: '3 times daily', duration: '30 days' },
    ],
  },
];

export const INITIAL_MEDS_TO_BUY: MedicineToBuy[] = [
  {
    id: 'mb-1',
    name: 'Metformin (Glycomet 500mg)',
    dosage: '500mg (Strip of 10)',
    quantity: '2 Strips',
    prescribedBy: 'Dr. Alok Verma',
    urgency: 'high',
    status: 'needed',
    estimatedCost: 88,
  },
  {
    id: 'mb-2',
    name: 'Shelcal 500 (Calcium + Vit D3)',
    dosage: '500mg (Bottle of 15 tabs)',
    quantity: '1 Bottle',
    prescribedBy: 'Dr. Alok Verma',
    urgency: 'medium',
    status: 'needed',
    estimatedCost: 119,
  },
  {
    id: 'mb-3',
    name: 'Dolo 650 (Paracetamol)',
    dosage: '650mg (Strip of 15)',
    quantity: '1 Strip',
    prescribedBy: 'SOS Emergency Routine',
    urgency: 'routine',
    status: 'ordered',
    estimatedCost: 32,
  },
];

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
  return getStoredData<UserAccount[]>('users_v2', DEFAULT_USERS);
}

export function saveAllUsers(users: UserAccount[]): void {
  saveStoredData('users_v2', users);
}

export function getAllHouseholds(): Household[] {
  return getStoredData<Household[]>('households_v2', DEFAULT_HOUSEHOLDS);
}

export function saveAllHouseholds(households: Household[]): void {
  saveStoredData('households_v2', households);
}

export function getCurrentUser(): UserAccount | null {
  return getStoredData<UserAccount | null>('current_user_v2', null);
}

export function setCurrentUser(user: UserAccount | null): void {
  saveStoredData('current_user_v2', user);
}
