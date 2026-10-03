import React, { useState, useEffect } from 'react';
import { AppMode, Language, BackendHealth, UserAccount, Household } from '../types';
import {
  Globe,
  Sparkles,
  Clock,
  LogOut,
  Copy,
  Check,
} from 'lucide-react';
import { checkBackendHealth } from '../utils/api';
import { translations } from '../utils/translations';

interface NavbarProps {
  currentMode: AppMode;
  currentUser: UserAccount | null;
  household: Household | null;
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenWidgetSuggestions: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  currentUser,
  household,
  onLogout,
  language,
  onLanguageChange,
  onOpenWidgetSuggestions,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const check = async () => {
      const health = await checkBackendHealth();
      setBackendHealth(health);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = () => {
    if (household?.accessCode) {
      navigator.clipboard.writeText(household.accessCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const isHostel = currentMode === 'hostel';
  const isElder = currentMode === 'elder';

  const headerBg = isHostel
    ? 'bg-slate-950/95 border-indigo-900/60 text-white'
    : isElder
    ? 'bg-amber-50/95 border-amber-200/80 text-slate-900'
    : 'bg-white/95 border-emerald-100/90 text-slate-900';

  const logoBg = isHostel
    ? 'from-indigo-500 to-purple-700'
    : isElder
    ? 'from-amber-500 to-orange-600'
    : 'from-emerald-500 to-teal-700';

  const aiOsBadge = isHostel
    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    : isElder
    ? 'bg-amber-100 text-amber-900 border-amber-300'
    : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  const displayName = currentUser?.displayName || (
    currentMode === 'elder' ? 'Nanaji' : currentMode === 'hostel' ? 'Rohan' : 'Sharma Family'
  );
  const householdName = household?.name || currentUser?.householdName || (
    currentMode === 'elder' ? 'Senior Living' : currentMode === 'hostel' ? 'Flat B-302' : 'The Sharmas'
  );

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl border-b shadow-sm transition-all duration-300 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-3">

        {/* LEFT — Brand & Household identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-base shadow-md bg-gradient-to-br text-white ${logoBg}`}>
            H
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className={`font-extrabold text-sm sm:text-base tracking-tight ${isHostel ? 'text-white' : 'text-slate-900'}`}>
                HomeMate
              </span>
              <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full border ${aiOsBadge}`}>
                AI OS
              </span>
            </div>
            <p className={`text-[10px] sm:text-xs leading-none truncate max-w-[130px] sm:max-w-xs ${isHostel ? 'text-slate-400' : 'text-slate-500'}`}>
              {householdName}
            </p>
          </div>
        </div>

        {/* RIGHT — Controls & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* User profile chip */}
          <div className={`hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs ${
            isHostel
              ? 'bg-slate-800/70 border-indigo-800/60 text-slate-200'
              : isElder
              ? 'bg-amber-100/70 border-amber-300/70 text-slate-800'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <span className="text-base leading-none">
              {currentMode === 'elder' ? '🧓' : currentMode === 'hostel' ? '🎓' : '👨‍👩‍👦'}
            </span>
            <div className="leading-tight">
              <div className="font-extrabold text-xs">{displayName}</div>
              <div className={`text-[10px] font-normal ${isHostel ? 'text-slate-400' : 'text-slate-500'}`}>
                {householdName}
              </div>
            </div>
            {household?.accessCode && currentMode !== 'elder' && (
              <button
                onClick={handleCopyCode}
                title="Copy access code"
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border font-mono text-[10px] font-bold cursor-pointer transition-colors ${
                  isHostel
                    ? 'bg-slate-700 border-indigo-700 text-indigo-300 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-700'
                }`}
              >
                {copiedCode
                  ? <><Check className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied!</span></>
                  : <><Copy className="w-3 h-3" /><span>{household.accessCode}</span></>
                }
              </button>
            )}
          </div>

          {/* Live Clock — lg+ */}
          <div className={`hidden lg:flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-xl border ${
            isHostel ? 'bg-white/8 border-white/12 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            <Clock className="w-3 h-3 opacity-70" />
            <span>{timeStr || '--:--'}</span>
          </div>

          {/* Backend Status indicator — lg+ */}
          <div
            title={backendHealth ? 'Backend live :4000' : 'Connecting…'}
            className={`hidden lg:flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded-xl border ${
              backendHealth ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${backendHealth ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span>{backendHealth ? 'Live' : 'Ready'}</span>
          </div>

          {/* Widget suggestions modal button — sm+ */}
          <button
            onClick={onOpenWidgetSuggestions}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isHostel
                ? 'bg-indigo-900/50 hover:bg-indigo-800/60 border-indigo-700/50 text-indigo-300'
                : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.widgets}</span>
          </button>

          {/* Language selector */}
          <div className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-bold ${
            isHostel ? 'bg-white/8 border-white/12 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Globe className="w-3.5 h-3.5 opacity-70" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent border-none text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="bn">BN</option>
            </select>
          </div>

          {/* Switch Account / Logout button */}
          <button
            onClick={onLogout}
            title="Switch account / Logout"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isHostel
                ? 'bg-slate-800 hover:bg-slate-700 border-indigo-800/60 text-slate-300'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.switchAccount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
