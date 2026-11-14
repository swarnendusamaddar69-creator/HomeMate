import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  onUndo?: () => void;
  duration?: number;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-3 animate-fadeIn transform transition-all ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-emerald-500/50 shadow-emerald-950/20'
              : toast.type === 'error'
              ? 'bg-rose-950 text-white border-rose-500/70 shadow-rose-950/30'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toast.type === 'success' ? (
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : toast.type === 'error' ? (
            <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                {toast.title}
              </h4>
            )}
            <p className="text-xs font-semibold leading-snug mt-0.5 break-words">
              {toast.message}
            </p>
          </div>

          {toast.onUndo && (
            <button
              onClick={() => {
                toast.onUndo!();
                onDismiss(toast.id);
              }}
              className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
            >
              <Undo2 className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}

          <button
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss message"
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
