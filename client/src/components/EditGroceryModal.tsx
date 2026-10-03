import React, { useState, useEffect } from 'react';
import { ShoppingItem, Language } from '../types';
import { ShoppingCart, Edit3, X, Check, Plus, Minus } from 'lucide-react';
import { translations } from '../utils/translations';

interface EditGroceryModalProps {
  item: ShoppingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updated: { title: string; quantity: string; category?: string }) => void;
  language: Language;
}

export const EditGroceryModal: React.FC<EditGroceryModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  language,
}) => {
  const t = translations[language];

  const [title, setTitle] = useState('');
  const [qtyNumber, setQtyNumber] = useState('1');
  const [unit, setUnit] = useState('unit');
  const [category, setCategory] = useState('other');

  const unitOptions = [
    { value: 'kg', label: 'kg (Kilogram)' },
    { value: 'g', label: 'g (Gram)' },
    { value: 'packet', label: 'packet / pouch' },
    { value: 'litre', label: 'litre / L' },
    { value: 'pieces', label: 'pieces / pcs' },
    { value: 'box', label: 'box' },
    { value: 'bottle', label: 'bottle' },
    { value: 'dozen', label: 'dozen' },
    { value: 'bunch', label: 'bunch' },
    { value: 'loaf', label: 'loaf' },
    { value: 'unit', label: 'unit' },
  ];

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setCategory(item.category || 'other');

      // Parse quantity string e.g. "1 packet", "500g", "2 kg"
      const rawQty = (item.quantity || '1 unit').trim();
      const match = rawQty.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);

      if (match) {
        setQtyNumber(match[1]);
        const matchedUnit = match[2].trim().toLowerCase();
        setUnit(matchedUnit || 'unit');
      } else {
        setQtyNumber('1');
        setUnit(rawQty || 'unit');
      }
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleIncrement = () => {
    const current = parseFloat(qtyNumber) || 1;
    setQtyNumber(String(current + 1));
  };

  const handleDecrement = () => {
    const current = parseFloat(qtyNumber) || 1;
    if (current > 1) {
      setQtyNumber(String(current - 1));
    } else if (current > 0.5) {
      setQtyNumber(String(current - 0.5));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const fullQuantity = `${qtyNumber.trim()} ${unit.trim()}`.trim();
    onSave(item.id, {
      title: title.trim(),
      quantity: fullQuantity,
      category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Edit3 className="w-4 h-4" />
            </span>
            <h3 className="font-black text-slate-900 text-base">
              {t.editItemTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900"
              required
            />
          </div>

          {/* Quantity & Unit Stepper */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {t.itemQuantity} *
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-bold cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={qtyNumber}
                  onChange={(e) => setQtyNumber(e.target.value)}
                  className="w-full text-center py-2 focus:outline-none font-mono font-bold text-slate-900 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {t.itemUnit}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800 bg-white"
              >
                {unitOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800 bg-white"
            >
              <option value="dairy">{t.dairyCategory}</option>
              <option value="vegetables">{t.veggiesCategory}</option>
              <option value="staples">{t.staplesCategory}</option>
              <option value="snacks">{t.snacksCategory}</option>
              <option value="other">Other / General</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md cursor-pointer"
            >
              {t.saveBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
