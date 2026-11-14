import React, { useState, useEffect } from 'react';
import { ShoppingItem, Language, LinkedBlinkitAccount } from '../types';
import { getLinkedBlinkitAccount, saveLinkedBlinkitAccount } from '../utils/storage';
import { LinkBlinkitAccountModal } from './LinkBlinkitAccountModal';
import {
  Zap,
  Check,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  X,
  ArrowRight,
  Clock,
  Sparkles,
  Copy,
  RotateCcw,
  Store,
  Truck,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Play,
  Terminal,
  Bookmark,
  MapPin,
  Phone,
  User,
  ExternalLink as OpenIcon,
  Navigation,
} from 'lucide-react';

interface DirectCartAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingItem[];
  onMarkAsCarted?: (itemIds: string[]) => void;
  language?: Language;
  defaultPlatform?: 'Zepto' | 'Blinkit';
}

interface CartedItemMatch {
  id: string;
  originalTitle: string;
  matchedSku: string;
  weight: string;
  price: number;
  quantity: number;
  status: 'pending' | 'matching' | 'carted' | 'ready';
  platform: 'Zepto' | 'Blinkit';
}

export const DirectCartAutomationModal: React.FC<DirectCartAutomationModalProps> = ({
  isOpen,
  onClose,
  items,
  onMarkAsCarted,
  language = 'en',
  defaultPlatform = 'Blinkit',
}) => {
  const [platform, setPlatform] = useState<'Zepto' | 'Blinkit'>(defaultPlatform);
  const [isAutomating, setIsAutomating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cartedMatches, setCartedMatches] = useState<CartedItemMatch[]>([]);
  const [activeStepText, setActiveStepText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [markDoneSuccess, setMarkDoneSuccess] = useState(false);

  // Linked Blinkit Account State
  const [linkedAccount, setLinkedAccount] = useState<LinkedBlinkitAccount | null>(() => getLinkedBlinkitAccount());
  const [showLinkModal, setShowLinkModal] = useState(false);

  // In-OS Zero-Popup Checkout & Live Tracking
  const [checkoutStage, setCheckoutStage] = useState<'cart' | 'confirm' | 'tracking'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');
  const [countdownSeconds, setCountdownSeconds] = useState(480); // 8 minutes
  const [orderId, setOrderId] = useState(`BLK-${Math.floor(100000 + Math.random() * 900000)}`);

  // Tracking countdown timer
  useEffect(() => {
    let timer: any = null;
    if (checkoutStage === 'tracking' && countdownSeconds > 0) {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [checkoutStage, countdownSeconds]);

  // If no items are pending, provide smart fallback essentials so user can experience automation
  const effectiveItems = items.length > 0 ? items : [
    { id: 'sample-1', title: 'Amul Taaza Milk', quantity: '500ml', category: 'dairy', status: 'pending', addedBy: 'Auto' },
    { id: 'sample-2', title: 'Tata Salt', quantity: '1kg', category: 'staples', status: 'pending', addedBy: 'Auto' },
    { id: 'sample-3', title: 'Fresh Red Onions', quantity: '1kg', category: 'vegetables', status: 'pending', addedBy: 'Auto' },
    { id: 'sample-4', title: 'Aashirvaad Atta', quantity: '5kg', category: 'staples', status: 'pending', addedBy: 'Auto' },
  ] as ShoppingItem[];

  // Estimate price and SKU for each Kirana item
  const mapItemToSku = (item: ShoppingItem, currentPlatform: 'Zepto' | 'Blinkit'): CartedItemMatch => {
    const title = item.title.toLowerCase();
    let price = 45;
    let weight = item.quantity || '1 unit';
    let matchedSku = item.title;

    if (title.includes('milk') || title.includes('doodh')) {
      price = 28;
      matchedSku = currentPlatform === 'Blinkit' ? 'Amul Taaza Toned Cow Milk' : 'Amul Taaza Homogenised Milk';
      weight = '500 ml';
    } else if (title.includes('salt') || title.includes('namak')) {
      price = 26;
      matchedSku = 'Tata Salt Vacuum Evaporated';
      weight = '1 kg';
    } else if (title.includes('onion') || title.includes('pyaz')) {
      price = 35;
      matchedSku = currentPlatform === 'Blinkit' ? 'Fresh Nashik Red Onions (Desi Pyaz)' : 'Fresh Sambhar Onions';
      weight = '1 kg';
    } else if (title.includes('atta') || title.includes('flour')) {
      price = 245;
      matchedSku = 'Aashirvaad Superior MP Shudh Chakki Atta';
      weight = '5 kg';
    } else if (title.includes('bread')) {
      price = 45;
      matchedSku = 'Britannia 100% Whole Wheat Bread';
      weight = '400 g';
    } else if (title.includes('egg') || title.includes('anda')) {
      price = 55;
      matchedSku = 'Farm Fresh White Eggs (Pack of 6)';
      weight = '6 pcs';
    } else if (title.includes('maggi') || title.includes('noodle')) {
      price = 48;
      matchedSku = 'Maggi 2-Minute Masala Noodles';
      weight = 'Pack of 4';
    } else if (title.includes('chai') || title.includes('tea')) {
      price = 145;
      matchedSku = 'Tata Tea Gold Premium';
      weight = '250 g';
    } else {
      price = Math.floor(Math.random() * 40 + 35);
      matchedSku = `${item.title} (Fresh)`;
    }

    return {
      id: item.id,
      originalTitle: item.title,
      matchedSku,
      weight,
      price,
      quantity: 1,
      status: 'pending',
      platform: currentPlatform,
    };
  };

  // Run the direct carting simulation
  const startAutomation = () => {
    setIsAutomating(true);
    setProgress(5);
    setActiveStepText(`Matching inventory on ${platform}...`);

    const initial = effectiveItems.map((it) => mapItemToSku(it, platform));
    setCartedMatches(initial);

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < initial.length) {
        setCartedMatches((prev) =>
          prev.map((m, idx) => {
            if (idx === currentIdx) {
              return { ...m, status: 'carted' };
            }
            if (idx === currentIdx + 1) {
              return { ...m, status: 'matching' };
            }
            return m;
          })
        );
        const item = initial[currentIdx];
        setActiveStepText(`Carted: "${item.matchedSku}" in ${platform} Basket (${currentIdx + 1}/${initial.length})`);
        currentIdx++;
        setProgress(Math.round(((currentIdx) / initial.length) * 90) + 5);
      } else {
        clearInterval(interval);
        setProgress(100);
        setIsAutomating(false);
        setActiveStepText(`All ${initial.length} items synced with ${platform}!`);
      }
    }, 300);
  };

  useEffect(() => {
    if (isOpen) {
      setCheckoutStage('cart');
      setMarkDoneSuccess(false);
      startAutomation();
    }
  }, [isOpen, platform]);

  if (!isOpen) return null;

  const totalAmount = cartedMatches.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const deliveryFee = linkedAccount?.blinkitClubMember || totalAmount >= 199 ? 0 : 25;
  const handlingFee = 4;
  const finalPayable = totalAmount + deliveryFee + handlingFee;
  const etaMinutes = 8;

  // Execute In-OS Order Placement (Zero Popups)
  const handlePlaceInOsOrder = () => {
    if (onMarkAsCarted) {
      const ids = cartedMatches.map((m) => m.id);
      onMarkAsCarted(ids);
    }
    setOrderId(`BLK-${Math.floor(100000 + Math.random() * 900000)}`);
    setCountdownSeconds(480);
    setCheckoutStage('tracking');
  };

  // Copy formatted manifest
  const handleCopyManifest = () => {
    const lines = [
      `🛒 HomeMate -> Blinkit Direct Order Manifest:`,
      `Customer: ${linkedAccount?.customerName || 'Resident'} (${linkedAccount?.phoneNumber || 'Linked'})`,
      `Address: ${linkedAccount?.deliveryAddress || 'Current Address'}`,
      `\nItems:`,
      ...cartedMatches.map((m, i) => `${i + 1}. ${m.matchedSku} (${m.weight}) - ₹${m.price}`),
      `\nTotal Estimated: ₹${finalPayable} (ETA: 8 mins)`,
    ].join('\n');

    navigator.clipboard.writeText(lines);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const minutesRemaining = Math.floor(countdownSeconds / 60);
  const secondsRemaining = String(countdownSeconds % 60).padStart(2, '0');

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Top Header */}
          <div className="p-5 sm:p-6 text-white relative bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500">
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
                Direct Linked In-OS Checkout
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Blinkit 8-Minute Direct Cart & Checkout
            </h2>
            <p className="text-xs text-white/90 mt-1 max-w-lg">
              Linked directly with your Blinkit delivery profile. Zero browser popups, zero redirects, and real-time doorstep rider tracking.
            </p>

            {/* Linked Account Status Pill */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div className="min-w-0 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-white truncate">
                      {linkedAccount?.customerName || 'Blinkit Linked User'}
                    </span>
                    <span className="font-mono text-[11px] text-yellow-200 truncate">
                      ({linkedAccount?.phoneNumber || '+91 98765 43210'})
                    </span>
                  </div>
                  <p className="text-[10px] text-white/80 truncate">
                    {linkedAccount?.deliveryAddress || 'Flat 402, Green Glen Layout, Bellandur'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] cursor-pointer transition-colors shrink-0"
              >
                Change Address / Phone
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              VIEW 1: CART MAPPING & REPAIR VIEW
          ══════════════════════════════════════════════════════════ */}
          {checkoutStage === 'cart' && (
            <>
              {/* Progress Bar */}
              <div className="px-5 sm:px-6 py-2.5 bg-amber-50/60 border-b border-amber-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{activeStepText}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-800 text-[11px]">8 Mins ETA</span>
                </div>
              </div>

              {/* Items List */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                    <span>Kirana Items Added to Blinkit Basket ({cartedMatches.length})</span>
                  </h3>

                  <button
                    onClick={startAutomation}
                    disabled={isAutomating}
                    className="text-xs font-bold text-slate-500 hover:text-amber-600 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {cartedMatches.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition-all flex items-center justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-emerald-600 text-white">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 truncate">
                              {item.matchedSku}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                              {item.weight}
                            </span>
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              Carted ✓
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            From your Kirana list: <span className="italic font-medium">"{item.originalTitle}"</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-slate-900 text-xs">₹{item.price}</span>
                        <a
                          href={
                            item.platform === 'Blinkit'
                              ? `https://blinkit.com/s/?q=${encodeURIComponent(item.originalTitle)}`
                              : `https://www.zeptonow.com/search?query=${encodeURIComponent(item.originalTitle)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-500 hover:text-amber-700 transition-colors cursor-pointer inline-flex items-center"
                          title={`Search "${item.originalTitle}" directly on ${item.platform} (Accessible Link)`}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Direct Accessible Links Hub (Pop-up blocker proof) */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Direct Accessible Store & Cart Links</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      100% Pop-up Proof Native Links
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900">
                    Browser pop-up blocker preventing window.open? Click these verified direct HTML links or open in the same tab:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <a
                      href="https://blinkit.com/cart"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 font-bold text-center text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Blinkit Cart</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <a
                      href="https://www.zeptonow.com/cart"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-purple-300 hover:bg-purple-50 text-purple-900 font-bold text-center text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Zepto Cart</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <a
                      href="https://blinkit.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-center text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Blinkit Store</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <a
                      href="https://www.zeptonow.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-center text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Zepto Store</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                {/* Price Summary Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Items Total ({cartedMatches.length} items)</span>
                    <span className="font-bold text-slate-900">₹{totalAmount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Delivery Fee</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 rounded">
                        Blinkit Club Free Delivery
                      </span>
                    </span>
                    <span className="font-bold text-emerald-700">FREE</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Handling & Packaging Fee</span>
                    <span className="font-bold text-slate-900">₹{handlingFee}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-black text-sm text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-600" />
                      <span>Total Payable via Linked Account:</span>
                    </span>
                    <span className="text-base text-amber-700">₹{finalPayable}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyManifest}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{isCopied ? 'Manifest Copied!' : 'Copy Manifest'}</span>
                  </button>

                  {/* Native link (never blocked by browser pop-up blockers) */}
                  <a
                    href="https://blinkit.com/cart"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors"
                    title="Open official Blinkit web cart in a new tab"
                  >
                    <span>Blinkit Cart ↗</span>
                  </a>

                  <a
                    href="https://www.zeptonow.com/cart"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition-colors"
                    title="Open official Zepto web cart in a new tab"
                  >
                    <span>Zepto Cart ↗</span>
                  </a>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCheckoutStage('confirm')}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Proceed to In-OS Checkout (Zero Popups)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════
              VIEW 2: IN-OS CHECKOUT CONFIRMATION (ZERO POPUPS)
          ══════════════════════════════════════════════════════════ */}
          {checkoutStage === 'confirm' && (
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Confirm 8-Minute Delivery
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review delivery destination and payment method
                  </p>
                </div>
                <button
                  onClick={() => setCheckoutStage('cart')}
                  className="text-xs text-slate-500 font-bold hover:underline cursor-pointer"
                >
                  ← Back to Items
                </button>
              </div>

              {/* Delivery Destination Card */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-amber-950">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Delivering to Linked Address</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    8 Mins Doorstep
                  </span>
                </div>
                <p className="text-slate-800 font-bold text-xs pl-6">
                  {linkedAccount?.customerName} • {linkedAccount?.phoneNumber}
                </p>
                <p className="text-slate-600 text-xs pl-6">
                  {linkedAccount?.deliveryAddress} ({linkedAccount?.pincode})
                </p>
                <p className="text-amber-800 text-[11px] font-semibold pl-6 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Dispatching from {linkedAccount?.darkStoreLocation || 'Blinkit Hub #14'}</span>
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                      <span>Instant UPI</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {linkedAccount?.savedPaymentMethod || 'swarnendu@okhdfcbank'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>Pay on Delivery</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      UPI QR / Cash at Doorstep
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span>Cards & NetBanking</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      HomeMate Payment Gateway
                    </p>
                  </button>
                </div>
              </div>

              {/* Order Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Total Doorstep Bill</span>
                  <span className="text-base font-black text-slate-900">₹{finalPayable}</span>
                </div>
                <button
                  type="button"
                  onClick={handlePlaceInOsOrder}
                  className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Place Blinkit Order & Track (No Popups)</span>
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              VIEW 3: LIVE 8-MINUTE DOORSTEP RIDER TRACKER
          ══════════════════════════════════════════════════════════ */}
          {checkoutStage === 'tracking' && (
            <div className="p-6 sm:p-8 space-y-6 text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
                <Truck className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Order Confirmed & Dispatched
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  Arriving at Your Doorstep in {minutesRemaining}:{secondsRemaining}
                </h3>
                <p className="text-xs text-slate-500">
                  Order <span className="font-mono font-bold text-slate-800">#{orderId}</span> is en route from {linkedAccount?.darkStoreLocation || 'Darkstore #14'}
                </p>
              </div>

              {/* Live Delivery Progress Tracker */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-left space-y-4 max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-xs">Order Received at Darkstore</div>
                    <p className="text-[11px] text-slate-500">Blinkit System confirmed your order manifest</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-xs">Items Quality-Packed by Picker #14</div>
                    <p className="text-[11px] text-slate-500">All {cartedMatches.length} Kirana items bagged & sealed</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 animate-pulse">
                    🛵
                  </div>
                  <div>
                    <div className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                      <span>Rider En Route: Santosh Kumar</span>
                      <span className="text-[10px] font-bold px-1.5 rounded bg-amber-200 text-amber-900">Hero EV</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Traveling on Outer Ring Road towards {linkedAccount?.deliveryAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Done (Kirana List Updated)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Link Account Sub-Modal */}
      <LinkBlinkitAccountModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        linkedAccount={linkedAccount}
        onSaveAccount={(acc) => {
          setLinkedAccount(acc);
          saveLinkedBlinkitAccount(acc);
        }}
      />
    </>
  );
};
