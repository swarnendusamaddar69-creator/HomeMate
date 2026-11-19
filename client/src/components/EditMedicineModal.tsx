import React, { useState } from 'react';
import {
  X,
  Pill,
  Clock,
  Calendar,
  AlertCircle,
  Check,
  Trash2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Medicine, Language } from '../types';

interface EditMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null; // null if adding a new medicine
  onSave: (med: Omit<Medicine, 'id'> | Medicine) => void;
  onDelete?: (id: string) => void;
  language: Language;
}

const COMMON_TIMINGS = ['07:30 AM', '08:30 AM', '01:30 PM', '05:30 PM', '08:30 PM', '10:00 PM'];

const PILL_COLOR_OPTIONS = [
  { label: 'Sky Blue', value: 'bg-sky-100 text-sky-800 border-sky-300' },
  { label: 'Emerald Green', value: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { label: 'Purple', value: 'bg-purple-100 text-purple-800 border-purple-300' },
  { label: 'Amber Gold', value: 'bg-amber-100 text-amber-900 border-amber-300' },
  { label: 'Rose Pink', value: 'bg-rose-100 text-rose-800 border-rose-300' },
  { label: 'Indigo', value: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
];

export const EditMedicineModal: React.FC<EditMedicineModalProps> = ({
  isOpen,
  onClose,
  medicine,
  onSave,
  onDelete,
  language,
}) => {
  const [name, setName] = useState(medicine?.name || '');
  const [dosage, setDosage] = useState(medicine?.dosage || '1 Tablet (5mg)');
  const [instructions, setInstructions] = useState(
    medicine?.instructions || 'Take with water after breakfast'
  );
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(
    medicine?.scheduleTimes && medicine.scheduleTimes.length > 0
      ? medicine.scheduleTimes
      : ['08:30 AM']
  );
  const [customTime, setCustomTime] = useState('');
  const [packSize, setPackSize] = useState<number>(medicine?.packSize || 10);
  const [currentStock, setCurrentStock] = useState<number>(
    medicine?.currentStock !== undefined ? medicine.currentStock : 10
  );
  const [dailyDosageCount, setDailyDosageCount] = useState<number>(
    medicine?.dailyDosageCount || (medicine?.scheduleTimes?.length || 1)
  );
  const [refillThreshold, setRefillThreshold] = useState<number>(
    medicine?.refillThreshold !== undefined ? medicine.refillThreshold : 3
  );
  const [pillColor, setPillColor] = useState(
    medicine?.pillColor || PILL_COLOR_OPTIONS[0].value
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(
    medicine?.isAvailable !== undefined ? medicine.isAvailable : true
  );
  const [substituteNote, setSubstituteNote] = useState(
    medicine?.substituteNote || ''
  );
  const [prescribedBy, setPrescribedBy] = useState(
    medicine?.prescribedBy || ''
  );

  if (!isOpen) return null;

  const handleToggleTiming = (time: string) => {
    if (scheduleTimes.includes(time)) {
      if (scheduleTimes.length > 1) {
        setScheduleTimes(scheduleTimes.filter((t) => t !== time));
      }
    } else {
      setScheduleTimes([...scheduleTimes, time]);
    }
  };

  const handleAddCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTime.trim()) return;
    if (!scheduleTimes.includes(customTime.trim())) {
      setScheduleTimes([...scheduleTimes, customTime.trim()]);
    }
    setCustomTime('');
  };

  // Run-out date calculation
  const daysRemaining = Math.max(
    1,
    Math.floor((currentStock || 1) / Math.max(1, dailyDosageCount))
  );
  const runOutDate = new Date(Date.now() + daysRemaining * 86400000);
  const formattedRunOut = runOutDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      dosage: dosage.trim() || '1 Tab',
      instructions: instructions.trim() || 'Take as advised by doctor',
      scheduleTimes: scheduleTimes.length > 0 ? scheduleTimes : ['08:30 AM'],
      pillColor,
      currentStock: Math.max(0, currentStock),
      refillThreshold: Math.max(1, refillThreshold),
      todayStatus: medicine?.todayStatus || ('pending' as const),
      packSize: Math.max(1, packSize),
      dailyDosageCount: Math.max(1, dailyDosageCount),
      prescribedBy: prescribedBy.trim() || undefined,
      isAvailable,
      substituteNote: substituteNote.trim() || undefined,
      estimatedRunOutDate: formattedRunOut,
      startDate: medicine?.startDate || new Date().toISOString(),
      ...(medicine ? { id: medicine.id } : {}),
    };

    onSave(payload as any);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-med-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 to-indigo-800 text-white p-5 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 min-h-[48px] min-w-[48px] rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md text-sky-200">
              <Pill className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
              {medicine ? 'Edit Medicine Schedule' : 'Add Daily Medicine'}
            </span>
          </div>

          <h2 id="edit-med-title" className="text-xl sm:text-2xl font-black tracking-tight">
            {medicine ? `Edit ${medicine.name}` : 'Add Daily Scheduled Medicine'}
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 mt-1">
            Configure dosage, daily timing, pack size, and run-out timeline.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1 text-slate-800">
          {/* Medicine Name & Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="med-name" className="font-bold text-slate-700 block mb-1">
                Medicine Name *
              </label>
              <input
                id="med-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amlodipine 5mg"
                className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="med-dosage" className="font-bold text-slate-700 block mb-1">
                Dosage (Strength)
              </label>
              <input
                id="med-dosage"
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 Tablet (5mg)"
                className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label htmlFor="med-instructions" className="font-bold text-slate-700 block mb-1">
              Doctor Instructions & Food Timing
            </label>
            <input
              id="med-instructions"
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Take with water after breakfast"
              className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Schedule Timings */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">
              Daily Schedule Times (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TIMINGS.map((time) => {
                const isSelected = scheduleTimes.includes(time);
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleToggleTiming(time)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{time}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Custom time (e.g. 03:00 PM)"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="flex-1 min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomTime}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Add Time
              </button>
            </div>
          </div>

          {/* Pack Intelligence & Run-Out Tracker */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Medicine Pack Intelligence & Timeline</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-200 text-sky-900">
                Auto-Calculation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Full Pack Size (Tabs)
                </label>
                <select
                  value={packSize}
                  onChange={(e) => setPackSize(parseInt(e.target.value) || 10)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900"
                >
                  <option value="10">10 Tab Strip</option>
                  <option value="14">14 Tab Strip</option>
                  <option value="15">15 Tab Strip</option>
                  <option value="20">20 Tab Pack</option>
                  <option value="30">30 Capsule Bottle</option>
                  <option value="60">60 Capsule Bottle</option>
                  <option value="100">100 Tab Jar</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Current Stock Left
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 text-center"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Daily Dosage (Tabs/day)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={dailyDosageCount}
                  onChange={(e) => setDailyDosageCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 text-center"
                />
              </div>
            </div>

            {/* Run-Out Result Display */}
            <div className="p-3 rounded-xl bg-white border border-sky-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Pack Timeline Status</span>
                <span className="font-black text-slate-900">
                  {daysRemaining} days of medicine remaining ({currentStock} tablets left)
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Estimated Run-out</span>
                <span className="font-black text-emerald-700">{formattedRunOut}</span>
              </div>
            </div>
          </div>

          {/* Availability at Chemist & Substitute */}
          <div className="space-y-2 p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Local Chemist Availability</span>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`min-h-[40px] px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  isAvailable
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300 font-black'
                }`}
              >
                {isAvailable ? '✓ In Stock / Available' : '⚠ Out of Stock / Need Substitute'}
              </button>
            </div>

            {!isAvailable && (
              <div className="pt-2 space-y-1 animate-fadeIn">
                <label className="text-[11px] font-bold text-rose-900 block">
                  Substitute Medicine / Generic Note
                </label>
                <input
                  type="text"
                  value={substituteNote}
                  onChange={(e) => setSubstituteNote(e.target.value)}
                  placeholder="e.g. Generic Amlodipine 5mg approved by Dr. Mehta"
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-rose-300 bg-white text-xs font-medium text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Prescribing Doctor */}
          <div>
            <label htmlFor="med-prescribed" className="font-bold text-slate-700 block mb-1">
              Prescribing Doctor / Hospital (Optional)
            </label>
            <input
              id="med-prescribed"
              type="text"
              value={prescribedBy}
              onChange={(e) => setPrescribedBy(e.target.value)}
              placeholder="e.g. Dr. Arvind Mehta (Fortis Escorts)"
              className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          {/* Pill Color Theme */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Pill Card Color Theme
            </label>
            <div className="flex flex-wrap gap-2">
              {PILL_COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setPillColor(opt.value)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    opt.value
                  } ${pillColor === opt.value ? 'ring-2 ring-slate-900 shadow-xs' : 'opacity-80'}`}
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {medicine && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove ${medicine.name} from daily schedule?`)) {
                    onDelete(medicine.id);
                    onClose();
                  }
                }}
                className="min-h-[48px] px-4 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Med</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] px-5 py-2.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Medicine</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
