import React, { useState, useEffect } from 'react';
import { ShoppingItem, UserAccount, Language } from '../types';
import {
  IndianRupee,
  Users,
  CheckCircle,
  QrCode,
  Sparkles,
  X,
  CreditCard,
  Check,
} from 'lucide-react';
import { translations } from '../utils/translations';

interface SplitSnackModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingItem | null;
  currentUser: UserAccount | null;
  roommates: string[];
  onConfirmSplit: (
    title: string,
    amount: number,
    paidBy: string,
    upiId: string,
    markBought: boolean
  ) => void;
  onOpenUpiQr: (
    title: string,
    amount: number,
    paidBy: string,
    upiId: string
  ) => void;
  language: Language;
}

export const SplitSnackModal: React.FC<SplitSnackModalProps> = ({
  isOpen,
  onClose,
  item,
  currentUser,
  roommates,
  onConfirmSplit,
  onOpenUpiQr,
  language,
}) => {
  const [billAmount, setBillAmount] = useState<number>(120);
  const [paidBy, setPaidBy] = useState<string>('Rohan');
  const [markBought, setMarkBought] = useState<boolean>(true);

  const t = translations[language];

  // Helper to determine reasonable default amount based on item name or quantity
  useEffect(() => {
    if (item) {
      const lower = item.title.toLowerCase();
      let defaultAmt = 120;
      if (lower.includes('maggi')) defaultAmt = 56;
      else if (lower.includes('egg')) defaultAmt = 48;
      else if (lower.includes('butter')) defaultAmt = 58;
      else if (lower.includes('bread')) defaultAmt = 45;
      else if (lower.includes('apple')) defaultAmt = 90;
      else if (lower.includes('milk')) defaultAmt = 34;
      else if (lower.includes('water') || lower.includes('bisleri')) defaultAmt = 80;
      else if (lower.includes('chips') || lower.includes('lays')) defaultAmt = 40;
      else if (lower.includes('cookie') || lower.includes('biscuit')) defaultAmt = 35;
      
      setBillAmount(defaultAmt);

      const defaultPayer = currentUser?.displayName?.includes('Vikram')
        ? 'Vikram'
        : currentUser?.displayName?.includes('Ankit')
        ? 'Ankit'
        : 'Rohan';
      setPaidBy(defaultPayer);
      setMarkBought(true);
    }
  }, [item, currentUser]);

  if (!isOpen || !item) return null;

  const upiIdMap: Record<string, string> = {
    Rohan: 'rohan@okhdfcbank',
    Vikram: 'vikram@paytm',
    Ankit: 'ankit@upi',
  };

  const selectedUpi = upiIdMap[paidBy] || 'rohan@okhdfcbank';
  const validAmount = Math.max(1, billAmount || 0);
  const sharePerPerson = Math.round(validAmount / Math.max(1, roommates.length));

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSplit(item.title, validAmount, paidBy, selectedUpi, markBought);
  };

  const handleOpenUpiDirect = () => {
    onOpenUpiQr(item.title, validAmount, paidBy, selectedUpi);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-indigo-200 p-6 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
              <Users className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                <span>{language === 'hi' ? 'फ्लैट में खर्च बांटें' : language === 'bn' ? 'ফ্ল্যাটে খরচ ভাগ করুন' : 'Split in Flat (Splitwise)'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                  B-302
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? '3 रूममेट्स में बराबर हिस्सा' : language === 'bn' ? '৩ জন রুমমেটের মধ্যে সমান ভাগ' : 'Equal 3-way split among roommates'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Item Badge */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/70 border border-indigo-200 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
              {language === 'hi' ? 'किराना / स्नैक आइटम' : language === 'bn' ? 'মুদি সামগ্রী' : 'Grocery / Snack Item'}
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{item.title}</h4>
            <span className="text-xs text-slate-500 font-semibold">{item.quantity || '1 unit'}</span>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-bold shadow-2xs">
            {item.category || 'snacks'}
          </span>
        </div>

        <form onSubmit={handleConfirmSubmit} className="space-y-4 text-xs">
          {/* Bill Amount Input */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              {language === 'hi' ? 'कुल बिल / खरीद राशि (₹) *' : language === 'bn' ? 'মোট বিলের পরিমাণ (₹) *' : 'Total Bill / Purchase Amount (₹) *'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                ₹
              </div>
              <input
                type="number"
                min="1"
                step="1"
                value={billAmount}
                onChange={(e) => setBillAmount(Number(e.target.value))}
                placeholder="120"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-indigo-200 focus:outline-none focus:border-indigo-600 font-mono text-base font-bold text-slate-900 bg-white"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {language === 'hi' ? 'दुकान या Zepto/Blinkit की रसीद के अनुसार राशि लिखें' : language === 'bn' ? 'দোকানের বা ডেলিভারির রসিদ অনুযায়ী লিখুন' : 'Enter actual receipt or estimated quick commerce amount'}
            </p>
          </div>

          {/* Paid By Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              {language === 'hi' ? 'भुगतान किसने किया?' : language === 'bn' ? 'টাকা কে দিয়েছে?' : 'Who Paid for This?'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roommates.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setPaidBy(name)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                    paidBy === name
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{name}</span>
                  <span className={`text-[10px] font-normal ${paidBy === name ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {name === 'Rohan' ? 'Admin' : name === 'Vikram' ? 'B2' : 'B3'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Splitwise Equal Share Division Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white border border-indigo-800 shadow-inner space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-indigo-300 uppercase tracking-wider font-bold">
                {language === 'hi' ? '3 रूममेट्स में बराबर विभाजन' : language === 'bn' ? 'সমান ভাগ' : 'Equal Flatmate Division'}
              </span>
              <span className="text-xs font-black text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                ₹{sharePerPerson} / person
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-indigo-800/80 text-[11px]">
              {roommates.map((name) => (
                <div key={name} className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-slate-300 block font-semibold">{name}</span>
                  <span className={`font-mono font-bold mt-0.5 block ${paidBy === name ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {paidBy === name ? `Paid ₹${validAmount}` : `Owes ₹${sharePerPerson}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mark as Bought & Split checkbox */}
          <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={markBought}
              onChange={(e) => setMarkBought(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span className="text-xs font-bold text-slate-700">
              {language === 'hi' ? 'किराना सूची में "खरीदा व बांटा गया" मार्क करें' : language === 'bn' ? 'মুদি তালিকায় সম্পন্ন হিসেবে চিহ্নিত করুন' : 'Mark item as "Bought & Split" in grocery list'}
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              type="submit"
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{language === 'hi' ? 'स्प्लिटवाइज में जोड़ें' : language === 'bn' ? 'স্প্লিটওয়াইজে যুক্ত করুন' : 'Add to Flat Splitwise'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenUpiDirect}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              title="Open instant UPI QR code for roommates to scan"
            >
              <QrCode className="w-4 h-4" />
              <span>{language === 'hi' ? 'UPI QR खोलें' : language === 'bn' ? 'UPI QR খুলুন' : 'Open UPI QR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
