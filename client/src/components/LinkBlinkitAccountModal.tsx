import React, { useState } from 'react';
import { LinkedBlinkitAccount } from '../types';
import {
  Zap,
  Check,
  CheckCircle2,
  X,
  Phone,
  User,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  CreditCard,
  Trash2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface LinkBlinkitAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedAccount: LinkedBlinkitAccount | null;
  onSaveAccount: (account: LinkedBlinkitAccount | null) => void;
}

export const LinkBlinkitAccountModal: React.FC<LinkBlinkitAccountModalProps> = ({
  isOpen,
  onClose,
  linkedAccount,
  onSaveAccount,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(linkedAccount?.phoneNumber || '+91 98765 43210');
  const [customerName, setCustomerName] = useState(linkedAccount?.customerName || 'Swarnendu Samaddar');
  const [deliveryAddress, setDeliveryAddress] = useState(
    linkedAccount?.deliveryAddress || 'Flat 402, Green Glen Layout, Outer Ring Road'
  );
  const [pincode, setPincode] = useState(linkedAccount?.pincode || '560103');
  const [landmark, setLandmark] = useState(linkedAccount?.landmark || 'Opposite Central Mall');
  const [isClubMember, setIsClubMember] = useState(linkedAccount?.blinkitClubMember ?? true);

  // OTP Verification state for linking
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('123456');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSendLinkOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number registered with Blinkit.');
      return;
    }
    setErrorMsg(null);
    setIsVerifying(true);
  };

  const handleConfirmLink = () => {
    if (!otpCode || otpCode.trim() !== demoOtp) {
      setErrorMsg('Invalid code. Please enter 123456 or click Auto-fill.');
      return;
    }

    const updated: LinkedBlinkitAccount = {
      phoneNumber: phoneNumber.trim(),
      customerName: customerName.trim() || 'HomeMate Household User',
      deliveryAddress: deliveryAddress.trim() || 'Default Household Address',
      pincode: pincode.trim() || '560103',
      landmark: landmark.trim() || undefined,
      darkStoreLocation: `Blinkit Darkstore #${Math.floor(Math.random() * 80 + 10)} (ETA 8 mins)`,
      isLinked: true,
      linkedAt: new Date().toISOString(),
      blinkitClubMember: isClubMember,
      savedPaymentMethod: 'UPI (Fast Clearance)',
    };

    onSaveAccount(updated);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 1200);
  };

  const handleUnlink = () => {
    if (confirm('Are you sure you want to unlink your Blinkit account?')) {
      onSaveAccount(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white">
              <Zap className="w-4 h-4 fill-white" />
            </span>
            <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
              Direct Web OS Integration
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Link Blinkit Account
          </h2>
          <p className="text-xs text-white/90 mt-1 max-w-sm">
            Link your registered Blinkit phone number and address directly with HomeMate to order Kirana essentials without browser popup blockers or external redirects.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {successToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Blinkit account successfully connected to HomeMate!</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 font-semibold flex items-center gap-2 animate-fadeIn">
              <X className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {linkedAccount?.isLinked && !isVerifying ? (
            /* Already Linked Profile View */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-black text-emerald-950 text-sm">
                      Connected to Blinkit Profile
                    </span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                    Active
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-700">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold">{linkedAccount.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{linkedAccount.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{linkedAccount.deliveryAddress} ({linkedAccount.pincode})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-bold text-amber-900">{linkedAccount.darkStoreLocation || 'Nearby Darkstore (ETA 8 mins)'}</span>
                  </div>
                </div>

                {linkedAccount.blinkitClubMember && (
                  <div className="pt-2 border-t border-emerald-200 flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Blinkit Club Active • Zero delivery fee & prioritized packing</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleUnlink}
                  className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Unlink Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVerifying(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer transition-colors"
                >
                  Update Phone or Address
                </button>
              </div>
            </div>
          ) : isVerifying ? (
            /* OTP Verification Step */
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-sm">
                  Verify Blinkit Authorization Code
                </h4>
                <p className="text-[11px] text-slate-500">
                  Enter the 6-digit sync code sent to <span className="font-bold text-slate-900">{phoneNumber}</span>
                </p>
              </div>

              {/* Sandbox Demo helper */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-left flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                    Blinkit API Sandbox Sync Code
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{demoOtp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(demoOtp)}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700 cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center font-mono text-xl tracking-[0.5em] py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-bold"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLink}
                  className="w-2/3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Complete Linking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Link Form */
            <form onSubmit={handleSendLinkOtp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Registered Blinkit Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Customer / Recipient Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Swarnendu Samaddar"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Flat 402, Green Glen Layout, Outer Ring Road"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560103"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Opp Central Mall"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={isClubMember}
                    onChange={(e) => setIsClubMember(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Active Blinkit Club Member (Free delivery on all orders)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>Continue to Authorization</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-1 text-center">
                <a
                  href="https://blinkit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline inline-flex items-center gap-1"
                  title="Open official Blinkit website in new tab"
                >
                  <span>Visit official Blinkit website ↗</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
