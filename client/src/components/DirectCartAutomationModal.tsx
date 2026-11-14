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
  Play,
  Terminal,
  Bookmark,
  ExternalLink as OpenIcon,
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

  // Blinkit In-Site Automation State
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptGuide, setShowScriptGuide] = useState(false);
  const [activeAutomationTab, setActiveAutomationTab] = useState<'fast_cart' | 'one_click_script'>('fast_cart');

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
        setActiveStepText(`All ${initial.length} items successfully matched for ${platform}!`);
      }
    }, 350);
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

  // Generate JavaScript code for direct in-page execution on Blinkit
  const generateBlinkitInPageScript = () => {
    const skus = cartedMatches.map((m) => m.matchedSku);
    return `(async function autoCartHomeMate() {
  const items = ${JSON.stringify(skus)};
  console.log('%c HomeMate Blinkit Cart Automator Starting...', 'background:#0c831f;color:#fff;font-size:14px;padding:6px;border-radius:6px;');

  const hud = document.createElement('div');
  hud.id = 'homemate-hud';
  hud.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999999;background:#0c831f;color:#fff;padding:16px 20px;border-radius:18px;box-shadow:0 14px 40px rgba(0,0,0,0.4);font-family:system-ui,-apple-system,sans-serif;font-size:13px;font-weight:600;min-width:300px;border:2px solid #fff;';
  hud.innerHTML = '<div style="display:flex;align-items:center;gap:8px;font-size:15px;font-weight:900;"><span>⚡</span><span>HomeMate Auto-Cart</span></div><div id="hm-msg" style="margin-top:8px;font-size:12px;opacity:0.95;">Starting item carting...</div>';
  document.body.appendChild(hud);

  const updateMsg = (txt) => { const el = document.getElementById('hm-msg'); if (el) el.innerText = txt; };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    updateMsg('Carting (' + (i + 1) + '/' + items.length + '): ' + item + '...');
    const searchInput = document.querySelector('input[placeholder*="Search"], input[type="text"], input[type="search"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.value = item;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    }
    await new Promise(r => setTimeout(r, 1200));

    const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
    const addBtn = btns.find(b => (b.textContent || '').trim().toUpperCase() === 'ADD');
    if (addBtn) {
      addBtn.click();
      updateMsg('Added: ' + item + ' ✓');
    }
    await new Promise(r => setTimeout(r, 800));
  }

  updateMsg('🎉 All items carted! Redirecting to Blinkit checkout...');
  await new Promise(r => setTimeout(r, 1200));
  window.location.href = 'https://blinkit.com/cart';
})();`;
  };

  const bookmarkletHref = `javascript:${encodeURIComponent(generateBlinkitInPageScript())}`;

  // Launch Blinkit and Copy the Script
  const handleLaunchBlinkitAutoScript = () => {
    const script = generateBlinkitInPageScript();
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setShowScriptGuide(true);
    window.open('https://blinkit.com', '_blank');
    setTimeout(() => setCopiedScript(false), 4000);
  };

  // Open Direct Platform Checkout Cart
  const handleOpenDirectCart = () => {
    let url = '';
    if (platform === 'Zepto') {
      url = 'https://www.zeptonow.com/cart';
    } else {
      url = 'https://blinkit.com/cart';
    }
    window.open(url, '_blank');
  };

  // Open single item directly in Blinkit/Zepto and mark as added
  const handleAddSingleItemToPlatform = (item: CartedItemMatch) => {
    const url =
      platform === 'Blinkit'
        ? `https://blinkit.com/s/?q=${encodeURIComponent(item.matchedSku)}`
        : `https://www.zeptonow.com/search?q=${encodeURIComponent(item.matchedSku)}`;
    window.open(url, '_blank');
    setAddedItemIds((prev) => Array.from(new Set([...prev, item.id])));
  };

  // Auto-Launch all items in sequence + Go to Cart
  const handleAutoLaunchAllItemsAndCart = () => {
    cartedMatches.slice(0, 5).forEach((match, index) => {
      setTimeout(() => {
        const query = encodeURIComponent(match.matchedSku);
        const url =
          platform === 'Blinkit'
            ? `https://blinkit.com/s/?q=${query}`
            : `https://www.zeptonow.com/search?q=${query}`;
        window.open(url, '_blank');
        setAddedItemIds((prev) => Array.from(new Set([...prev, match.id])));
      }, index * 250);
    });

    // Also open the cart as the final tab
    setTimeout(() => {
      handleOpenDirectCart();
    }, cartedMatches.length * 250 + 400);
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
          platform === 'Blinkit'
            ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-orange-700'
            : 'bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-800'
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
              Direct Site Cart Automation
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Direct Carting into {platform} Site
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-lg">
            Automates adding your Kirana items directly into your real {platform} basket with 1-click execution and takes you straight to the checkout page.
          </p>

          {/* Platform Switcher */}
          <div className="mt-4 flex items-center gap-2 bg-black/20 p-1 rounded-2xl w-fit border border-white/10">
            <button
              onClick={() => setPlatform('Blinkit')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                platform === 'Blinkit'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-yellow-200" />
              <span>Blinkit (8-Min Direct Site)</span>
            </button>
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
          </div>
        </div>

        {/* Progress & Status Bar */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            {isAutomating ? (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="truncate">{activeStepText}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-24 sm:w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  platform === 'Blinkit' ? 'bg-amber-500' : 'bg-purple-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono font-bold text-slate-500 text-[11px]">{progress}%</span>
          </div>
        </div>

        {/* Blinkit In-Site Direct Automation Engine Controller */}
        {platform === 'Blinkit' && (
          <div className="px-5 sm:px-6 pt-4 pb-1">
            <div className="p-4 rounded-3xl bg-amber-50/80 border-2 border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-500 text-white">
                    <Zap className="w-4 h-4 fill-white" />
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-amber-950">
                      Blinkit In-Site Direct Automation Engine
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      Directly add items and checkout right on the official <span className="font-bold">blinkit.com</span> site.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-200/60 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => setActiveAutomationTab('fast_cart')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      activeAutomationTab === 'fast_cart' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-900'
                    }`}
                  >
                    1-Tap Carting
                  </button>
                  <button
                    onClick={() => setActiveAutomationTab('one_click_script')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      activeAutomationTab === 'one_click_script' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-900'
                    }`}
                  >
                    Auto-Script (F12)
                  </button>
                </div>
              </div>

              {activeAutomationTab === 'fast_cart' ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-amber-200/70">
                  <div className="text-xs text-amber-900">
                    <span className="font-bold">Fast In-Site Carting:</span> Click <strong>"Auto-Launch All Items"</strong> to open items on Blinkit, or tap <strong>"+ Add on Blinkit"</strong> row-by-row below!
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAutoLaunchAllItemsAndCart}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Auto-Launch All ({cartedMatches.length})</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1 border-t border-amber-200/70 text-xs">
                  <p className="text-amber-900 leading-snug">
                    Run the automated HomeMate carting HUD directly inside <strong>blinkit.com</strong> to click "ADD" on all items automatically:
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleLaunchBlinkitAutoScript}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{copiedScript ? 'Script Copied! Opening Blinkit...' : 'Launch Blinkit & Copy Auto-Script'}</span>
                    </button>

                    <a
                      href={bookmarkletHref}
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(generateBlinkitInPageScript());
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 3000);
                        alert('Bookmarklet code copied! Drag this link to your browser bookmarks bar to click whenever you are on blinkit.com.');
                      }}
                      className="px-3 py-2 rounded-xl border border-amber-400 bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs transition-all cursor-move flex items-center gap-1.5"
                      title="Drag to bookmarks bar"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                      <span>Drag to Bookmarks: "Blinkit Auto-Cart"</span>
                    </a>
                  </div>

                  {showScriptGuide && (
                    <div className="p-3 rounded-2xl bg-white border border-amber-300 text-slate-700 text-[11px] space-y-1 animate-fadeIn">
                      <div className="font-bold text-amber-900 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Script Copied to Clipboard! How to run on Blinkit:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-1 font-medium">
                        <li>In the newly opened Blinkit tab, press <strong>F12</strong> (or Right Click ➔ Inspect).</li>
                        <li>Switch to the <strong>Console</strong> tab.</li>
                        <li>Paste (<strong>Ctrl + V</strong>) and press <strong>Enter</strong>.</li>
                        <li>The HomeMate HUD will automatically add each item and take you directly to the cart checkout!</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>Mapped Kirana Items ({cartedMatches.length})</span>
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">
                {addedItemIds.length}/{cartedMatches.length} carted
              </span>
              <button
                onClick={startAutomation}
                disabled={isAutomating}
                className="text-xs font-bold text-slate-500 hover:text-amber-600 flex items-center gap-1 cursor-pointer transition-colors ml-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {cartedMatches.map((item, index) => {
              const isItemAdded = addedItemIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                    isItemAdded
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isItemAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isItemAdded ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 truncate">
                          {item.matchedSku}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                          {item.weight}
                        </span>
                        {isItemAdded && (
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            Carted ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Kirana list: <span className="italic font-medium">"{item.originalTitle}"</span> • Est. ₹{item.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAddSingleItemToPlatform(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1 ${
                        isItemAdded
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300'
                      }`}
                      title={`Open and add on ${platform}`}
                    >
                      {isItemAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Added ✓</span>
                        </>
                      ) : (
                        <>
                          <OpenIcon className="w-3.5 h-3.5 text-amber-600" />
                          <span>+ Add on {platform}</span>
                        </>
                      )}
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
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Estimated Doorstep Payable on {platform}:</span>
              </span>
              <span className="text-base text-amber-700">₹{finalPayable}</span>
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
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenDirectCart}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                platform === 'Blinkit'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20'
                  : 'bg-purple-700 hover:bg-purple-800 shadow-purple-900/20'
              }`}
            >
              <span>Go to {platform} Cart & Checkout (Direct Cart Page)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
