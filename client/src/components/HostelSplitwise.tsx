import React, { useState } from 'react';
import { HostelExpense, Language, UserAccount } from '../types';
import {
  IndianRupee,
  Plus,
  QrCode,
  CheckCircle,
  Users,
  Receipt,
  ArrowRight,
  Sparkles,
  PieChart,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { translations } from '../utils/translations';

interface HostelSplitwiseProps {
  expenses: HostelExpense[];
  onAddExpense: (expense: Omit<HostelExpense, 'id' | 'date'>) => void;
  onSettleExpense: (id: string) => void;
  currentUser: UserAccount | null;
  language: Language;
  householdMembers?: string[];
  onAddMember?: (name: string) => void;
  onDeleteMember?: (name: string) => void;
  onTriggerUpiModal: (title: string, amount: number, paidBy: string, upiId: string, expenseId: string) => void;
}

export const HostelSplitwise: React.FC<HostelSplitwiseProps> = ({
  expenses,
  onAddExpense,
  onSettleExpense,
  currentUser,
  language,
  householdMembers = [],
  onAddMember,
  onDeleteMember,
  onTriggerUpiModal,
}) => {
  const t = translations[language];

  // Dynamic Flatmates
  const roommates = householdMembers.length > 0
    ? householdMembers
    : currentUser?.displayName
    ? [currentUser.displayName]
    : [];

  const userRoommateName = currentUser?.displayName || roommates[0] || 'Me';

  // Inline flatmate addition
  const [showAddFlatmate, setShowAddFlatmate] = useState(false);
  const [newFlatmateName, setNewFlatmateName] = useState('');

  const handleAddFlatmateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlatmateName.trim() || !onAddMember) return;
    onAddMember(newFlatmateName.trim());
    setNewFlatmateName('');
    setShowAddFlatmate(false);
  };

  // Add Expense form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(userRoommateName);
  const [selectedSplit, setSelectedSplit] = useState<string[]>(roommates);
  const [upiId, setUpiId] = useState(
    `${userRoommateName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'payee'}@upi`
  );

  // Sync selected split when roommates change
  React.useEffect(() => {
    setSelectedSplit(roommates);
  }, [householdMembers]);

  // Calculate Net Balances
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Compute how much each roommate paid (unsettled) and how much they owe (unsettled)
  const balances: Record<string, number> = {};
  roommates.forEach((p) => {
    balances[p] = 0;
  });

  expenses.forEach((exp) => {
    if (!exp.settled) {
      const splitCount = exp.splitWith.length || 1;
      const share = exp.amount / splitCount;

      // Payer gets credited
      balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;

      // Participants get debited their share
      exp.splitWith.forEach((person) => {
        balances[person] = (balances[person] || 0) - share;
      });
    }
  });

  const myBalance = balances[userRoommateName] || 0;

  // Compute pairwise debts
  interface PairDebt {
    from: string;
    to: string;
    amount: number;
    upiId: string;
    expenseId?: string;
  }

  const debts: PairDebt[] = [];
  const debtors = Object.keys(balances).filter((p) => balances[p] < -0.5);
  const creditors = Object.keys(balances).filter((p) => balances[p] > 0.5);

  debtors.forEach((debtor) => {
    creditors.forEach((creditor) => {
      // Find unsettled expenses between them
      const relatedExpense = expenses.find(
        (e) => !e.settled && e.paidBy === creditor && e.splitWith.includes(debtor)
      );

      const debtAmount = relatedExpense
        ? Math.round(relatedExpense.amount / (relatedExpense.splitWith.length || 1))
        : Math.round(Math.min(Math.abs(balances[debtor]), balances[creditor]));

      if (debtAmount > 0) {
        debts.push({
          from: debtor,
          to: creditor,
          amount: debtAmount,
          upiId:
            `${creditor.toLowerCase().replace(/[^a-z0-9]/g, '') || 'payee'}@upi`,
          expenseId: relatedExpense?.id,
        });
      }
    });
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onAddExpense({
      title: title.trim(),
      amount: numAmount,
      paidBy: paidBy,
      splitWith: selectedSplit.length > 0 ? selectedSplit : roommates,
      upiId: upiId.trim() || `${paidBy.toLowerCase()}@upi`,
      settled: false,
    });

    setTitle('');
    setAmount('');
    setShowAddModal(false);
  };

  const toggleSplitUser = (person: string) => {
    if (selectedSplit.includes(person)) {
      if (selectedSplit.length > 1) {
        setSelectedSplit(selectedSplit.filter((p) => p !== person));
      }
    } else {
      setSelectedSplit([...selectedSplit, person]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 p-6 shadow-sm interactive-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <PieChart className="w-5 h-5" />
            </span>
            <h3 className="font-black text-lg text-slate-900 tracking-tight">
              {t.splitwiseTitle}
            </h3>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              Splitwise Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.splitwiseSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {!showAddFlatmate ? (
            <button
              onClick={() => setShowAddFlatmate(true)}
              className="px-3 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Add Flatmate</span>
            </button>
          ) : (
            <form onSubmit={handleAddFlatmateSubmit} className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Flatmate name..."
                value={newFlatmateName}
                onChange={(e) => setNewFlatmateName(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-indigo-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
                autoFocus
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddFlatmate(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </form>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.addExpenseBtn}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Spend */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {t.totalFlatSpend}
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            ₹{totalSpend.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {expenses.length} flat transactions logged
          </span>
        </div>

        {/* Your Net Balance */}
        <div
          className={`p-4 rounded-2xl border ${
            myBalance > 0
              ? 'bg-emerald-50/70 border-emerald-200'
              : myBalance < 0
              ? 'bg-rose-50/70 border-rose-200'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            {myBalance >= 0 ? t.youAreOwed : t.youOwe}
          </span>
          <div
            className={`text-2xl font-black font-mono mt-1 ${
              myBalance > 0
                ? 'text-emerald-700'
                : myBalance < 0
                ? 'text-rose-700'
                : 'text-slate-800'
            }`}
          >
            {myBalance >= 0 ? `+₹${Math.round(myBalance)}` : `-₹${Math.round(Math.abs(myBalance))}`}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Active user: <span className="font-bold text-slate-700">{userRoommateName}</span>
          </span>
        </div>

        {/* Flatmate Quick Balances */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
              Flatmate Breakdown ({roommates.length})
            </span>
          </div>
          <div className="space-y-1 mt-1 text-xs">
            {roommates.length === 0 ? (
              <span className="text-slate-400 text-[11px] italic">No flatmates added yet</span>
            ) : (
              roommates.map((p) => {
                const b = Math.round(balances[p] || 0);
                return (
                  <div key={p} className="flex items-center justify-between group">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-700 font-medium truncate max-w-[100px]">{p}:</span>
                      {onDeleteMember && roommates.length > 1 && (
                        <button
                          onClick={() => onDeleteMember(p)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 text-[10px] cursor-pointer"
                          title={`Remove ${p}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        b > 0 ? 'text-emerald-600' : b < 0 ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      {b > 0 ? `+₹${b}` : b < 0 ? `-₹${Math.abs(b)}` : '₹0'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Settle Up Dues List */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          <span>Pending Roommate Debts & Settle Up</span>
        </h4>

        {debts.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{t.allSettledNotice}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {debts.map((debt, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <span className="text-rose-600">{debt.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-emerald-700">{debt.to}</span>
                  </div>
                  <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                    ₹{debt.amount}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    UPI: {debt.upiId}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() =>
                      onTriggerUpiModal(
                        `Splitwise Settlement: ${debt.from} to ${debt.to}`,
                        debt.amount,
                        debt.to,
                        debt.upiId,
                        debt.expenseId || ''
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{t.settleUpBtn}</span>
                  </button>

                  {debt.expenseId && (
                    <button
                      onClick={() => onSettleExpense(debt.expenseId!)}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-[10px] transition-colors cursor-pointer"
                    >
                      {t.recordSettlement}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Split Expenses Activity Feed */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-indigo-600" />
          <span>Shared Expenses Activity ({expenses.length})</span>
        </h4>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {expenses.map((expense) => {
            const splitAmount = Math.round(expense.amount / (expense.splitWith.length || 1));

            return (
              <div
                key={expense.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                  expense.settled
                    ? 'bg-slate-50/60 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200/90 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{expense.title}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>
                        Paid by <strong className="text-slate-700">{expense.paidBy}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Split {expense.splitWith.length} ways (₹{splitAmount}/person)
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-400">{expense.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-black font-mono text-slate-900 text-sm block">
                      ₹{expense.amount}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        expense.settled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {expense.settled ? 'Settled ✓' : 'Pending'}
                    </span>
                  </div>

                  {!expense.settled && (
                    <button
                      onClick={() =>
                        onTriggerUpiModal(
                          expense.title,
                          splitAmount,
                          expense.paidBy,
                          expense.upiId,
                          expense.id
                        )
                      }
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors cursor-pointer"
                      title="1-Tap Pay via UPI QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal to Add New Shared Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <span>Add Flat Shared Expense</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy Pizza, Wi-Fi Bill, Milk & Eggs run..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Total Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="₹ 450"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {t.paidByLabel}
                  </label>
                  <select
                    value={paidBy}
                    onChange={(e) => {
                      setPaidBy(e.target.value);
                      setUpiId(`${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') || 'payee'}@upi`);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                  >
                    {roommates.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Payee UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@upi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  {t.splitWithLabel}
                </label>
                <div className="flex items-center gap-2">
                  {roommates.map((person) => {
                    const isSelected = selectedSplit.includes(person);
                    return (
                      <button
                        type="button"
                        key={person}
                        onClick={() => toggleSplitUser(person)}
                        className={`flex-1 py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {person}
                      </button>
                    );
                  })}
                </div>
                {amount && (
                  <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                    Equal split: ₹
                    {Math.round(parseFloat(amount || '0') / (selectedSplit.length || 1))}{' '}
                    each ({selectedSplit.length} roommates)
                  </p>
                )}
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md cursor-pointer"
                >
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
