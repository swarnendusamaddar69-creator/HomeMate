import React, { useState } from 'react';
import {
  AppMode,
  Language,
  ShoppingItem,
  HostelChore,
  FamilyChore,
  HostelExpense,
  UserAccount,
} from '../types';
import {
  IndianRupee,
  Receipt,
  ShoppingCart,
  CheckSquare,
  PieChart,
  Plus,
  Share2,
  TrendingDown,
  TrendingUp,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles,
  QrCode,
  CheckCircle,
} from 'lucide-react';
import { translations } from '../utils/translations';

interface MonthlyExpenseCalculatorProps {
  mode: AppMode;
  language: Language;
  shoppingItems: ShoppingItem[];
  hostelChores?: HostelChore[];
  familyChores?: FamilyChore[];
  hostelExpenses?: HostelExpense[];
  currentUser: UserAccount | null;
  householdMembers?: string[];
  onTriggerUpiModal?: (
    title: string,
    amount: number,
    paidBy: string,
    upiId: string,
    expenseId: string
  ) => void;
}

interface CustomExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  source: string;
  paidBy?: string;
}

export const MonthlyExpenseCalculator: React.FC<MonthlyExpenseCalculatorProps> = ({
  mode,
  language,
  shoppingItems,
  hostelChores = [],
  familyChores = [],
  hostelExpenses = [],
  currentUser,
  householdMembers = [],
  onTriggerUpiModal,
}) => {
  const t = translations[language];

  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>(() => {
    try {
      const saved = localStorage.getItem(`homemate_custom_exp_${mode}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('groceries');
  const [copiedReportToast, setCopiedReportToast] = useState(false);

  // Helper to estimate price of grocery item if not specified
  const estimateItemPrice = (item: ShoppingItem): number => {
    const titleLower = item.title.toLowerCase();
    const qtyMatch = (item.quantity || '1').match(/(\d+(?:\.\d+)?)/);
    const count = qtyMatch ? parseFloat(qtyMatch[1]) || 1 : 1;

    if (titleLower.includes('milk') || titleLower.includes('दूध') || titleLower.includes('দুধ')) return Math.round(count * 66);
    if (titleLower.includes('egg') || titleLower.includes('अंडे') || titleLower.includes('ডিম')) return Math.round(count * 8);
    if (titleLower.includes('tomato') || titleLower.includes('टमाटर') || titleLower.includes('টমেটো')) return Math.round(count * 42);
    if (titleLower.includes('bread') || titleLower.includes('ब्रेड') || titleLower.includes('পাউরুটি')) return Math.round(count * 45);
    if (titleLower.includes('butter') || titleLower.includes('मक्खन') || titleLower.includes('মাখন')) return Math.round(count * 58);
    if (titleLower.includes('maggi') || titleLower.includes('नूडल्स') || titleLower.includes('ম্যাগি')) return Math.round(count * 14);
    if (titleLower.includes('atta') || titleLower.includes('आटा') || titleLower.includes('আটা')) return Math.round(count * 45);
    if (titleLower.includes('rice') || titleLower.includes('चावल') || titleLower.includes('চাল')) return Math.round(count * 65);
    if (titleLower.includes('oil') || titleLower.includes('तेल') || titleLower.includes('তেল')) return Math.round(count * 145);
    if (titleLower.includes('tea') || titleLower.includes('चाय') || titleLower.includes('চা')) return Math.round(count * 120);
    if (titleLower.includes('biscuit') || titleLower.includes('बिस्कुट')) return Math.round(count * 30);
    return Math.round(count * 55);
  };

  // 1. Calculate Groceries / Orders spend (bought items + pending essentials)
  const boughtItems = shoppingItems.filter((i) => i.status === 'bought');
  const boughtTotal = boughtItems.reduce((acc, item) => acc + estimateItemPrice(item), 0);
  const pendingItemsTotal = shoppingItems
    .filter((i) => i.status === 'pending')
    .reduce((acc, item) => acc + estimateItemPrice(item), 0);

  // 2. Calculate Chores & Maintenance costs
  let choreMaintenanceCost = 0;
  let choreSourceLabel = '';

  if (mode === 'hostel') {
    // Samosa / Penalty fund from skipped chores (₹20 per skip) + maid / flat cleaning fee
    const skipCount = hostelChores.reduce((acc, c) => acc + (c.skipCount || 0), 0);
    const penaltyTotal = skipCount * 20 + 80;
    const flatCleaning = 450; // shared deep cleaning fee
    choreMaintenanceCost = penaltyTotal + flatCleaning;
    choreSourceLabel = `Chore Penalty Jar (₹${penaltyTotal}) + Flat Cleaning (₹${flatCleaning})`;
  } else if (mode === 'family') {
    // Cleaning supplies + house upkeep tasks
    const suppliesCost = 420;
    const domesticHelp = 2500;
    choreMaintenanceCost = suppliesCost + domesticHelp;
    choreSourceLabel = `House Cleaning Help (₹${domesticHelp}) + Supplies & Repairs (₹${suppliesCost})`;
  } else {
    // Elder: Home assistance & domestic help
    const homeAssistance = 1800;
    const maintenance = 350;
    choreMaintenanceCost = homeAssistance + maintenance;
    choreSourceLabel = `Caregiver/Helper Support (₹${homeAssistance}) + Maintenance (₹${maintenance})`;
  }

  // 3. Baseline Utilities / Prescriptions / Rent / Mess
  let baselineUtilities = 0;
  let baselineLabel = '';

  if (mode === 'hostel') {
    const wifi = 943;
    const waterPurifier = 450;
    baselineUtilities = wifi + waterPurifier;
    baselineLabel = `Wi-Fi Fiber (₹${wifi}) + RO Water Cans (₹${waterPurifier})`;
  } else if (mode === 'family') {
    const electricity = 1840;
    const gasCylinder = 853;
    const waterFilter = 450;
    baselineUtilities = electricity + gasCylinder + waterFilter;
    baselineLabel = `Electricity (₹${electricity}) + LPG Gas (₹${gasCylinder}) + RO (₹${waterFilter})`;
  } else {
    // Elder: Medicines & Health Routine
    const medsCost = 1120;
    const checkupDiagnostics = 650;
    baselineUtilities = medsCost + checkupDiagnostics;
    baselineLabel = `Monthly Prescriptions (₹${medsCost}) + Health Checkups (₹${checkupDiagnostics})`;
  }

  // 4. Custom Logged Expenses
  const customTotal = customExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Total Monthly Expense
  const totalMonthlySpend = boughtTotal + choreMaintenanceCost + baselineUtilities + customTotal;

  // Budget Caps
  const budgetCap = mode === 'elder' ? 8000 : mode === 'hostel' ? 6000 : 18000;
  const percentUsed = Math.min(100, Math.round((totalMonthlySpend / budgetCap) * 100));

  // Splitwise calculation for Hostel
  const activeMembers = householdMembers && householdMembers.length > 0
    ? householdMembers
    : currentUser?.displayName
    ? [currentUser.displayName]
    : ['Me'];
  const hostelPerPerson = Math.round(totalMonthlySpend / Math.max(1, activeMembers.length));

  const handleAddCustomExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newExp: CustomExpense = {
      id: `exp-${Date.now()}`,
      title: newTitle.trim(),
      amount: parsedAmount,
      category: newCategory,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      source: 'Manual Receipt',
      paidBy: currentUser?.displayName || 'User',
    };

    const updated = [newExp, ...customExpenses];
    setCustomExpenses(updated);
    try {
      localStorage.setItem(`homemate_custom_exp_${mode}`, JSON.stringify(updated));
    } catch {}

    setNewTitle('');
    setNewAmount('');
    setShowAddModal(false);
  };

  const handleShareReportWhatsApp = () => {
    let text = `📊 *HomeMate Monthly Expense Statement (${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})*\n`;
    text += `🏠 *Household Mode*: ${mode.toUpperCase()}\n`;
    text += `💰 *Total Monthly Spend*: ₹${totalMonthlySpend.toLocaleString('en-IN')}\n\n`;
    text += `• *Groceries & Orders*: ₹${boughtTotal} (${boughtItems.length} items bought)\n`;
    text += `• *Chores & Maintenance*: ₹${choreMaintenanceCost} (${choreSourceLabel})\n`;
    text += `• *Utilities / Prescriptions*: ₹${baselineUtilities} (${baselineLabel})\n`;

    if (customTotal > 0) {
      text += `• *Other Logged Expenses*: ₹${customTotal}\n`;
    }

    if (mode === 'hostel') {
      text += `\n🤝 *Hostel Splitwise Equal Share*:\n`;
      text += `₹${totalMonthlySpend} ÷ ${activeMembers.length} flatmates = *₹${hostelPerPerson} / person*\n`;
      text += `(Split among: ${activeMembers.join(', ')})\n`;
    }

    text += `\nGenerated automatically via HomeMate AI OS`;

    navigator.clipboard.writeText(text);
    setCopiedReportToast(true);
    setTimeout(() => setCopiedReportToast(false), 3000);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm interactive-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`p-2 rounded-xl ${
                mode === 'elder'
                  ? 'bg-amber-100 text-amber-800'
                  : mode === 'hostel'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <PieChart className="w-5 h-5" />
            </span>
            <h3 className="font-black text-lg text-slate-900 tracking-tight">
              {language === 'hi'
                ? 'मासिक खर्च कैलकुलेटर'
                : language === 'bn'
                ? 'মাসিক খরচ ক্যালকুলেটর'
                : 'Monthly Expense & Budget Engine'}
            </h3>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                mode === 'elder'
                  ? 'bg-amber-100 text-amber-900'
                  : mode === 'hostel'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              Auto-Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'hi'
              ? 'किराना ऑर्डर्स, घरेलू काम और बिलों के लाइव डेटा से स्वचालित गणना'
              : language === 'bn'
              ? 'মুদি অর্ডার, বাড়ির কাজ ও বিলের লাইভ ডেটা থেকে স্বয়ংক্রিয় হিসাব'
              : 'Aggregated dynamically from ordered groceries, chores maintenance & utilities'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShareReportWhatsApp}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>
              {language === 'hi'
                ? 'व्हाट्सएप पर भेजें'
                : language === 'bn'
                ? 'হোয়াটসঅ্যাপে পাঠান'
                : 'Share Statement'}
            </span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {language === 'hi'
                ? 'खर्च जोड़ें'
                : language === 'bn'
                ? 'খরচ যোগ'
                : 'Add Expense'}
            </span>
          </button>
        </div>
      </div>

      {copiedReportToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Expense statement copied & opening WhatsApp!</span>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Spend */}
        <div
          className={`p-4 rounded-2xl border ${
            mode === 'elder'
              ? 'bg-amber-50/60 border-amber-200'
              : mode === 'hostel'
              ? 'bg-indigo-50/60 border-indigo-200'
              : 'bg-emerald-50/60 border-emerald-200'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {language === 'hi' ? 'कुल मासिक खर्च' : language === 'bn' ? 'মোট মাসিক খরচ' : 'Total Monthly Spend'}
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            ₹{totalMonthlySpend.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Monthly cap: ₹{budgetCap.toLocaleString('en-IN')} ({percentUsed}% used)
          </span>
        </div>

        {/* 1. Groceries & Orders */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'hi' ? 'किराना व ऑर्डर्स' : language === 'bn' ? 'মুদি ও অর্ডার' : 'Groceries & Orders'}
            </span>
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            ₹{boughtTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {boughtItems.length} items purchased • ₹{pendingItemsTotal} pending
          </span>
        </div>

        {/* 2. Chores & Maintenance */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'hi' ? 'घरेलू काम व रखरखाव' : language === 'bn' ? 'কাজ ও মেইনটেনেন্স' : 'Chores & Maintenance'}
            </span>
            <CheckSquare className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            ₹{choreMaintenanceCost.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block truncate" title={choreSourceLabel}>
            {choreSourceLabel}
          </span>
        </div>

        {/* 3. Baseline Utilities / Meds */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {mode === 'elder'
                ? language === 'hi' ? 'दवाईयां व स्वास्थ्य' : language === 'bn' ? 'ওষুধ ও স্বাস্থ্য' : 'Meds & Health'
                : language === 'hi' ? 'बिल व उपयोगिता' : language === 'bn' ? 'বিল ও রিচার্জ' : 'Utilities & Bills'}
            </span>
            <Receipt className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            ₹{baselineUtilities.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block truncate" title={baselineLabel}>
            {baselineLabel}
          </span>
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Budget Utilization Gauge</span>
          <span className="font-mono">{percentUsed}% of ₹{budgetCap.toLocaleString('en-IN')} limit</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              percentUsed > 85 ? 'bg-rose-500' : percentUsed > 60 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* SPECIAL HOSTEL SPLITWISE SECTION */}
      {mode === 'hostel' && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white border-2 border-indigo-400 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                  Splitwise Equal Division
                </span>
                <span className="text-xs text-indigo-200">
                  Total ₹{totalMonthlySpend} ÷ {activeMembers.length} Flatmates
                </span>
              </div>
              <h4 className="text-xl font-black text-white mt-1">
                Each Flatmate Owes: <span className="font-mono text-emerald-400">₹{hostelPerPerson}</span>
              </h4>
              <p className="text-xs text-indigo-200 mt-0.5">
                Includes all bought groceries, midnight runs, chore penalty fund, Wi-Fi fiber & RO refills
              </p>
            </div>

            <button
              onClick={() => {
                if (onTriggerUpiModal) {
                  const adminName = activeMembers[0] || currentUser?.displayName || 'Flat Admin';
                  const adminUpi = `${adminName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'admin'}@upi`;
                  onTriggerUpiModal(
                    'Hostel Monthly Flat Share',
                    hostelPerPerson,
                    `${adminName} (Flat Admin)`,
                    adminUpi,
                    'monthly_split_hostel'
                  );
                }
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <QrCode className="w-4 h-4 stroke-[2.5]" />
              <span>Pay Share via UPI QR (₹{hostelPerPerson})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {activeMembers.map((person) => (
              <div
                key={person}
                className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-indigo-100 block">{person}</span>
                  <span className="text-[10px] text-slate-400">Equal Flat Share</span>
                </div>
                <div className="text-right">
                  <span className="font-black font-mono text-emerald-300 text-sm block">
                    ₹{hostelPerPerson}
                  </span>
                  <span className="text-[9px] font-bold text-indigo-300 uppercase">
                    Split 1/{activeMembers.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itemized Source Breakdown */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-slate-500" />
          <span>Itemized Monthly Ledger & Data Feed</span>
        </h4>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
          {/* Bought Grocery Items */}
          {boughtItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="font-bold text-slate-800">{item.title}</span>
                  <span className="text-[11px] text-slate-400 block">
                    {item.quantity || '1 unit'} • Source: {item.addedBy}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black font-mono text-slate-900 block">
                  ₹{estimateItemPrice(item)}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                  Ordered ✓
                </span>
              </div>
            </div>
          ))}

          {/* Chores Maintenance Item */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
                <CheckSquare className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="font-bold text-slate-800">
                  {mode === 'hostel' ? 'Flat Chores & Samosa Penalty Fund' : 'House Chores & Maintenance'}
                </span>
                <span className="text-[11px] text-slate-400 block">{choreSourceLabel}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black font-mono text-slate-900 block">
                ₹{choreMaintenanceCost}
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded-md">
                Chores Feed
              </span>
            </div>
          </div>

          {/* Baseline Utilities Item */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                <Receipt className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="font-bold text-slate-800">
                  {mode === 'elder' ? 'Prescription Meds & Diagnostics' : 'Fixed Utilities & Bills'}
                </span>
                <span className="text-[11px] text-slate-400 block">{baselineLabel}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black font-mono text-slate-900 block">
                ₹{baselineUtilities}
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded-md">
                Recurring
              </span>
            </div>
          </div>

          {/* Custom Logged Expenses */}
          {customExpenses.map((exp) => (
            <div
              key={exp.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <IndianRupee className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="font-bold text-slate-800">{exp.title}</span>
                  <span className="text-[11px] text-slate-400 block">
                    {exp.date} • Paid by {exp.paidBy || 'Self'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black font-mono text-slate-900 block">₹{exp.amount}</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md">
                  Receipt
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">Add Household Expense</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomExpense} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra Gas cylinder, Electrician repair, Chemist receipt..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="₹ 500"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                >
                  <option value="groceries">Groceries / Orders</option>
                  <option value="chores">Chores & Upkeep</option>
                  <option value="bills">Utilities & Bills</option>
                  <option value="meds">Meds & Healthcare</option>
                  <option value="other">Other Receipts</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-md cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
