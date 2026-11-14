import React, { useState, useEffect } from 'react';
import {
  AppMode,
  Language,
  ShoppingItem,
  UserAccount,
  MonthlyBillRecord,
  PaymentGatewayResponse,
} from '../types';
import {
  IndianRupee,
  Receipt,
  PieChart,
  Plus,
  Share2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Building,
  Zap,
  Trash2,
  Lock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  fetchMonthlyBills,
  createMonthlyBill,
  payMonthlyBillApi,
  deleteMonthlyBillApi,
} from '../utils/api';
import { BillPaymentGatewayModal } from './BillPaymentGatewayModal';
import { HouseholdKhataModal } from './HouseholdKhataModal';
import { translations } from '../utils/translations';

interface MonthlyExpenseCalculatorProps {
  mode: AppMode;
  language: Language;
  shoppingItems: ShoppingItem[];
  currentUser: UserAccount | null;
  householdMembers?: string[];
  familyChores?: any[];
  hostelChores?: any[];
  hostelExpenses?: any[];
  onTriggerUpiModal?: (
    title: string,
    amount: number,
    paidBy: string,
    upiId: string,
    expenseId: string
  ) => void;
}

export const MonthlyExpenseCalculator: React.FC<MonthlyExpenseCalculatorProps> = ({
  mode,
  language,
  shoppingItems,
  currentUser,
  householdMembers = [],
  onTriggerUpiModal,
}) => {
  const t = translations[language];
  const householdId = currentUser?.householdId || 'family_household';

  // Automated Monthly Bills & Reminders (Starting from scratch - pure user inputted)
  const [bills, setBills] = useState<MonthlyBillRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Add Recurring Bill Form State
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billCategory, setBillCategory] = useState<MonthlyBillRecord['category']>('rent');
  const [billDueDay, setBillDueDay] = useState(5);
  const [billerAccount, setBillerAccount] = useState('');
  const [billNotes, setBillNotes] = useState('');
  const [autoReminder, setAutoReminder] = useState(true);

  // Payment Gateway Modal State
  const [payingBill, setPayingBill] = useState<MonthlyBillRecord | null>(null);

  // Digital Khata Modal State
  const [isKhataOpen, setIsKhataOpen] = useState(false);

  // Feedback Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load recurring bills from persistent database/backend
  const loadBills = async () => {
    setLoading(true);
    try {
      const data = await fetchMonthlyBills(householdId);
      setBills(data);
    } catch (err) {
      console.warn('Error fetching monthly bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [householdId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Handle Add Recurring Bill ──
  const handleAddBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billTitle.trim()) return;
    const parsedAmount = parseFloat(billAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    try {
      const newBill = await createMonthlyBill({
        householdId,
        title: billTitle.trim(),
        category: billCategory,
        amount: parsedAmount,
        dueDay: Number(billDueDay) || 5,
        billerAccount: billerAccount.trim(),
        autoReminder,
        notes: billNotes.trim(),
      });

      setBills((prev) => [newBill, ...prev]);
      showToast(`Automated reminder set for ${newBill.title} on the ${newBill.dueDay}th of every month!`);

      // Reset
      setBillTitle('');
      setBillAmount('');
      setBillCategory('rent');
      setBillDueDay(5);
      setBillerAccount('');
      setBillNotes('');
      setShowAddBillModal(false);
    } catch (err) {
      showToast('Could not schedule recurring bill');
    }
  };

  // ── Handle Payment Gateway Success ──
  const handlePaymentGatewaySuccess = (res: PaymentGatewayResponse) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === payingBill?.id
          ? {
              ...b,
              status: 'paid',
              paidDate: new Date().toISOString(),
              paidVia: res.paymentMethod.toUpperCase(),
              transactionRef: res.transactionId,
            }
          : b
      )
    );
    showToast(`Payment of ₹${res.amountPaid} for ${res.billerName} verified & cleared!`);
    setPayingBill(null);
  };

  // ── Delete Bill ──
  const handleDeleteBill = async (id: string, title: string) => {
    if (!confirm(`Remove recurring reminder for "${title}"?`)) return;
    try {
      await deleteMonthlyBillApi(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
      showToast(`Removed "${title}" from monthly schedule`);
    } catch (err) {
      showToast('Could not delete bill');
    }
  };

  // ── Manual Mark as Paid Toggle ──
  const handleToggleManualPaid = async (bill: MonthlyBillRecord) => {
    try {
      if (bill.status === 'paid') {
        // Toggle back to pending
        setBills((prev) =>
          prev.map((b) => (b.id === bill.id ? { ...b, status: 'pending', paidDate: undefined } : b))
        );
        showToast(`Reset "${bill.title}" to pending`);
      } else {
        await payMonthlyBillApi(bill.id, 'Cash / Manual', `MANUAL_${Date.now()}`);
        setBills((prev) =>
          prev.map((b) =>
            b.id === bill.id
              ? { ...b, status: 'paid', paidDate: new Date().toISOString(), paidVia: 'Direct' }
              : b
          )
        );
        showToast(`Marked "${bill.title}" as paid!`);
      }
    } catch (err) {
      showToast('Could not update bill status');
    }
  };

  // ── Totals & Metrics ──
  const totalBillsAmount = bills.reduce((acc, b) => acc + b.amount, 0);
  const paidBillsAmount = bills.filter((b) => b.status === 'paid').reduce((acc, b) => acc + b.amount, 0);
  const pendingBillsAmount = totalBillsAmount - paidBillsAmount;

  const currentMonthName = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Share Statement via WhatsApp
  const handleShareReportWhatsApp = () => {
    let text = `📊 *HomeMate Monthly Household Expense & Bill Statement*\n`;
    text += `📅 Month: *${currentMonthName}*\n`;
    text += `💰 Total Monthly Obligations: *₹${totalBillsAmount.toLocaleString('en-IN')}*\n`;
    text += `✅ Paid so far: *₹${paidBillsAmount.toLocaleString('en-IN')}*\n`;
    text += `⏳ Pending to Pay: *₹${pendingBillsAmount.toLocaleString('en-IN')}*\n\n`;

    text += `*Bills Breakdown:*\n`;
    bills.forEach((b, idx) => {
      text += `${idx + 1}. ${b.title} (Due: ${b.dueDay}th) - ₹${b.amount} [${b.status.toUpperCase()}]\n`;
    });

    text += `\n_Automated reminder tracked digitally on HomeMate AI OS_`;

    navigator.clipboard.writeText(text);
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
              <Calendar className="w-5 h-5" />
            </span>
            <h3 className="font-black text-lg text-slate-900 tracking-tight">
              Automated Monthly Expenses & Bill Reminders
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {currentMonthName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Input your recurring household expenses once; the system notes them and automatically keeps monthly reminders with integrated payment gateways.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Digital Khata Trigger */}
          <button
            onClick={() => setIsKhataOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs cursor-pointer transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Digital Khata (खाता)</span>
          </button>

          {/* Add Recurring Bill Button */}
          <button
            onClick={() => setShowAddBillModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Monthly Bill</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Monthly Summary Cards (Starting from scratch - derived purely from real user data) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Monthly Commitments */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            Total Monthly Obligations ({bills.length} Bills)
          </span>
          <div className="text-2xl font-black text-slate-900 flex items-center">
            <IndianRupee className="w-5 h-5 stroke-[2.5]" />
            <span>{totalBillsAmount.toLocaleString('en-IN')}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {bills.length === 0 ? 'No expenses added yet — start by clicking + Add' : 'Recurring every month'}
          </span>
        </div>

        {/* Paid So Far */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <span className="text-xs font-bold text-emerald-800 block mb-1">
            Paid & Cleared This Month
          </span>
          <div className="text-2xl font-black text-emerald-700 flex items-center">
            <IndianRupee className="w-5 h-5 stroke-[2.5]" />
            <span>{paidBillsAmount.toLocaleString('en-IN')}</span>
          </div>
          <span className="text-[10px] text-emerald-600 mt-1 block">
            {bills.filter((b) => b.status === 'paid').length} of {bills.length} bills settled
          </span>
        </div>

        {/* Pending & Due */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
          <span className="text-xs font-bold text-amber-900 block mb-1">
            Pending / Due to Pay
          </span>
          <div className="text-2xl font-black text-amber-700 flex items-center">
            <IndianRupee className="w-5 h-5 stroke-[2.5]" />
            <span>{pendingBillsAmount.toLocaleString('en-IN')}</span>
          </div>
          <span className="text-[10px] text-amber-700 mt-1 block">
            {bills.filter((b) => b.status !== 'paid').length} payments outstanding
          </span>
        </div>
      </div>

      {/* Bills Reminder List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Active Automated Reminders & Payment Status</span>
          </h4>

          {bills.length > 0 && (
            <button
              onClick={handleShareReportWhatsApp}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Statement on WhatsApp</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                bill.status === 'paid'
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : bill.status === 'due_soon'
                  ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                  : bill.status === 'overdue'
                  ? 'bg-rose-50/40 border-rose-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">
                        {bill.title}
                      </span>
                      {/* Status Badge */}
                      {bill.status === 'paid' ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Paid ({bill.paidVia || 'Cleared'})</span>
                        </span>
                      ) : bill.status === 'due_soon' ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Due in 3 Days</span>
                        </span>
                      ) : bill.status === 'overdue' ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Overdue</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Due {bill.dueDay}th
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 capitalize">
                      {bill.category} • Scheduled on the {bill.dueDay}th of each month
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteBill(bill.id, bill.title)}
                    title="Remove reminder"
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {bill.billerAccount && (
                  <div className="mt-1.5 text-[11px] font-mono text-slate-500">
                    Biller ID / Account: {bill.billerAccount}
                  </div>
                )}

                {bill.notes && (
                  <p className="mt-1 text-[11px] text-slate-500 italic">
                    "{bill.notes}"
                  </p>
                )}
              </div>

              {/* Amount & Direct Gateway Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Amount</span>
                  <div className="text-lg font-black text-slate-900 flex items-center">
                    <IndianRupee className="w-4 h-4 stroke-[2.5]" />
                    <span>{bill.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleManualPaid(bill)}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    {bill.status === 'paid' ? 'Mark Unpaid' : 'Mark Cash'}
                  </button>

                  {bill.status !== 'paid' && (
                    <button
                      onClick={() => setPayingBill(bill)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-xs cursor-pointer transition-all"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Pay via Gateway</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty State when user hasn't added expenses yet (Starting from scratch) */}
          {bills.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">
                  No monthly expenses or reminders setup yet
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Start from a clean slate! Add your rent, electricity bill, Wi-Fi, maid salary, or groceries once. HomeMate will automatically keep track of them and notify you every month.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setShowAddBillModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Monthly Bill</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Recurring Bill Modal */}
      {showAddBillModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="font-black text-base text-slate-900">
                  New Automated Monthly Reminder
                </h4>
              </div>
              <button
                onClick={() => setShowAddBillModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBillSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expense / Bill Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  placeholder="e.g. Apartment Rent, Electricity (BESCOM), Wi-Fi Fiber..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Due Day of Each Month
                  </label>
                  <select
                    value={billDueDay}
                    onChange={(e) => setBillDueDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {[1, 2, 3, 5, 7, 10, 15, 20, 25, 28, 30].map((day) => (
                      <option key={day} value={day}>
                        {day}th of every month
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={billCategory}
                    onChange={(e) => setBillCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="rent">House Rent</option>
                    <option value="electricity">Electricity Bill</option>
                    <option value="wifi">Wi-Fi & Broadband</option>
                    <option value="salary">Maid / Cook Salary</option>
                    <option value="gas">LPG Gas Cylinder</option>
                    <option value="maintenance">Society Maintenance</option>
                    <option value="water">Water / RO Can</option>
                    <option value="groceries">Monthly Kirana Pool</option>
                    <option value="medical">Senior Medicines / Care</option>
                    <option value="subscription">Subscriptions / Gym</option>
                    <option value="other">Other Recurring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Consumer / Biller Account No. (Optional)
                  </label>
                  <input
                    type="text"
                    value={billerAccount}
                    onChange={(e) => setBillerAccount(e.target.value)}
                    placeholder="e.g. 5010029104"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Payment Instructions
                </label>
                <input
                  type="text"
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  placeholder="e.g. Transfer to landlord via Google Pay"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="auto-reminder-check"
                  checked={autoReminder}
                  onChange={(e) => setAutoReminder(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="auto-reminder-check" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Automatically roll over and remind me every month
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBillModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm cursor-pointer"
                >
                  Save Monthly Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      <BillPaymentGatewayModal
        isOpen={!!payingBill}
        onClose={() => setPayingBill(null)}
        bill={payingBill}
        onPaymentSuccess={handlePaymentGatewaySuccess}
      />

      {/* Household Digital Khata Modal */}
      <HouseholdKhataModal
        isOpen={isKhataOpen}
        onClose={() => setIsKhataOpen(false)}
        householdId={householdId}
        language={language}
        onPayViaUpi={onTriggerUpiModal ? (title, amt, upi) => onTriggerUpiModal(title, amt, 'User', upi, `khata-${Date.now()}`) : undefined}
      />

    </div>
  );
};
