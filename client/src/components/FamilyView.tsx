import React, { useState } from 'react';
import { ShoppingItem, PantryItem, Language, FamilyChore, UserAccount } from '../types';
import {
  ShoppingCart,
  Check,
  Trash2,
  Share2,
  Copy,
  Calendar,
  Zap,
  Flame,
  Droplet,
  Plus,
  Minus,
  Edit3,
} from 'lucide-react';
import { exportKiranaWhatsApp } from '../utils/api';
import { QuickCommerceHub } from './QuickCommerceHub';
import { FamilyChoresHub } from './FamilyChoresHub';
import { MonthlyExpenseCalculator } from './MonthlyExpenseCalculator';
import { EditGroceryModal } from './EditGroceryModal';
import { translations } from '../utils/translations';

interface FamilyViewProps {
  shoppingItems: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id'>) => void;
  onEditShoppingItem: (id: string, updated: { title: string; quantity: string; category?: string }) => void;
  pantryItems: PantryItem[];
  language: Language;
  currentUser: UserAccount | null;
  familyChores: FamilyChore[];
  onToggleFamilyChore: (id: string) => void;
  onAddFamilyChore: (chore: Omit<FamilyChore, 'id'>) => void;
  onDeleteFamilyChore: (id: string) => void;
  onRefreshFamilyChores: () => void;
}

export const FamilyView: React.FC<FamilyViewProps> = ({
  shoppingItems,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onEditShoppingItem,
  pantryItems,
  language,
  currentUser,
  familyChores,
  onToggleFamilyChore,
  onAddFamilyChore,
  onDeleteFamilyChore,
  onRefreshFamilyChores,
}) => {
  const [manualTitle, setManualTitle] = useState('');
  const [manualQty, setManualQty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [paidBills, setPaidBills] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  const t = translations[language];

  const categories = [
    { id: 'all', label: t.allCategories },
    { id: 'dairy', label: t.dairyCategory },
    { id: 'vegetables', label: t.veggiesCategory },
    { id: 'staples', label: t.staplesCategory },
    { id: 'snacks', label: t.snacksCategory },
  ];

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    onAddItem({
      title: manualTitle.trim(),
      quantity: manualQty.trim() || '1 unit',
      category: 'other',
      addedBy: currentUser?.displayName || (language === 'hi' ? 'मैन्युअल एंट्री' : language === 'bn' ? 'ম্যানুয়াল এন্ট্রি' : 'Family Member'),
      status: 'pending',
      reason: 'manual',
    });

    setManualTitle('');
    setManualQty('');
  };

  const handleOpenWhatsApp = async () => {
    const pending = shoppingItems.filter((i) => i.status === 'pending');
    if (pending.length === 0) {
      alert(
        language === 'hi'
          ? 'आपकी किराना सूची में कोई सामान बाकी नहीं है!'
          : language === 'bn'
          ? 'মুদি তালিকায় কোনো বাকি সামগ্রী নেই!'
          : 'Your shopping list has no pending items!'
      );
      return;
    }

    const exportData = pending.map((item) => ({
      title: item.title,
      quantity: item.quantity || '1 unit',
    }));

    const result = await exportKiranaWhatsApp(exportData, language);
    window.open(result.whatsappUrl, '_blank');
  };

  const handleCopyForQuickCommerce = () => {
    const pending = shoppingItems.filter((i) => i.status === 'pending');
    if (pending.length === 0) return;

    const plainList = pending.map((i) => `${i.title} (${i.quantity || '1 unit'})`).join(', ');
    navigator.clipboard.writeText(plainList);
    setCopiedNotification(
      language === 'hi'
        ? 'Blinkit / Zepto / Instamart के लिए कॉपी किया गया!'
        : language === 'bn'
        ? 'Blinkit / Zepto-র জন্য কপি করা হয়েছে!'
        : 'Copied for Blinkit / Zepto / Instamart!'
    );
    setTimeout(() => setCopiedNotification(null), 3000);
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

  const toggleBillPaid = (billTitle: string) => {
    setPaidBills((prev) =>
      prev.includes(billTitle) ? prev.filter((b) => b !== billTitle) : [...prev, billTitle]
    );
  };

  const filteredItems =
    selectedCategory === 'all'
      ? shoppingItems
      : shoppingItems.filter((i) => i.category === selectedCategory);

  const pendingCount = shoppingItems.filter((i) => i.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 interactive-card hover-glow-emerald">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
            {t.familyProfileBadge}
          </span>
          <h1 className="text-2xl font-black mt-1">{t.familyBannerTitle}</h1>
          <p className="text-xs text-emerald-200 mt-0.5">
            {t.familyBannerSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span>{t.sendListWhatsApp}</span>
          </button>
        </div>
      </div>

      {/* 2. FAMILY HOUSE CHORES HUB (LIST, MEMBER ASSIGNMENT & AI SUGGESTIONS) */}
      <FamilyChoresHub
        chores={familyChores}
        onToggleChore={onToggleFamilyChore}
        onAddChore={onAddFamilyChore}
        onDeleteChore={onDeleteFamilyChore}
        onRefreshChores={onRefreshFamilyChores}
        currentUser={currentUser}
        language={language}
      />

      {/* 3. SHARED KIRANA & MONTHLY BILLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SHARED KIRANA LIST */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 interactive-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <span>{t.sharedKiranaTitle}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {pendingCount} {t.sharedKiranaSubtitle}
              </p>
            </div>

            <button
              onClick={handleCopyForQuickCommerce}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.copyForQuickCommerce}</span>
            </button>
          </div>

          {copiedNotification && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{copiedNotification}</span>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Manual Add Input */}
          <form onSubmit={handleManualAdd} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={
                language === 'hi'
                  ? 'सामान लिखें (जैसे: आटा 5kg, दूध, चायपत्ती)...'
                  : language === 'bn'
                  ? 'মুদি সামগ্রী লিখুন (যেমন: চাল ৫ কেজি, ডিম, চিনি)...'
                  : 'Add grocery item (e.g. Atta 5kg, Amul Butter, Ghee)...'
              }
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
            />
            <input
              type="text"
              placeholder="Qty (1kg, 2pkts)"
              value={manualQty}
              onChange={(e) => setManualQty(e.target.value)}
              className="w-28 px-3 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t.addItemBtn}</span>
            </button>
          </form>

          {/* Grocery Items List */}
          <div className="space-y-2">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                No items in this category. Use the box above or AI camera to add!
              </div>
            ) : (
              filteredItems.map((item) => {
                const isBought = item.status === 'bought';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                      isBought
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200/90 shadow-xs hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleItem(item.id)}
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
                          <span
                            className={`font-bold text-sm ${
                              isBought ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
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
                          {language === 'hi' ? 'स्रोत:' : language === 'bn' ? 'উৎস:' : 'Source:'}{' '}
                          <span className="font-semibold text-slate-600">{item.addedBy}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Item Button */}
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title={t.editItem}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MONTHLY BILLS & RECHARGES */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm interactive-card">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>{t.billsRechargeTitle}</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{t.billsRechargeSubtitle}</p>

            <div className="mt-4 space-y-3">
              {[
                { title: 'Electricity (BSES Rajdhani)', due: 'Due 12 Oct', amount: '₹1,840', icon: Zap, color: 'text-amber-500' },
                { title: 'Indane Gas Cylinder Booking', due: 'Due 18 Oct', amount: '₹853', icon: Flame, color: 'text-orange-500' },
                { title: 'Kent RO Water Purifier Filter', due: 'Due 25 Oct', amount: '₹450', icon: Droplet, color: 'text-blue-500' },
              ].map((bill, idx) => {
                const isPaid = paidBills.includes(bill.title);

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                      isPaid
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <bill.icon className={`w-4 h-4 ${bill.color}`} />
                      <div>
                        <span className={`font-bold ${isPaid ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {bill.title}
                        </span>
                        <p className="text-[11px] text-slate-400">{bill.due}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-900">{bill.amount}</span>
                      <button
                        onClick={() => toggleBillPaid(bill.title)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isPaid ? t.paidBadge : t.markPaidBtn}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3.5 MONTHLY EXPENSE CALCULATOR (COLLECTS DATA FROM GROCERIES & FAMILY CHORES) */}
      <MonthlyExpenseCalculator
        mode="family"
        language={language}
        shoppingItems={shoppingItems}
        familyChores={familyChores}
        currentUser={currentUser}
      />

      {/* 4. QUICK COMMERCE RECOMMENDATIONS & PRICE COMPARISON */}
      <QuickCommerceHub
        shoppingItems={shoppingItems}
        onAddItem={onAddItem}
        currentMode="family"
        language={language}
      />

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
    </div>
  );
};
