import React, { useState } from 'react';
import { HostelChore, HostelExpense, MessMenuDay, PantryItem, ShoppingItem, Language, UserAccount } from '../types';
import {
  RotateCw,
  IndianRupee,
  Utensils,
  AlertCircle,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  Moon,
  ExternalLink,
  QrCode,
  Flame,
  Plus,
  Coffee,
  ShoppingCart,
  Trash2,
  Share2,
  Zap,
  Check,
  Edit3,
  Minus,
} from 'lucide-react';
import { UpiPaymentModal } from './UpiPaymentModal';
import { QuickCommerceHub } from './QuickCommerceHub';
import { HostelSplitwise } from './HostelSplitwise';
import { MonthlyExpenseCalculator } from './MonthlyExpenseCalculator';
import { EditGroceryModal } from './EditGroceryModal';
import { SplitSnackModal } from './SplitSnackModal';
import { playChimeSound } from '../utils/notifications';
import { translations } from '../utils/translations';

interface HostelViewProps {
  chores: HostelChore[];
  onCompleteChore: (id: string) => void;
  onRotateChore: (id: string) => void;
  onAddChore: (chore: Omit<HostelChore, 'id'>) => void;
  onRefreshChores?: () => void;
  expenses: HostelExpense[];
  onSettleExpense: (id: string) => void;
  onAddExpense: (expense: Omit<HostelExpense, 'id' | 'date'>) => void;
  messMenu: MessMenuDay[];
  onToggleSkipMess: (day: string) => void;
  pantryItems: PantryItem[];
  language: Language;
  currentUser: UserAccount | null;
  // Shared Grocery / Kirana List props
  shoppingItems: ShoppingItem[];
  onToggleShoppingItem: (id: string) => void;
  onDeleteShoppingItem: (id: string) => void;
  onAddShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void;
  onEditShoppingItem: (id: string, updated: { title: string; quantity: string; category?: string }) => void;
  householdMembers?: string[];
  onAddMember?: (name: string) => void;
  onDeleteMember?: (name: string) => void;
}

export const HostelView: React.FC<HostelViewProps> = ({
  chores,
  onCompleteChore,
  onRotateChore,
  onAddChore,
  onRefreshChores,
  expenses,
  onSettleExpense,
  onAddExpense,
  messMenu,
  onToggleSkipMess,
  pantryItems,
  language,
  currentUser,
  shoppingItems,
  onToggleShoppingItem,
  onDeleteShoppingItem,
  onAddShoppingItem,
  onEditShoppingItem,
  householdMembers = [],
  onAddMember,
  onDeleteMember,
}) => {
  const [examMode, setExamMode] = useState(false);

  // Dynamic Flatmates
  const roommates = householdMembers.length > 0
    ? householdMembers
    : currentUser?.displayName
    ? [currentUser.displayName]
    : [];

  // Grocery State
  const [newSnackTitle, setNewSnackTitle] = useState('');
  const [newSnackQty, setNewSnackQty] = useState('');
  const [showQuickCommerce, setShowQuickCommerce] = useState(false);
  const [copiedGroupToast, setCopiedGroupToast] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [splitModalItem, setSplitModalItem] = useState<ShoppingItem | null>(null);
  const [splitSuccessToast, setSplitSuccessToast] = useState<string | null>(null);

  // Chore creation state
  const [showAddChoreModal, setShowAddChoreModal] = useState(false);
  const [choreTask, setChoreTask] = useState('');
  const [choreAssignee, setChoreAssignee] = useState(roommates[0] || 'Me');
  const [choreDue, setChoreDue] = useState('Today, 8 PM');
  const [aiChoreToast, setAiChoreToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (roommates.length > 0 && (!choreAssignee || choreAssignee === 'Me')) {
      setChoreAssignee(roommates[0]);
    }
  }, [householdMembers]);

  const t = translations[language];

  // Active UPI Payment Modal state
  const [activeUpiModal, setActiveUpiModal] = useState<{
    title: string;
    amount: number;
    paidBy: string;
    upiId: string;
    expenseId: string;
  } | null>(null);

  // Roommate Penalty Jar state (₹20 per chore skip)
  const totalSkips = chores.reduce((acc, curr) => acc + (curr.skipCount || 0), 0);
  const penaltyFund = totalSkips * 20 + 80;

  const todayMess = messMenu[0] || {
    day: 'Today',
    lunch: 'Chole Bhature & Raita',
    dinner: 'Mix Veg, Dal Tadka, Phulka',
    skippedDinnerToday: false,
  };

  const handleAddSnack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnackTitle.trim()) return;

    onAddShoppingItem({
      title: newSnackTitle.trim(),
      quantity: newSnackQty.trim() || '1 pkt',
      category: 'snacks',
      addedBy: language === 'hi' ? 'हॉस्टल नाईट रन' : language === 'bn' ? 'হোস্টেল নাইট রান' : 'Flatmate Midnight Run',
      status: 'pending',
      reason: 'manual',
    });

    setNewSnackTitle('');
    setNewSnackQty('');
  };

  const handleQuickAddSnack = (title: string, qty: string, category: string) => {
    onAddShoppingItem({
      title,
      quantity: qty,
      category,
      addedBy: 'Flat Quick Snacks',
      status: 'pending',
      reason: 'manual',
    });
  };

  const handleShareToFlatWhatsApp = () => {
    const pending = shoppingItems.filter((i) => i.status === 'pending');
    const header = language === 'hi' ? '*हॉस्टल फ्लैट B-302 स्नैक्स और किराना लिस्ट*' : language === 'bn' ? '*হোস্টেল ফ্ল্যাট B-302 মুদি তালিকা*' : '*Hostel Flat B-302 Grocery & Midnight Snack Run*';
    const text =
      `${header}\n` +
      (pending.length > 0
        ? pending.map((item, idx) => `${idx + 1}. ${item.title} (${item.quantity || '1 unit'})`).join('\n')
        : 'Everything stocked! No snacks needed right now.') +
      `\n\nOrder on Zepto (10m) / Blinkit (8m) & split via Homemate UPI QR!`;

    navigator.clipboard.writeText(text);
    setCopiedGroupToast(true);
    setTimeout(() => setCopiedGroupToast(false), 3000);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleConvertSnackToExpense = (itemTitle: string) => {
    const estimatedAmount = 120;
    const payer = currentUser?.displayName || roommates[0] || 'Me';
    onAddExpense({
      title: `Snacks: ${itemTitle}`,
      amount: estimatedAmount,
      paidBy: payer,
      splitWith: roommates.length > 0 ? roommates : [payer],
      upiId: `${payer.toLowerCase().replace(/[^a-z0-9]/g, '') || 'payee'}@upi`,
      settled: false,
    });
  };

  const handleStepQty = (item: ShoppingItem, delta: number) => {
    const rawQty = (item.quantity || '1 unit').trim();
    const match = rawQty.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
    if (match) {
      const currentNum = parseFloat(match[1]) || 1;
      const unit = match[2] || 'unit';
      const newNum = Math.max(1, currentNum + delta);
      onEditShoppingItem(item.id, {
        title: item.title,
        quantity: `${newNum} ${unit}`.trim(),
        category: item.category,
      });
    }
  };

  const handleAiSuggestFlatChore = () => {
    const ideas = [
      { task: 'Clean shared microwave and wipe gas burner grease', due: 'Tonight, 10 PM' },
      { task: 'Throw out empty delivery cartons & pizza boxes', due: 'Tomorrow 9 AM' },
      { task: 'Refill 20L Bisleri drinking water canister', due: 'Today, 7 PM' },
      { task: 'Wipe kitchen counter and sweep common balcony', due: 'Saturday' },
      { task: 'Defrost shared fridge & wipe door bottle racks', due: 'Sunday Morning' },
    ];

    const pick = ideas.find((i) => !chores.some((c) => c.task === i.task)) || ideas[0];
    const targetAssignee = roommates.length > 0
      ? roommates[Math.floor(Math.random() * roommates.length)]
      : (currentUser?.displayName || 'Me');

    onAddChore({
      task: pick.task,
      assignee: targetAssignee,
      room: 'Common Area',
      dueDate: pick.due,
      status: 'pending',
      skipCount: 0,
    });

    setAiChoreToast(`✨ AI Chore Added: "${pick.task}" assigned to ${targetAssignee}`);
    setTimeout(() => setAiChoreToast(null), 3500);
  };

  const handleCreateChoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!choreTask.trim()) return;

    onAddChore({
      task: choreTask.trim(),
      assignee: choreAssignee || roommates[0] || 'Me',
      room: 'Common Area',
      dueDate: choreDue,
      status: 'pending',
      skipCount: 0,
    });

    setChoreTask('');
    setShowAddChoreModal(false);
  };

  const totalSpentWeek = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const weeklyBudget = 1500;
  const budgetPercentage = Math.min(100, Math.round((totalSpentWeek / weeklyBudget) * 100));
  const pendingSnacksCount = shoppingItems.filter((i) => i.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 1. Top Hostel Flat Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 interactive-card hover-glow-indigo">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              {t.hostelProfileBadge}
            </span>
            <span className="text-xs text-slate-400">• {t.hostelRoomHint}</span>
          </div>
          <h1 className="text-2xl font-black mt-1">{t.hostelBannerTitle}</h1>
          <p className="text-xs text-indigo-200 mt-0.5">
            {t.hostelBannerSubtitle}
          </p>
        </div>

        {/* Exam Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExamMode(!examMode)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
              examMode
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/15'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>{examMode ? t.examModeActive : t.examModeBtn}</span>
          </button>
        </div>
      </div>

      {/* 2. DEDICATED FLAT SPLITWISE BILL SPLITTER */}
      <HostelSplitwise
        expenses={expenses}
        onAddExpense={onAddExpense}
        onSettleExpense={onSettleExpense}
        currentUser={currentUser}
        language={language}
        householdMembers={householdMembers}
        onAddMember={onAddMember}
        onDeleteMember={onDeleteMember}
        onTriggerUpiModal={(title, amount, paidBy, upiId, expenseId) =>
          setActiveUpiModal({ title, amount, paidBy, upiId, expenseId })
        }
      />

      {/* 2.5 MONTHLY EXPENSE CALCULATOR & SPLITWISE EQUAL SHARE DIVISION (COLLECTS FROM GROCERIES & HOUSE CHORES) */}
      <MonthlyExpenseCalculator
        mode="hostel"
        language={language}
        shoppingItems={shoppingItems}
        hostelChores={chores}
        hostelExpenses={expenses}
        currentUser={currentUser}
        householdMembers={householdMembers}
        onTriggerUpiModal={(title, amount, paidBy, upiId, expenseId) =>
          setActiveUpiModal({ title, amount, paidBy, upiId, expenseId })
        }
      />

      {/* 3. HOSTEL MIDNIGHT SNACKS & FLAT GROCERY LIST */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 interactive-card hover-glow-indigo">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <ShoppingCart className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-base text-slate-900">
                {t.midnightSnacksTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {pendingSnacksCount} {t.midnightSnacksSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleShareToFlatWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.shareToFlatWhatsApp}</span>
            </button>

            <button
              onClick={() => setShowQuickCommerce(!showQuickCommerce)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{showQuickCommerce ? 'Hide Catalog' : '⚡ 10-Min Delivery'}</span>
            </button>
          </div>
        </div>

        {copiedGroupToast && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Copied and opened WhatsApp!</span>
          </div>
        )}

        {splitSuccessToast && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn shadow-md">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[3] text-white shrink-0" />
              <span>{splitSuccessToast}</span>
            </div>
            <button
              onClick={() => setSplitSuccessToast(null)}
              className="text-white/80 hover:text-white font-bold text-xs cursor-pointer ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1-Tap Quick Hostel Snacks Shortcuts */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
            {t.quickSnacksHeader}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { title: 'Maggi 2-Min Noodles (Pack of 4)', qty: '1 pack', cat: 'snacks', price: '₹56' },
              { title: 'Farm Fresh Eggs (6 pcs)', qty: '1 box', cat: 'dairy', price: '₹48' },
              { title: 'Amul Salted Butter (100g)', qty: '1 unit', cat: 'dairy', price: '₹58' },
              { title: 'Whole Wheat Bread Loaf', qty: '1 loaf', cat: 'staples', price: '₹45' },
              { title: 'Bisleri 20L Water Canister', qty: '1 can', cat: 'other', price: '₹80' },
            ].map((shortcut, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAddSnack(shortcut.title, shortcut.qty, shortcut.cat)}
                className="px-3 py-1.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/80 text-indigo-950 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-102"
              >
                <Plus className="w-3 h-3 text-indigo-600 stroke-[3]" />
                <span>{shortcut.title}</span>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-white px-1.5 py-0.2 rounded-md">
                  {shortcut.price}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleAddSnack} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t.addSnackPlaceholder}
            value={newSnackTitle}
            onChange={(e) => setNewSnackTitle(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
          />
          <input
            type="text"
            placeholder="Qty (e.g. 2 pkts)"
            value={newSnackQty}
            onChange={(e) => setNewSnackQty(e.target.value)}
            className="w-28 px-3 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add</span>
          </button>
        </form>

        {/* Grocery Items List */}
        <div className="space-y-2">
          {shoppingItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-medium">
              No flat groceries added yet. Quick-add Maggi, Eggs, or Bread above!
            </div>
          ) : (
            shoppingItems.map((item) => {
              const isBought = item.status === 'bought';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                    isBought
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200/90 shadow-xs hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleShoppingItem(item.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isBought
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      {isBought && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isBought ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {item.title}
                        </span>

                        {/* Editable Quantity Stepper */}
                        {item.quantity && (
                          <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 overflow-hidden text-[11px] font-bold text-slate-700">
                            <button
                              type="button"
                              onClick={() => handleStepQty(item, -1)}
                              className="px-1.5 py-0.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="px-2 py-0.5 font-mono">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleStepQty(item, 1)}
                              className="px-1.5 py-0.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {language === 'hi' ? 'जोड़ा:' : language === 'bn' ? 'যুক্ত:' : 'Added by:'} <strong className="text-slate-600">{item.addedBy}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit Item Button */}
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title={t.editItem}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* 1-Click Convert to Flat Split Expense */}
                    <button
                      onClick={() => setSplitModalItem(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs hover:scale-102"
                      title="Split this cost across flatmates"
                    >
                      <IndianRupee className="w-3 h-3 text-emerald-700" />
                      <span>{t.splitInFlatBtn}</span>
                    </button>

                    <button
                      onClick={() => onDeleteShoppingItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Commerce Drawer */}
        {showQuickCommerce && (
          <div className="pt-2">
            <QuickCommerceHub
              shoppingItems={shoppingItems}
              onAddItem={onAddShoppingItem}
              currentMode="hostel"
              language={language}
            />
          </div>
        )}
      </section>

      {/* 4. Grid: Mess Menu vs Cheap Meal & Weekly Spend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MESS MENU & SKIP COOKING */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between interactive-card">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">{t.messMenuTitle}</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {todayMess.day}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">{t.lunchLabel}</span>
                <p className="text-xs font-bold text-slate-800 mt-1">{todayMess.lunch}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200">
                <span className="text-[10px] uppercase font-bold text-indigo-700">{t.dinnerLabel}</span>
                <p className="text-xs font-bold text-indigo-950 mt-1">{todayMess.dinner}</p>
              </div>
            </div>

            {/* Skip Dinner & Shelf Recipe Card */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-950">
                  {todayMess.skippedDinnerToday
                    ? language === 'hi' ? 'आज रात मेस छोड़ दिया। फ्लैट से बना रहे हैं!' : language === 'bn' ? 'আজ মেস ছাড়া হয়েছে। ফ্ল্যাটে রান্না হচ্ছে!' : 'Dinner skipped in mess. Cooking from flat pantry!'
                    : t.skipMessPrompt}
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {language === 'hi' ? 'फ्लैट में उपलब्ध सामग्री:' : language === 'bn' ? 'উপলব্ধ সামগ্রী:' : 'Shelf staples available:'} <strong>Eggs (4 pcs)</strong>, <strong>Bread</strong>,{' '}
                  <strong>Maggi (2 pkts)</strong>
                </p>
              </div>

              <button
                onClick={() => onToggleSkipMess(todayMess.day)}
                className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all shadow-xs cursor-pointer ${
                  todayMess.skippedDinnerToday
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
                }`}
              >
                {todayMess.skippedDinnerToday ? t.skippingMessActive : t.skipMessBtn}
              </button>
            </div>
          </div>

          {/* ₹50 Late Night Quick Recipe */}
          {todayMess.skippedDinnerToday && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <span className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                    {t.suggestedLateMeal}
                  </span>
                  <p className="text-xs font-bold text-indigo-900 mt-0.5">
                    Spicy Egg Bhurji Toast • 8 mins • Total: ₹28
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                {t.budgetFriendlyBadge}
              </span>
            </div>
          )}
        </div>

        {/* CHORE PENALTY FUND & WEEKLY SPEND */}
        <div className="space-y-4">
          {/* Penalty Jar Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-300 p-5 shadow-xs interactive-card hover-glow-amber">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  {t.penaltyJarTitle}
                </h4>
                <p className="text-2xl font-black text-amber-900 mt-0.5">₹{penaltyFund}</p>
              </div>
            </div>
            <p className="text-[11px] text-amber-800 mt-2">
              {t.penaltyJarDesc}
            </p>
          </div>

          {/* Weekly Budget Gauge */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs interactive-card">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.weeklyBudgetTitle}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{totalSpentWeek}</div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.weeklyBudgetDesc} ₹{weeklyBudget} ({budgetPercentage}%)
            </p>

            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercentage > 85 ? 'bg-rose-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. CHORE ROTA SYSTEM WITH AI SUGGESTIONS & REFRESH */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs interactive-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-indigo-600" />
              <span>{t.choresRotaTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.choresRotaSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAiSuggestFlatChore}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{t.aiSuggestHostelChore}</span>
            </button>

            <button
              onClick={() => setShowAddChoreModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Chore</span>
            </button>

            {onRefreshChores && (
              <button
                onClick={onRefreshChores}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title={t.refreshChores}
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {aiChoreToast && (
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{aiChoreToast}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {chores.map((chore) => {
            const isCompleted = chore.status === 'completed';

            return (
              <div
                key={chore.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-indigo-200 shadow-xs hover:border-indigo-400 hover-glow-indigo'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-600 uppercase text-[10px] tracking-wider">
                      {chore.dueDate}
                    </span>
                    {chore.skipCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {chore.skipCount}x Skipped
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{chore.task}</h4>
                  <p className="text-xs font-semibold text-indigo-700 mt-1">
                    {language === 'hi' ? 'ज़िम्मेदारी:' : language === 'bn' ? 'দায়িত্ব:' : 'Assigned to:'} <strong className="text-slate-900">{chore.assignee}</strong>
                  </p>
                </div>

                {!isCompleted ? (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onCompleteChore(chore.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t.doneBtn}
                    </button>
                    <button
                      onClick={() => onRotateChore(chore.id)}
                      title="Skip chore (+₹20 to penalty jar)"
                      className="px-2.5 py-2 rounded-xl border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      {t.skipPenaltyBtn}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 pt-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{t.choreCompletedBadge}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Chore Modal */}
      {showAddChoreModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">Add Flat Chore</h3>
              <button
                onClick={() => setShowAddChoreModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChoreSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chore Task *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wash bathroom, Mop kitchen floor, Refill water..."
                  value={choreTask}
                  onChange={(e) => setChoreTask(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Assignee *
                  </label>
                  <select
                    value={choreAssignee}
                    onChange={(e) => setChoreAssignee(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold bg-white"
                  >
                    {roommates.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                    {roommates.length === 0 && (
                      <option value="Me">Me</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Due Date / Time
                  </label>
                  <input
                    type="text"
                    value={choreDue}
                    onChange={(e) => setChoreDue(e.target.value)}
                    placeholder="e.g. Today 8 PM, Tomorrow"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChoreModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md cursor-pointer"
                >
                  Add Chore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Grocery Item Modal */}
      {editingItem && (
        <EditGroceryModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={onEditShoppingItem}
          language={language}
        />
      )}

      {/* Authentic Scannable UPI QR Modal */}
      {activeUpiModal && (
        <UpiPaymentModal
          isOpen={!!activeUpiModal}
          onClose={() => setActiveUpiModal(null)}
          title={activeUpiModal.title}
          amount={activeUpiModal.amount}
          paidBy={activeUpiModal.paidBy}
          upiId={activeUpiModal.upiId}
          onMarkSettled={() => {
            if (activeUpiModal.expenseId) {
              onSettleExpense(activeUpiModal.expenseId);
            }
            setActiveUpiModal(null);
          }}
        />
      )}

      {/* Interactive Split in Flat Modal */}
      {splitModalItem && (
        <SplitSnackModal
          isOpen={!!splitModalItem}
          onClose={() => setSplitModalItem(null)}
          item={splitModalItem}
          currentUser={currentUser}
          roommates={roommates}
          onConfirmSplit={(title, amount, paidBy, upiId, markBought) => {
            onAddExpense({
              title: `Snacks: ${title}`,
              amount,
              paidBy,
              splitWith: roommates.length > 0 ? roommates : [paidBy],
              upiId,
              settled: false,
            });
            if (markBought && splitModalItem.status === 'pending') {
              onToggleShoppingItem(splitModalItem.id);
            }
            playChimeSound();
            const flatmateCount = Math.max(1, roommates.length);
            const share = Math.round(amount / flatmateCount);
            setSplitSuccessToast(
              `🎉 Split added for "${title}"! Total ₹${amount} divided among ${flatmateCount} flatmate${flatmateCount > 1 ? 's' : ''} (₹${share}/person)`
            );
            setTimeout(() => setSplitSuccessToast(null), 5000);
            setSplitModalItem(null);
          }}
          onOpenUpiQr={(title, amount, paidBy, upiId) => {
            onAddExpense({
              title: `Snacks: ${title}`,
              amount,
              paidBy,
              splitWith: roommates.length > 0 ? roommates : [paidBy],
              upiId,
              settled: false,
            });
            if (splitModalItem.status === 'pending') {
              onToggleShoppingItem(splitModalItem.id);
            }
            playChimeSound();
            setSplitModalItem(null);
            const flatmateCount = Math.max(1, roommates.length);
            setActiveUpiModal({
              title: `Split: ${title}`,
              amount: Math.round(amount / flatmateCount),
              paidBy,
              upiId,
              expenseId: `e-split-${Date.now()}`,
            });
          }}
          language={language}
        />
      )}
    </div>
  );
};
