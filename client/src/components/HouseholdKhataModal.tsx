import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Trash2,
  IndianRupee,
  Share2,
  Phone,
  QrCode,
  AlertCircle,
  Check,
  Building,
  User,
  ShoppingBag,
  Milk,
  Sparkles,
} from 'lucide-react';
import { KhataRecord, Language } from '../types';
import {
  fetchKhataEntries,
  createKhataEntry,
  settleKhataEntryApi,
  deleteKhataEntryApi,
} from '../utils/api';

interface HouseholdKhataModalProps {
  isOpen: boolean;
  onClose: () => void;
  householdId?: string;
  language?: Language;
  onPayViaUpi?: (title: string, amount: number, upiId: string) => void;
}

export const HouseholdKhataModal: React.FC<HouseholdKhataModalProps> = ({
  isOpen,
  onClose,
  householdId = 'family_household',
  language = 'en',
  onPayViaUpi,
}) => {
  const [entries, setEntries] = useState<KhataRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unsettled' | 'settled'>('all');

  // Add Entry Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [partyRole, setPartyRole] = useState<KhataRecord['partyRole']>('kirana');
  const [entryType, setEntryType] = useState<'gave' | 'got'>('got');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [upiId, setUpiId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadKhata = async () => {
    setLoading(true);
    try {
      const data = await fetchKhataEntries(householdId);
      setEntries(data);
    } catch (err) {
      console.warn('Failed to load khata entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadKhata();
      setToastMessage(null);
    }
  }, [isOpen, householdId]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Khata Entry Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    try {
      const newEntry = await createKhataEntry({
        householdId,
        partyName: partyName.trim(),
        partyPhone: partyPhone.trim(),
        partyRole,
        type: entryType,
        amount: parsedAmount,
        description: description.trim() || `${entryType === 'got' ? 'Udhaar / Credit' : 'Payment / Advance'}`,
        date,
        upiId: upiId.trim(),
      });

      setEntries((prev) => [newEntry, ...prev]);
      showToast(`Recorded ₹${parsedAmount} for ${newEntry.partyName}`);

      // Reset
      setPartyName('');
      setPartyPhone('');
      setAmount('');
      setDescription('');
      setUpiId('');
      setShowAddForm(false);
    } catch (err) {
      showToast('Failed to save khata entry');
    }
  };

  // Settle entry
  const handleSettle = async (id: string, name: string) => {
    try {
      await settleKhataEntryApi(id);
      setEntries((prev) =>
        prev.map((k) => (k.id === id ? { ...k, settled: true, settledDate: new Date().toISOString() } : k))
      );
      showToast(`Marked account with ${name} as settled!`);
    } catch (err) {
      showToast('Could not settle entry');
    }
  };

  // Delete entry
  const handleDelete = async (id: string) => {
    if (!confirm('Remove this khata record?')) return;
    try {
      await deleteKhataEntryApi(id);
      setEntries((prev) => prev.filter((k) => k.id !== id));
      showToast('Entry removed from khata');
    } catch (err) {
      showToast('Could not delete entry');
    }
  };

  // Share WhatsApp Statement
  const handleShareWhatsApp = (party: string, list: KhataRecord[]) => {
    const netGave = list.filter((e) => e.type === 'gave' && !e.settled).reduce((s, e) => s + e.amount, 0);
    const netGot = list.filter((e) => e.type === 'got' && !e.settled).reduce((s, e) => s + e.amount, 0);
    const balance = netGot - netGave;

    let text = `📖 *HomeMate Household Khata Hisab (${party})*\n`;
    text += `Date: ${new Date().toLocaleDateString('en-IN')}\n\n`;

    list.forEach((e, idx) => {
      text += `${idx + 1}. ${e.date}: ${e.type === 'got' ? 'You gave us (Credit)' : 'We paid (Debit)'} - ₹${e.amount} (${e.description})${e.settled ? ' [Settled]' : ''}\n`;
    });

    text += `\n*Remaining Balance*: `;
    if (balance > 0) {
      text += `We have to pay you *₹${balance}*.\n`;
    } else if (balance < 0) {
      text += `You have to return *₹${Math.abs(balance)}*.\n`;
    } else {
      text += `All accounts are clear (₹0).\n`;
    }

    text += `\n_Recorded digitally on HomeMate AI Household OS_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Calculations
  const activeUnsettled = entries.filter((e) => !e.settled);
  const totalYouGave = activeUnsettled.filter((e) => e.type === 'gave').reduce((s, e) => s + e.amount, 0);
  const totalYouGot = activeUnsettled.filter((e) => e.type === 'got').reduce((s, e) => s + e.amount, 0);
  const netDueToPay = totalYouGot - totalYouGave; // positive = you owe money; negative = people owe you

  const filteredEntries = entries.filter((e) => {
    if (filter === 'unsettled') return !e.settled;
    if (filter === 'settled') return e.settled;
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Household Digital Khata (खाता / খাতা)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Hisab-Kitab Ledger
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Track running credits & advances with local Kirana, milkman, vegetable vendor, and maid
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Khata modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ledger Balance Summary Cards */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          {/* Maine Diye (You Gave / Advance) */}
          <div className="p-3.5 rounded-2xl bg-white border border-rose-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-rose-700 mb-1">
              <span>Maine Diye (Advance Given)</span>
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl font-black text-rose-700 flex items-center">
              <IndianRupee className="w-4 h-4 stroke-[2.5]" />
              <span>{totalYouGave.toLocaleString('en-IN')}</span>
            </div>
            <span className="text-[10px] text-slate-400">To be adjusted or returned</span>
          </div>

          {/* Maine Liye (You Got / Udhaar / Owed to Kirana) */}
          <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 mb-1">
              <span>Maine Liye (Credit / Due to Pay)</span>
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-700 flex items-center">
              <IndianRupee className="w-4 h-4 stroke-[2.5]" />
              <span>{totalYouGot.toLocaleString('en-IN')}</span>
            </div>
            <span className="text-[10px] text-slate-400">Pending Kirana/Vendor dues</span>
          </div>

          {/* Net Balance */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
              <span>Net Settlement Position</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black flex items-center text-amber-300">
              <IndianRupee className="w-4 h-4 stroke-[2.5]" />
              <span>{Math.abs(netDueToPay).toLocaleString('en-IN')}</span>
            </div>
            <span className="text-[10px] text-slate-300 font-semibold">
              {netDueToPay > 0
                ? 'You have to pay overall'
                : netDueToPay < 0
                ? 'You will receive overall'
                : 'All accounts balanced!'}
            </span>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filter & Action Toolbar */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 bg-white">
          <div className="flex items-center gap-1.5 text-xs">
            {(['all', 'unsettled', 'settled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl font-extrabold capitalize transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab} ({tab === 'all' ? entries.length : tab === 'unsettled' ? activeUnsettled.length : entries.length - activeUnsettled.length})
              </button>
            ))}
          </div>

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs cursor-pointer transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ New Khata Entry</span>
            </button>
          )}
        </div>

        {/* Scrollable Ledger Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 touch-scroll">
          
          {/* Add Entry Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddSubmit}
              className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-4 animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Record Transaction in Khata</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              {/* Transaction Type Choice: Gave or Got */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEntryType('got')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    entryType === 'got'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Maine Liye (Got Goods / Credit)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEntryType('gave')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    entryType === 'gave'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Maine Diye (Paid / Advance Given)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Party / Vendor Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="e.g. Kirana Kaka, Raju Dudhwala, Maid"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category / Role
                  </label>
                  <select
                    value={partyRole}
                    onChange={(e) => setPartyRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="kirana">Kirana Shop (किराना दुकान)</option>
                    <option value="milkman">Milkman / Dairy (दूधवाला)</option>
                    <option value="subziwala">Vegetable Vendor (सब्जीवाला)</option>
                    <option value="domestic_help">Maid / Cook (सहायक / मेड)</option>
                    <option value="technician">Electrician / Plumber (मरम्मत)</option>
                    <option value="flatmate">Flatmate / Neighbor (रूममेट)</option>
                    <option value="other">Other Contact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (Optional for WhatsApp Bill)
                  </label>
                  <input
                    type="tel"
                    value={partyPhone}
                    onChange={(e) => setPartyPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description / Items
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 5kg Atta, 2L Milk, Advance for festivals..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    UPI ID for 1-Click Settlement (Optional)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. kirana@okhdfcbank"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                >
                  Save to Khata
                </button>
              </div>
            </form>
          )}

          {/* Khata Entries List */}
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  entry.settled
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : entry.type === 'got'
                    ? 'bg-white border-emerald-200 hover:shadow-md'
                    : 'bg-white border-rose-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      entry.settled
                        ? 'bg-slate-200 text-slate-600'
                        : entry.type === 'got'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {entry.type === 'got' ? (
                      <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-rose-600" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 truncate">
                        {entry.partyName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-600 uppercase">
                        {entry.partyRole}
                      </span>
                      {entry.settled && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 font-bold text-slate-700">
                          Settled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {entry.description} • {entry.date}
                    </p>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div
                      className={`text-base font-black flex items-center justify-end ${
                        entry.settled
                          ? 'text-slate-500 line-through'
                          : entry.type === 'got'
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      <span>{entry.type === 'got' ? '+₹' : '-₹'}</span>
                      <span>{entry.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {entry.type === 'got' ? 'Due to Pay' : 'Advance Given'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {!entry.settled && (
                      <>
                        {entry.upiId && onPayViaUpi && (
                          <button
                            onClick={() => onPayViaUpi(entry.partyName, entry.amount, entry.upiId!)}
                            title="Pay via UPI"
                            className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleSettle(entry.id, entry.partyName)}
                          title="Mark settled"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
                        >
                          Settle
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleShareWhatsApp(entry.partyName, [entry])}
                      title="Share via WhatsApp"
                      className="p-1.5 rounded-xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      title="Delete entry"
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredEntries.length === 0 && !showAddForm && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No transactions in Khata</p>
                <p className="text-xs text-slate-500 mt-1">
                  Start from scratch by clicking "+ New Khata Entry" to track money given or owed to your local Kirana or milkman.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Digital Hisab-Kitab • 100% Private to Household</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
