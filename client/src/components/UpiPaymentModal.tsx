import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Check, Copy, ExternalLink, IndianRupee, ShieldCheck, Smartphone } from 'lucide-react';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  paidBy: string;
  upiId: string;
  onMarkSettled: () => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  title,
  amount,
  paidBy,
  upiId,
  onMarkSettled,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Standard NPCI UPI Intent URI specification
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    paidBy
  )}&am=${amount.toFixed(2)}&tn=${encodeURIComponent(`HomeMate: ${title}`)}&cu=INR`;

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(upiUri, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate UPI QR code:', err));
  }, [isOpen, upiUri]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">UPI Instant Payment</h3>
              <p className="text-xs text-emerald-100">Zero fees • Direct bank transfer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              Total Share Due
            </span>
            <div className="text-3xl font-black text-slate-900 mt-0.5">
              ₹{amount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              For: <strong>{title}</strong>
            </p>
            <p className="text-xs text-slate-600">
              Paying: <span className="font-semibold text-emerald-700">{paidBy}</span> ({upiId})
            </p>
          </div>

          {/* QR Code Container */}
          <div className="relative mx-auto w-64 h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-emerald-300 p-2 flex items-center justify-center shadow-inner">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="UPI Payment QR Code"
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <div className="text-xs text-slate-400 animate-pulse">Generating secure QR code...</div>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
            <span>Scan with Google Pay, PhonePe, Paytm, or BHIM</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <a
              href={upiUri}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-98"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in UPI App on Phone</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy UPI Link'}</span>
              </button>

              <button
                onClick={() => {
                  onMarkSettled();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Mark Settled</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
