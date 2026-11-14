import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Download,
  IndianRupee,
  RefreshCw,
  Zap,
} from 'lucide-react';
import QRCode from 'qrcode';
import { PaymentGatewayResponse } from '../types';
import { processBillPaymentGateway } from '../utils/api';

interface BillPaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: {
    id?: string;
    title: string;
    amount: number;
    dueDate?: string;
    billerAccount?: string;
    category?: string;
  } | null;
  onPaymentSuccess: (res: PaymentGatewayResponse) => void;
}

export const BillPaymentGatewayModal: React.FC<BillPaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  bill,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking' | 'bbps'>('upi');
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // BBPS Consumer Number
  const [consumerNumber, setConsumerNumber] = useState('');

  // Flow stages: 'input' | 'processing' | 'otp' | 'success' | 'error'
  const [stage, setStage] = useState<'input' | 'processing' | 'otp' | 'success' | 'error'>('input');
  const [otpValue, setOtpValue] = useState('');
  const [gatewayResult, setGatewayResult] = useState<PaymentGatewayResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate UPI QR code for the exact bill amount
  useEffect(() => {
    if (isOpen && bill) {
      const upiUri = `upi://pay?pa=homemate.bills@hdfcbank&pn=${encodeURIComponent(
        bill.title
      )}&am=${bill.amount}&cu=INR&tn=${encodeURIComponent('Bill Payment: ' + bill.title)}`;

      QRCode.toDataURL(upiUri, {
        width: 240,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      })
        .then((url) => setUpiQrDataUrl(url))
        .catch((err) => console.warn('Error generating bill QR:', err));

      setStage('input');
      setErrorMessage(null);
      setGatewayResult(null);
      setOtpValue('');
    }
  }, [isOpen, bill]);

  if (!isOpen || !bill) return null;

  // Format Card Number input with spaces
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.substring(0, 2)}/${raw.substring(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Submit Payment Request
  const handleInitiatePayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (method === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setErrorMessage('Please enter expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('Please enter 3-digit CVV.');
        return;
      }
      // Trigger 3D Secure OTP Step
      setStage('otp');
      return;
    }

    executeGatewayClearance();
  };

  const executeGatewayClearance = async () => {
    setStage('processing');

    try {
      // Simulate realistic payment gateway processing
      const res = await processBillPaymentGateway({
        billId: bill.id,
        billerName: bill.title,
        amount: bill.amount,
        paymentMethod: method,
        details: {
          billerAccount: bill.billerAccount,
          consumerNumber: consumerNumber || bill.billerAccount,
          selectedBank: method === 'netbanking' ? selectedBank : undefined,
          cardHolder: method === 'card' ? cardHolder : undefined,
          lastFour: method === 'card' ? cardNumber.slice(-4) : undefined,
        },
      });

      setGatewayResult(res);
      setStage('success');
      onPaymentSuccess(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
      setStage('error');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Gateway Security Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  HomeMate Secure Payment Gateway
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>256-bit Encrypted</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Official NPCI UPI & BBPS (Bharat BillPay) Compliant Settlement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close payment modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bill Summary Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Paying Monthly Household Bill
            </span>
            <h4 className="text-base font-extrabold text-slate-900">
              {bill.title}
            </h4>
            {bill.billerAccount && (
              <span className="text-xs text-slate-500 font-mono">
                Consumer / Account No: {bill.billerAccount}
              </span>
            )}
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-slate-500 block">Total Due Amount</span>
            <div className="text-2xl font-black text-emerald-700 flex items-center sm:justify-end">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
              <span>{bill.amount.toLocaleString('en-IN')}</span>
            </div>
            {bill.dueDate && (
              <span className="text-[11px] font-medium text-slate-500">
                Due by {bill.dueDate}
              </span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Main Body per Stage */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 touch-scroll">
          
          {/* STAGE 1: INPUT PAYMENT DETAILS */}
          {stage === 'input' && (
            <div className="space-y-5">
              
              {/* Payment Rail Select Tabs */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    method === 'upi'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs font-extrabold block">Instant UPI</span>
                  <span className="text-[9px] text-slate-500">Zero Fee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    method === 'card'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                  <span className="text-xs font-extrabold block">Cards</span>
                  <span className="text-[9px] text-slate-500">Visa / RuPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('netbanking')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    method === 'netbanking'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-5 h-5 mx-auto mb-1 text-teal-600" />
                  <span className="text-xs font-extrabold block">Net Banking</span>
                  <span className="text-[9px] text-slate-500">All Banks</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('bbps')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    method === 'bbps'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Zap className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <span className="text-xs font-extrabold block">BBPS Pay</span>
                  <span className="text-[9px] text-slate-500">Direct Fetch</span>
                </button>
              </div>

              {/* UPI PAY INTERFACE */}
              {method === 'upi' && (
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4 animate-fadeIn">
                  <div className="text-center space-y-2">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-900">
                      Scan with any UPI App (GPay / PhonePe / Paytm / Cred)
                    </span>

                    {upiQrDataUrl ? (
                      <div className="mx-auto w-44 h-44 bg-white p-2 rounded-2xl border-2 border-emerald-300 shadow-md flex items-center justify-center">
                        <img
                          src={upiQrDataUrl}
                          alt="UPI Payment QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-44 h-44 mx-auto bg-slate-100 rounded-2xl animate-pulse" />
                    )}

                    <p className="text-xs text-slate-600 font-mono">
                      Paying to: <strong className="text-slate-800">homemate.bills@hdfcbank</strong>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Instant confirmation upon payment scan</span>
                    </div>

                    <button
                      type="button"
                      onClick={executeGatewayClearance}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <span>I've Paid via UPI App</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* CARD PAYMENT INTERFACE */}
              {method === 'card' && (
                <form onSubmit={handleInitiatePayment} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Enter Card Details</span>
                    <span className="text-[10px] font-bold text-slate-400">RuPay • Visa • Mastercard</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="4532 •••• •••• 8492"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="e.g. Ramesh Sharma"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Expiry</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Proceed to 3D Secure OTP &rarr;</span>
                  </button>
                </form>
              )}

              {/* NET BANKING INTERFACE */}
              {method === 'netbanking' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 animate-fadeIn">
                  <span className="text-xs font-bold text-slate-700 block">Select Your Bank</span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                          selectedBank === bank
                            ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Building className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{bank}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={executeGatewayClearance}
                    className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 mt-3"
                  >
                    <span>Login to {selectedBank} & Authorize ₹{bill.amount}</span>
                  </button>
                </div>
              )}

              {/* BBPS (BHARAT BILLPAY) INTERFACE */}
              {method === 'bbps' && (
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3.5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Bharat Bill Payment System (BBPS) Automated Clearance</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Consumer / Account ID / CA Number
                    </label>
                    <input
                      type="text"
                      value={consumerNumber || bill.billerAccount || ''}
                      onChange={(e) => setConsumerNumber(e.target.value)}
                      placeholder="e.g. 1049281902"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug">
                    BBPS directly communicates with electricity boards (BESCOM, WBSEDCL, Tata Power, etc.) and LPG gas agencies to clear the outstanding balance and obtain official government receipt.
                  </p>

                  <button
                    type="button"
                    onClick={executeGatewayClearance}
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <span>Direct BBPS Instant Payment (₹{bill.amount})</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* STAGE 2: 3D SECURE OTP SIMULATION FOR CARDS */}
          {stage === 'otp' && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900">3D Secure Card Verification</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  A one-time security password has been sent to your bank-registered mobile number ending in •••• 9104.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-indigo-400 bg-white text-center font-mono text-lg font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => setOtpValue('739104')}
                  className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer block mx-auto"
                >
                  ⚡ Auto-fill demo OTP (739104)
                </button>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStage('input')}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={executeGatewayClearance}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
                >
                  Confirm & Pay ₹{bill.amount}
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: GATEWAY PROCESSING ANIMATION */}
          {stage === 'processing' && (
            <div className="p-10 text-center space-y-4 animate-fadeIn">
              <RefreshCw className="w-12 h-12 text-emerald-600 mx-auto animate-spin" />
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">
                  Contacting Payment Switch & Clearing House...
                </h4>
                <p className="text-xs text-slate-500">
                  Please do not refresh or close this window. Securing 256-bit bank authorization.
                </p>
              </div>
            </div>
          )}

          {/* STAGE 4: PAYMENT SUCCESS RECEIPT */}
          {stage === 'success' && gatewayResult && (
            <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-5 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-emerald-950">
                  Payment Approved & Cleared!
                </h4>
                <p className="text-xs text-emerald-800">
                  {gatewayResult.message}
                </p>
              </div>

              {/* Digital Bill Receipt Slip */}
              <div className="p-4 rounded-xl bg-white border border-emerald-200 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-sans">Biller:</span>
                  <span className="font-extrabold text-slate-900 font-sans">{bill.title}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-sans">Amount Paid:</span>
                  <span className="font-black text-emerald-700 text-sm">₹{bill.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-sans">Transaction ID:</span>
                  <span className="font-bold text-slate-800">{gatewayResult.transactionId}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-sans">Bank Reference:</span>
                  <span className="font-bold text-slate-800">{gatewayResult.bankReferenceNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Paid On:</span>
                  <span className="text-slate-700">{new Date(gatewayResult.paidAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => alert(`Receipt downloaded for transaction: ${gatewayResult.transactionId}`)}
                  className="px-4 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
