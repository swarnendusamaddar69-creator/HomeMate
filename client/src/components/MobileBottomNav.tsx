import React from 'react';
import { AppMode, Language } from '../types';
import { Camera, Heart, GraduationCap, Users, Globe } from 'lucide-react';

interface MobileBottomNavProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenScan: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentMode,
  onSelectMode,
  onOpenScan,
  language,
  onToggleLanguage,
}) => {
  const isHostel = currentMode === 'hostel';

  return (
    <div className="sm:hidden fixed bottom-3 inset-x-3 z-40 pointer-events-auto animate-slideUp">
      <nav
        aria-label="Mobile Navigation Dock"
        className={`flex items-center justify-between p-1.5 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all ${
          isHostel
            ? 'bg-slate-900/90 border-indigo-500/30 text-white'
            : currentMode === 'elder'
            ? 'bg-amber-50/95 border-amber-300/80 text-amber-950'
            : 'bg-white/95 border-emerald-200/80 text-slate-800'
        }`}
      >
        {/* Elder Mode Tab */}
        <button
          onClick={() => onSelectMode('elder')}
          className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            currentMode === 'elder'
              ? 'bg-amber-400 text-amber-950 font-black shadow-xs scale-102 ring-2 ring-amber-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Switch to Elder Sanctuary Mode"
        >
          <span className="text-base leading-none">🧓</span>
          <span className="text-[10px] font-bold tracking-tight">Elder</span>
        </button>

        {/* Hostel Mode Tab */}
        <button
          onClick={() => onSelectMode('hostel')}
          className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            currentMode === 'hostel'
              ? 'bg-indigo-600 text-white font-black shadow-xs scale-102 ring-2 ring-indigo-400'
              : isHostel ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Switch to Hostel & Flatmates Mode"
        >
          <span className="text-base leading-none">🎓</span>
          <span className="text-[10px] font-bold tracking-tight">Hostel</span>
        </button>

        {/* Center: AI Camera Scan Action Pill */}
        <button
          onClick={onOpenScan}
          className="mx-1 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold flex flex-col items-center gap-0.5 shadow-lg active:scale-95 transition-transform cursor-pointer ring-2 ring-emerald-300/60"
          title="Scan Fridge or Pantry with AI Camera"
        >
          <Camera className="w-4 h-4 text-white" />
          <span className="text-[9px] uppercase tracking-wider font-black">Scan</span>
        </button>

        {/* Family Mode Tab */}
        <button
          onClick={() => onSelectMode('family')}
          className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            currentMode === 'family'
              ? 'bg-emerald-600 text-white font-black shadow-xs scale-102 ring-2 ring-emerald-400'
              : isHostel ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Switch to Family Household Mode"
        >
          <span className="text-base leading-none">👨‍👩‍👦</span>
          <span className="text-[10px] font-bold tracking-tight">Family</span>
        </button>

        {/* Quick Language Toggle (EN / HI / BN) */}
        <button
          onClick={onToggleLanguage}
          className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
            isHostel
              ? 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title="Toggle Language (EN / HI / BN)"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="text-[9px] uppercase font-mono font-black">{language}</span>
        </button>
      </nav>
    </div>
  );
};
