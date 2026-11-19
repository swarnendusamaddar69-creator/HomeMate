import React from 'react';
import {
  Home,
  HelpCircle,
  Phone,
  Mail,
  Compass,
  AlertTriangle,
  RefreshCw,
  Heart,
  GraduationCap,
  Users,
} from 'lucide-react';
import { AppMode } from '../types';

interface NotFoundPageProps {
  type?: '404' | 'server_error';
  errorMessage?: string;
  onReturnHome: () => void;
  onRetry?: () => void;
  onSelectMode?: (mode: AppMode) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  type = '404',
  errorMessage,
  onReturnHome,
  onRetry,
  onSelectMode,
}) => {
  const isServerError = type === 'server_error';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 text-center space-y-6 animate-fadeIn">
        
        {/* Visual Badge */}
        <div
          className={`relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-white shadow-xl ${
            isServerError
              ? 'bg-gradient-to-tr from-rose-600 via-red-500 to-amber-600 shadow-rose-500/25'
              : 'bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 shadow-rose-500/20'
          }`}
        >
          {isServerError ? (
            <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 text-white animate-pulse" />
          ) : (
            <Compass className="w-12 h-12 sm:w-14 sm:h-14 animate-spin-slow text-white" />
          )}
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono font-black text-xs border border-white/20">
            {isServerError ? '500' : '404'}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isServerError ? 'Household Server Error' : 'Room Not Found'}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {isServerError
              ? errorMessage || 'The household server encountered an unexpected issue while communicating with your local instance. Your locally stored household data remains safe.'
              : 'It looks like this room or page wandered outside the house! The link or route you followed does not exist.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Server Connection</span>
            </button>
          )}

          <button
            onClick={onReturnHome}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Household Dashboard</span>
          </button>
        </div>

        {/* Switch Household Wings */}
        {onSelectMode && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
              Or jump directly to a household interface:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onSelectMode('family');
                  onReturnHome();
                }}
                className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-center cursor-pointer group"
              >
                <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-extrabold text-slate-800 block">Family OS</span>
              </button>

              <button
                onClick={() => {
                  onSelectMode('elder');
                  onReturnHome();
                }}
                className="p-3 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-center cursor-pointer group"
              >
                <Heart className="w-5 h-5 text-amber-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-extrabold text-slate-800 block">Elder Care</span>
              </button>

              <button
                onClick={() => {
                  onSelectMode('hostel');
                  onReturnHome();
                }}
                className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-center cursor-pointer group"
              >
                <GraduationCap className="w-5 h-5 text-indigo-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-extrabold text-slate-800 block">Hostel Flat</span>
              </button>
            </div>
          </div>
        )}

        {/* Support Helpdesk with Clickable Phone & Email */}
        <div className="pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 space-y-2">
          <div className="font-bold text-slate-800 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Need assistance from HomeMate support?</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <a
              href="mailto:swarnendusamaddar69@gmail.com"
              className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>swarnendusamaddar69@gmail.com</span>
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="tel:+917439542543"
              className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+91 74395 42543</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
