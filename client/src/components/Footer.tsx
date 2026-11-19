import React from 'react';
import { Heart, Phone, Mail, ShieldCheck } from 'lucide-react';
import { AppMode } from '../types';

interface FooterProps {
  currentMode: AppMode;
}

export const Footer: React.FC<FooterProps> = ({ currentMode }) => {
  const isHostel = currentMode === 'hostel';
  const isElder = currentMode === 'elder';

  const footerBg = isHostel
    ? 'bg-slate-950/90 border-t border-indigo-900/40 text-slate-400'
    : isElder
    ? 'bg-amber-50/80 border-t border-amber-200/60 text-slate-600'
    : 'bg-white/90 border-t border-slate-200/80 text-slate-600';

  return (
    <footer className={`relative z-10 mt-16 pt-10 pb-24 sm:pb-12 transition-colors ${footerBg}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Main Content: Brand & Support in Balanced Layout */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Brand & Mission */}
          <div className="space-y-2.5 max-w-lg">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm ${
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

            <p className="text-xs leading-relaxed opacity-90">
              An intelligent household operating system engineered for Indian homes. Built with zero-leak household isolation, offline-resilient storage, and automated routine workflows.
            </p>
          </div>

          {/* 24/7 Helpline & Support Concierge Card */}
          <div
            className={`w-full md:w-auto p-4 rounded-2xl border text-xs space-y-2.5 shrink-0 ${
              isHostel
                ? 'bg-slate-900/80 border-indigo-800/60 text-slate-300'
                : 'bg-emerald-50/70 border-emerald-200/80 text-slate-800'
            }`}
          >
            <div className="font-extrabold flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>24/7 Household Concierge & Helpline</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 pt-0.5 font-bold">
              <a
                href="tel:+917439542543"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-emerald-300/80 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>+91 74395 42543</span>
              </a>

              <a
                href="mailto:swarnendusamaddar69@gmail.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-emerald-300/80 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>swarnendusamaddar69@gmail.com</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-75">
          <div className="flex items-center gap-1.5">
            <span>© 2026 HomeMate Technologies. Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for modern households.</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span>Encrypted & Private</span>
            <span>•</span>
            <span>Zero Cross-Household Data Leak</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
