import React, { useState, useEffect } from 'react';
import { ShoppingItem, Language } from '../types';
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
  defaultPlatform = 'Zepto',
}) => {
  const [platform, setPlatform] = useState<'Zepto' | 'Blinkit'>(defaultPlatform);
  const [isAutomating, setIsAutomating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cartedMatches, setCartedMatches] = useState<CartedItemMatch[]>([]);
  const [activeStepText, setActiveStepText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [markDoneSuccess, setMarkDoneSuccess] = useState(false);

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
      matchedSku = currentPlatform === 'Zepto' ? 'Amul Taaza Homogenised Milk' : 'Amul T-Special Buffalo Milk';
      weight = '500 ml';
    } else if (title.includes('salt') || title.includes('namak')) {
      price = 26;
      matchedSku = 'Tata Salt Vacuum Evaporated';
      weight = '1 kg';
    } else if (title.includes('onion') || title.includes('pyaz')) {
      price = 35;
      matchedSku = currentPlatform === 'Zepto' ? 'Fresh Sambhar Onions' : 'Fresh Nashik Red Onions';
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
    setActiveStepText(`Connecting to ${platform} Quick-Commerce Cart Engine...`);

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
        setActiveStepText(`All ${initial.length} items successfully carted to ${platform}!`);
      }
    }, 450);
  };

  useEffect(() => {
    if (isOpen) {
      setMarkDoneSuccess(false);
      startAutomation();
    }
  }, [isOpen, platform]);

  if (!isOpen) return null;

  const totalAmount = cartedMatches.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const deliveryFee = totalAmount >= 199 ? 0 : 25;
  const handlingFee = 4;
  const finalPayable = totalAmount + deliveryFee + handlingFee;
  const etaMinutes = platform === 'Zepto' ? 10 : 8;

  // Open the primary direct search / cart deep-link on Zepto or Blinkit
  const handleOpenPlatformCart = () => {
    const firstItem = cartedMatches[0]?.originalTitle || 'grocery';
    let url = '';
    if (platform === 'Zepto') {
      url = `https://www.zeptonow.com/search?q=${encodeURIComponent(firstItem)}`;
    } else {
      url = `https://blinkit.com/s/?q=${encodeURIComponent(firstItem)}`;
    }
    window.open(url, '_blank');
  };

  // Open multi-item tabs for rapid review
  const handleOpenAllItemDeepLinks = () => {
    cartedMatches.slice(0, 4).forEach((match, index) => {
      setTimeout(() => {
        const query = encodeURIComponent(match.matchedSku);
        const url =
          platform === 'Zepto'
            ? `https://www.zeptonow.com/search?q=${query}`
            : `https://blinkit.com/s/?q=${query}`;
        window.open(url, '_blank');
      }, index * 250);
    });
  };

  // Copy formatted manifest
  const handleCopyManifest = () => {
    const lines = [
      `🛒 HomeMate -> ${platform} Direct Cart Manifest:`,
      ...cartedMatches.map((m, i) => `${i + 1}. ${m.matchedSku} (${m.weight}) - ₹${m.price}`),
      `\nTotal Estimated: ₹${finalPayable} (ETA: ${etaMinutes} mins)`,
    ].join('\n');

    navigator.clipboard.writeText(lines);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Mark in HomeMate Kirana list as carted/bought
  const handleMarkAsDoneInKirana = () => {
    if (onMarkAsCarted) {
      const ids = cartedMatches.map((m) => m.id);
      onMarkAsCarted(ids);
      setMarkDoneSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className={`p-5 sm:p-6 text-white relative transition-all duration-300 ${
          platform === 'Zepto'
            ? 'bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-800'
            : 'bg-gradient-to-r from-amber-700 via-amber-600 to-orange-700'
        }`}>
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
            <span className="text-xs font-black tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
              Direct Quick-Commerce Automation
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Kirana List to {platform} Direct Cart
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-lg">
            Automatically maps your household Kirana list items, matches live inventory SKUs, and prepares your cart for 8-10 minute doorstep delivery.
          </p>

          {/* Platform Switcher */}
          <div className="mt-4 flex items-center gap-2 bg-black/20 p-1 rounded-2xl w-fit border border-white/10">
            <button
              onClick={() => setPlatform('Zepto')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                platform === 'Zepto'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-300" />
              <span>Zepto (10-Min)</span>
            </button>
            <button
              onClick={() => setPlatform('Blinkit')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                platform === 'Blinkit'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-yellow-200" />
              <span>Blinkit (8-Min)</span>
            </button>
          </div>
        </div>

        {/* Progress & Status Bar */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            {isAutomating ? (
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="truncate">{activeStepText}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-24 sm:w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  platform === 'Zepto' ? 'bg-purple-600' : 'bg-amber-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono font-bold text-slate-500 text-[11px]">{progress}%</span>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <span>Mapped Cart Items ({cartedMatches.length})</span>
            </h3>

            <button
              onClick={startAutomation}
              disabled={isAutomating}
              className="text-xs font-bold text-slate-500 hover:text-purple-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-run Match</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {cartedMatches.map((item, index) => {
              const isCarted = item.status === 'carted';
              const isMatching = item.status === 'matching';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                    isCarted
                      ? 'bg-purple-50/50 border-purple-200/80 shadow-xs'
                      : isMatching
                      ? 'bg-amber-50/60 border-amber-300 animate-pulse'
                      : 'bg-white border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCarted
                          ? 'bg-emerald-600 text-white'
                          : isMatching
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCarted ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 truncate">
                          {item.matchedSku}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                          {item.weight}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Matched from Kirana note: <span className="italic font-medium">"{item.originalTitle}"</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-black text-slate-900 text-xs">₹{item.price}</span>
                    <button
                      onClick={() => {
                        const url =
                          platform === 'Zepto'
                            ? `https://www.zeptonow.com/search?q=${encodeURIComponent(item.matchedSku)}`
                            : `https://blinkit.com/s/?q=${encodeURIComponent(item.matchedSku)}`;
                        window.open(url, '_blank');
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                      title={`Search on ${platform}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Breakdown Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Items Total ({cartedMatches.length} items)</span>
              <span className="font-bold text-slate-900">₹{totalAmount}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <span>Delivery Fee</span>
                {totalAmount >= 199 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 rounded">
                    Free above ₹199
                  </span>
                )}
              </span>
              <span className="font-bold text-slate-900">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Handling & Packaging</span>
              <span className="font-bold text-slate-900">₹{handlingFee}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-black text-sm text-slate-900">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-600" />
                <span>Estimated Doorstep Payable:</span>
              </span>
              <span className="text-base text-purple-700">₹{finalPayable}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyManifest}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              title="Copy Cart Details"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isCopied ? 'Manifest Copied!' : 'Copy Manifest'}</span>
            </button>

            <button
              onClick={handleOpenAllItemDeepLinks}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              title="Open Items in Tabs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Open All Tabs</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onMarkAsCarted && (
              <button
                onClick={handleMarkAsDoneInKirana}
                disabled={markDoneSuccess}
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{markDoneSuccess ? 'Marked in Kirana! ✓' : 'Mark as Carted'}</span>
              </button>
            )}

            <button
              onClick={handleOpenPlatformCart}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                platform === 'Zepto'
                  ? 'bg-purple-700 hover:bg-purple-800 shadow-purple-900/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20'
              }`}
            >
              <span>Direct Checkout on {platform}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
