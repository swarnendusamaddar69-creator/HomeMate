import React from 'react';
import { X, ShieldCheck, Lock, Eye, Trash2, Cpu, Database, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPurge?: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onOpenPurge,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="text-lg sm:text-xl font-black tracking-tight">
                Privacy & Data Security Policy
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                HomeMate Household OS • Transparency & AI Safety
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close privacy modal"
            className="w-10 h-10 rounded-xl hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-slate-700 leading-relaxed">
          {/* Quick Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-bold text-emerald-900">Your Home, Your Data: </strong>
              HomeMate operates on a local-first philosophy. We do not track, profile, monetize, or sell your family or flatmate data. All AI vision and chat interactions are proxied securely without raw keys or disk logs.
            </div>
          </div>

          {/* Section 1: Storage */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
              <Database className="w-4 h-4 text-emerald-600" />
              <h3>1. What Data is Stored & Where</h3>
            </div>
            <div className="pl-6 space-y-1.5 text-xs text-slate-600">
              <p>
                • <strong>Pantry & Shopping Lists:</strong> Stored strictly in browser <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px]">localStorage</code> and segregated by your unique Household ID.
              </p>
              <p>
                • <strong>Prescriptions & Medicines:</strong> Stored locally for pill schedules and stock alerts. Never transmitted to third-party pharmacies without your explicit Kirana or WhatsApp handoff action.
              </p>
              <p>
                • <strong>Expenses, Chores & Khata:</strong> Maintained in your local device storage and optional self-hosted household SQLite database.
              </p>
            </div>
          </div>

          {/* Section 2: Gemini AI */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <h3>2. What is Sent to Google Gemini AI</h3>
            </div>
            <div className="pl-6 space-y-1.5 text-xs text-slate-600">
              <p>
                • <strong>Fridge & Prescription Scans:</strong> Photos are sent strictly over HTTPS via a secure backend proxy endpoint (<code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px]">/api/vision</code>) directly to Gemini 3 Flash. Raw API credentials never reach the browser.
              </p>
              <p>
                • <strong>Ephemeral In-Memory Processing:</strong> Uploaded images are buffered in memory solely for the duration of inference (typically &lt; 3 seconds) and are <em>never</em> written to disk or retained.
              </p>
              <p>
                • <strong>Schema Validation & Plain Text:</strong> Gemini outputs are strictly validated against typed Zod schemas. AI text is sanitized and rendered strictly as plain text, eliminating script execution and prompt injection vulnerabilities.
              </p>
              <p>
                • <strong>No Foundation Model Training:</strong> Under API enterprise terms, Google does not use customer API inputs to train Gemini models.
              </p>
            </div>
          </div>

          {/* Section 3: Telemetry & Trackers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
              <Eye className="w-4 h-4 text-amber-600" />
              <h3>3. Zero Third-Party Analytics & Advertising</h3>
            </div>
            <div className="pl-6 space-y-1.5 text-xs text-slate-600">
              <p>
                • HomeMate contains <strong>0 advertising trackers</strong>, 0 user tracking pixels (no Google Analytics, Facebook Pixel, or Mixpanel), and 0 third-party telemetry beacons.
              </p>
              <p>
                • Camera access is scoped exclusively to your local device session through strict Content Security Policy (CSP) and Permissions-Policy headers.
              </p>
            </div>
          </div>

          {/* Section 4: Erasure & DPDP */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <h3>4. Right to Permanent Erasure (DPDP & GDPR Compliant)</h3>
            </div>
            <div className="pl-6 space-y-2 text-xs text-slate-600">
              <p>
                You maintain absolute ownership of your household workspace. You may trigger a complete, irreversible wipe of all members, bills, khata balances, and medication schedules at any moment via the <strong>Purge All Household Data</strong> tool in your Family Database settings.
              </p>

              {onOpenPurge && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPurge();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors cursor-pointer text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Go to Household Data Purge</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-end local &amp; encrypted proxy</span>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
