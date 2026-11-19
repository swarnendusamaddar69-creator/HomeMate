import React from 'react';
import {
  Heart,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Database,
  HelpCircle,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { AppMode } from '../types';

interface FooterProps {
  currentMode: AppMode;
  onOpenDatabase: () => void;
  onOpenEmptyState: () => void;
  onOpen404: () => void;
  onOpenWidgets: () => void;
  onSelectMode: (mode: AppMode) => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentMode,
  onOpenDatabase,
  onOpenEmptyState,
  onOpen404,
  onOpenWidgets,
  onSelectMode,
}) => {
  const isHostel = currentMode === 'hostel';
  const isElder = currentMode === 'elder';

  const footerBg = isHostel
    ? 'bg-slate-950/90 border-t border-indigo-900/40 text-slate-400'
    : isElder
    ? 'bg-amber-50/80 border-t border-amber-200/60 text-slate-600'
    : 'bg-white/90 border-t border-slate-200/80 text-slate-600';

  return (
    <footer className={`relative z-10 mt-16 pt-12 pb-24 sm:pb-16 transition-colors ${footerBg}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Purpose Description */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm ${
                  isHostel
                    ? 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                    : isElder
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-600'
                }`}
              >
                H
              </div>
              <span className={`font-black text-base tracking-tight ${isHostel ? 'text-white' : 'text-slate-900'}`}>
                HomeMate AI OS
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                v1.0 Production
              </span>
            </div>

            <p className="text-xs leading-relaxed max-w-md">
              HomeMate is an intelligent household operating system designed specifically for Indian families, senior citizens, and shared hostel apartments. Powered by multimodal Gemini AI, zero-fee UPI settlement rails, and resilient local database architecture.
            </p>

            {/* Emergency & Support Card with Clickable Phone & Email */}
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-2 max-w-md ${
                isHostel
                  ? 'bg-slate-900/80 border-indigo-800/60 text-slate-300'
                  : 'bg-emerald-50/70 border-emerald-200/80 text-slate-800'
              }`}
            >
              <div className="font-extrabold flex items-center gap-1.5 text-emerald-700">
                <Phone className="w-3.5 h-3.5" />
                <span>24/7 Household Support & Emergency Concierge</span>
              </div>
              <p className="text-[11px] leading-snug">
                For prompt care assistance, Kirana grocery delivery queries, or technical support, call our helpline or email our team:
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 text-[11px]">Helpline:</span>
                  <a
                    href="tel:+917439542543"
                    className="text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
                  >
                    <span>+91 74395 42543</span>
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 text-[11px]">Support Email:</span>
                  <a
                    href="mailto:swarnendusamaddar69@gmail.com"
                    className="text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    <span>swarnendusamaddar69@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation & Views */}
          <div className="space-y-3">
            <h4 className={`text-xs font-black uppercase tracking-wider ${isHostel ? 'text-white' : 'text-slate-900'}`}>
              Household Views
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectMode('family')}
                  className="hover:text-emerald-600 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span>👨‍👩‍👦 Family Household OS</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectMode('elder')}
                  className="hover:text-amber-600 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🧓 Elder Care & Routine</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectMode('hostel')}
                  className="hover:text-indigo-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🎓 Hostel & Splitwise</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenEmptyState}
                  className="hover:text-emerald-600 transition-colors text-left flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  <span>📦 Empty State / Starter Page</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpen404}
                  className="hover:text-rose-500 transition-colors text-left flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  <span>🧭 404 Error Page Preview</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Data & Controls */}
          <div className="space-y-3">
            <h4 className={`text-xs font-black uppercase tracking-wider ${isHostel ? 'text-white' : 'text-slate-900'}`}>
              Database & Architecture
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenDatabase}
                  className="text-emerald-700 hover:text-emerald-800 font-bold transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Family & Account Database</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenWidgets}
                  className="hover:text-emerald-600 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Widget Library & Specs</span>
                </button>
              </li>
              <li>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Google AI Studio Key</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://open-meteo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Open-Meteo Weather API</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© 2026 HomeMate Technologies. Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for resilient modern homes.</span>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <a
              href="mailto:swarnendusamaddar69@gmail.com"
              className="hover:text-emerald-600 hover:underline transition-colors"
            >
              swarnendusamaddar69@gmail.com
            </a>
            <span>•</span>
            <a
              href="tel:+917439542543"
              className="hover:text-emerald-600 hover:underline transition-colors font-medium"
            >
              +91 74395 42543
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
