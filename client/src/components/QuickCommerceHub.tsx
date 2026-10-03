import React, { useState } from 'react';
import { ShoppingItem, AppMode, Language } from '../types';
import { translations } from '../utils/translations';
import {
  Zap,
  ShoppingBag,
  ExternalLink,
  Plus,
  Check,
  Clock,
  Sparkles,
  Store,
  Search,
  Tag,
  Percent,
} from 'lucide-react';

interface QuickCommerceHubProps {
  shoppingItems: ShoppingItem[];
  onAddItem: (item: Omit<ShoppingItem, 'id'>) => void;
  accentColor?: 'emerald' | 'indigo' | 'amber' | 'purple';
  currentMode?: AppMode;
  language?: Language;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  category: 'dairy' | 'vegetables' | 'staples' | 'snacks' | 'health';
  targetMode: 'elder' | 'hostel' | 'family' | 'all';
  price: number;
  originalPrice?: number;
  weight: string;
  image: string;
  platform: 'Zepto' | 'Blinkit' | 'Instamart';
  platformColor: string;
  platformBg: string;
  etaMinutes: number;
  rating: number;
  highlight?: string;
}

export const QUICK_COMMERCE_CATALOG: RecommendedProduct[] = [
  // ELDER ESSENTIALS
  {
    id: 'elder-1',
    name: 'Amul Taaza Homogenised Toned Cow Milk',
    category: 'dairy',
    targetMode: 'elder',
    price: 28,
    originalPrice: 30,
    weight: '500 ml',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
    platform: 'Zepto',
    platformColor: 'text-purple-600',
    platformBg: 'bg-purple-100 border-purple-200',
    etaMinutes: 10,
    rating: 4.9,
    highlight: 'Daily Fresh Dairy',
  },
  {
    id: 'elder-2',
    name: 'Dabur Chyawanprash 2X Immunity Awaleha',
    category: 'health',
    targetMode: 'elder',
    price: 215,
    originalPrice: 240,
    weight: '500 g',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80',
    platform: 'Blinkit',
    platformColor: 'text-amber-700',
    platformBg: 'bg-amber-100 border-amber-200',
    etaMinutes: 8,
    rating: 4.8,
    highlight: 'Elder Immunity',
  },
  {
    id: 'elder-3',
    name: 'Britannia Marie Gold Crisp Tea Biscuits',
    category: 'snacks',
    targetMode: 'elder',
    price: 35,
    originalPrice: 40,
    weight: '300 g',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=300&q=80',
    platform: 'Instamart',
    platformColor: 'text-orange-600',
    platformBg: 'bg-orange-100 border-orange-200',
    etaMinutes: 11,
    rating: 4.7,
    highlight: 'Low Calorie Snack',
  },
  {
    id: 'elder-4',
    name: 'Fresh Robusta Ripe Bananas (Kela)',
    category: 'vegetables',
    targetMode: 'elder',
    price: 38,
    originalPrice: 45,
    weight: '500 g (4-5 pcs)',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=300&q=80',
    platform: 'Zepto',
    platformColor: 'text-purple-600',
    platformBg: 'bg-purple-100 border-purple-200',
    etaMinutes: 10,
    rating: 4.8,
    highlight: 'High Potassium',
  },
  {
    id: 'elder-5',
    name: 'Tetley Pure Green Tea (Anti-Oxidant Bags)',
    category: 'health',
    targetMode: 'elder',
    price: 145,
    originalPrice: 165,
    weight: '25 bags',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80',
    platform: 'Blinkit',
    platformColor: 'text-amber-700',
    platformBg: 'bg-amber-100 border-amber-200',
    etaMinutes: 8,
    rating: 4.9,
    highlight: 'Heart & Digestion',
  },
  {
    id: 'elder-6',
    name: 'ORS Electrolyte Drink Apple Flavour',
    category: 'health',
    targetMode: 'elder',
    price: 32,
    originalPrice: 35,
    weight: '200 ml Tetra',
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=300&q=80',
    platform: 'Instamart',
    platformColor: 'text-orange-600',
    platformBg: 'bg-orange-100 border-orange-200',
    etaMinutes: 11,
    rating: 4.8,
    highlight: 'Hydration Recovery',
  },

  // HOSTEL ESSENTIALS
  {
    id: 'hostel-1',
    name: 'Maggi 2-Minute Masala Noodles (Pack of 4)',
    category: 'snacks',
    targetMode: 'hostel',
    price: 56,
    originalPrice: 60,
    weight: '280 g',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=300&q=80',
    platform: 'Blinkit',
    platformColor: 'text-amber-700',
    platformBg: 'bg-amber-100 border-amber-200',
    etaMinutes: 8,
    rating: 4.9,
    highlight: 'Midnight Lifesaver',
  },
  {
    id: 'hostel-2',
    name: 'Farm Fresh White Protein Eggs (Carton)',
    category: 'dairy',
    targetMode: 'hostel',
    price: 58,
    originalPrice: 66,
    weight: '6 pcs',
    image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=300&q=80',
    platform: 'Zepto',
    platformColor: 'text-purple-600',
    platformBg: 'bg-purple-100 border-purple-200',
    etaMinutes: 10,
    rating: 4.9,
    highlight: 'Quick Bhurji / Boil',
  },
  {
    id: 'hostel-3',
    name: 'Britannia 100% Whole Wheat Sandwich Bread',
    category: 'staples',
    targetMode: 'hostel',
    price: 45,
    originalPrice: 50,
    weight: '400 g',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
    platform: 'Instamart',
    platformColor: 'text-orange-600',
    platformBg: 'bg-orange-100 border-orange-200',
    etaMinutes: 11,
    rating: 4.7,
    highlight: 'Toast & Sandwiches',
  },
  {
    id: 'hostel-4',
    name: 'Nescafé Classic Instant Coffee Powder Jar',
    category: 'snacks',
    targetMode: 'hostel',
    price: 160,
    originalPrice: 175,
    weight: '50 g',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
    platform: 'Zepto',
    platformColor: 'text-purple-600',
    platformBg: 'bg-purple-100 border-purple-200',
    etaMinutes: 10,
    rating: 4.8,
    highlight: 'All-Nighter Fuel',
  },
  {
    id: 'hostel-5',
    name: 'Kurkure Masala Munch Crispy Snack',
    category: 'snacks',
    targetMode: 'hostel',
    price: 20,
    originalPrice: 20,
    weight: '82 g',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80',
    platform: 'Blinkit',
    platformColor: 'text-amber-700',
    platformBg: 'bg-amber-100 border-amber-200',
    etaMinutes: 8,
    rating: 4.8,
    highlight: 'Hostel Movie Night',
  },
  {
    id: 'hostel-6',
    name: 'Haldiram’s Nagpur Aloo Bhujia Sev',
    category: 'snacks',
    targetMode: 'hostel',
    price: 55,
    originalPrice: 60,
    weight: '200 g',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=300&q=80',
    platform: 'Instamart',
    platformColor: 'text-orange-600',
    platformBg: 'bg-orange-100 border-orange-200',
    etaMinutes: 11,
    rating: 4.9,
    highlight: 'Chai Time Companion',
  },

  // FAMILY & PANTRY ESSENTIALS
  {
    id: 'family-1',
    name: 'Aashirvaad Superior MP Shudh Chakki Atta',
    category: 'staples',
    targetMode: 'family',
    price: 245,
    originalPrice: 265,
    weight: '5 kg',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80',
    platform: 'Instamart',
    platformColor: 'text-orange-600',
    platformBg: 'bg-orange-100 border-orange-200',
    etaMinutes: 12,
    rating: 4.9,
    highlight: 'Pantry Core Staple',
  },
  {
    id: 'family-2',
    name: 'Fresh Farm Country Tomatoes (Hybrid)',
    category: 'vegetables',
    targetMode: 'family',
    price: 34,
    originalPrice: 42,
    weight: '1 kg',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80',
    platform: 'Blinkit',
    platformColor: 'text-amber-700',
    platformBg: 'bg-amber-100 border-amber-200',
    etaMinutes: 8,
    rating: 4.6,
    highlight: 'Fresh Mandi Harvest',
  },
  {
    id: 'family-3',
    name: 'Fortune Sunlite Refined Sunflower Oil Pouch',
    category: 'staples',
    targetMode: 'family',
    price: 135,
    originalPrice: 150,
    weight: '1 L',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
    platform: 'Zepto',
    platformColor: 'text-purple-600',
    platformBg: 'bg-purple-100 border-purple-200',
    etaMinutes: 10,
    rating: 4.8,
    highlight: 'Pure Cooking Oil',
  },
  {
    id: 'family-4',
    name: 'Tata Sampann Unpolished Toor Dal (Arhar)',
    category: 'staples',
    targetMode: 'family',
    price: 175,
    originalPrice: 195,
    weight: '1 kg',
    image: 'https://images.unsplash.com/photo-1585994192700-4720619a9d06?auto=format&fit=crop&w=300&q=80',
    platform: 'Blinkit',
    platformColor: 'text-amber-700',
    platformBg: 'bg-amber-100 border-amber-200',
    etaMinutes: 8,
    rating: 4.9,
    highlight: 'Unpolished Protein',
  },
  {
    id: 'family-5',
    name: 'Tata Salt Vacuum Evaporated Iodised Salt',
    category: 'staples',
    targetMode: 'family',
    price: 26,
    originalPrice: 28,
    weight: '1 kg',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80',
    platform: 'Instamart',
    platformColor: 'text-orange-600',
    platformBg: 'bg-orange-100 border-orange-200',
    etaMinutes: 11,
    rating: 4.9,
    highlight: 'Desh Ka Namak',
  },
  {
    id: 'family-6',
    name: 'Fresh Red Onions (Desi Pyaz)',
    category: 'vegetables',
    targetMode: 'family',
    price: 32,
    originalPrice: 40,
    weight: '1 kg',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=300&q=80',
    platform: 'Blinkit',
    platformColor: 'text-amber-700',
    platformBg: 'bg-amber-100 border-amber-200',
    etaMinutes: 8,
    rating: 4.7,
    highlight: 'Kitchen Foundation',
  },
];

export const QuickCommerceHub: React.FC<QuickCommerceHubProps> = ({
  shoppingItems,
  onAddItem,
  currentMode = 'family',
  language = 'en',
}) => {
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<'All' | 'Zepto' | 'Blinkit' | 'Instamart'>('All');
  const [activeTabMode, setActiveTabMode] = useState<AppMode | 'all'>(currentMode || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const t = translations[language];

  const handleAddProduct = (prod: RecommendedProduct) => {
    onAddItem({
      title: prod.name,
      localTitle: `${prod.platform} • ₹${prod.price}`,
      quantity: prod.weight,
      category: prod.category,
      addedBy: `${prod.platform} Quick Commerce Recommendation`,
      status: 'pending',
      reason: 'manual',
    });

    setAddedItemIds((prev) => [...prev, prod.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== prod.id));
    }, 2500);
  };

  const openQuickCommerceSearch = (platform: 'Zepto' | 'Blinkit' | 'Instamart', query: string) => {
    let url = '';
    const q = encodeURIComponent(query.trim() || 'grocery');

    if (platform === 'Zepto') {
      url = `https://www.zeptonow.com/search?q=${q}`;
    } else if (platform === 'Blinkit') {
      url = `https://blinkit.com/s/?q=${q}`;
    } else {
      url = `https://www.swiggy.com/instamart/search?query=${q}`;
    }

    window.open(url, '_blank');
  };

  const filteredProducts = QUICK_COMMERCE_CATALOG.filter((prod) => {
    // 1. Platform Filter
    const matchesPlatform = selectedPlatform === 'All' || prod.platform === selectedPlatform;

    // 2. Mode Filter
    const matchesMode =
      activeTabMode === 'all' || prod.targetMode === activeTabMode || prod.targetMode === 'all';

    // 3. Search Query
    const matchesSearch =
      !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.highlight && prod.highlight.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPlatform && matchesMode && matchesSearch;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-6 animate-fadeInUp">
      {/* 1. Header with Live Quick Commerce Logos */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700 animate-pulse-soft">
              <Zap className="w-5 h-5 fill-purple-600" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {t.qcTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.qcSubtitle}
          </p>
        </div>

        {/* 1-Tap Direct Store Launchers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openQuickCommerceSearch('Zepto', shoppingItems[0]?.title || 'milk')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-all shadow-xs hover:scale-102 active:scale-95 cursor-pointer"
            title="Open Zepto 10-Min Delivery"
          >
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
            <span>Zepto ({t.zeptoEta})</span>
            <ExternalLink className="w-3 h-3 text-purple-600" />
          </button>

          <button
            onClick={() => openQuickCommerceSearch('Blinkit', shoppingItems[0]?.title || 'vegetables')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-xs hover:scale-102 active:scale-95 cursor-pointer"
            title="Open Blinkit 8-Min Delivery"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Blinkit ({t.blinkitEta})</span>
            <ExternalLink className="w-3 h-3 text-amber-700" />
          </button>

          <button
            onClick={() => openQuickCommerceSearch('Instamart', shoppingItems[0]?.title || 'eggs')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold transition-all shadow-xs hover:scale-102 active:scale-95 cursor-pointer"
            title="Open Swiggy Instamart"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Instamart ({t.instamartEta})</span>
            <ExternalLink className="w-3 h-3 text-orange-600" />
          </button>
        </div>
      </div>

      {/* 2. Price & Delivery Comparison Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between interactive-card hover-glow-purple">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-purple-900">{t.zeptoDelivery}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-200 text-purple-800">
                {t.zeptoEta}
              </span>
            </div>
            <p className="text-[11px] text-purple-700 mt-0.5">Avg Basket: ₹145 • Free delivery above ₹199</p>
          </div>
          <ShoppingBag className="w-5 h-5 text-purple-600 shrink-0" />
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between interactive-card hover-glow-amber">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-amber-950">{t.blinkitDelivery}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900">
                {t.blinkitEta}
              </span>
            </div>
            <p className="text-[11px] text-amber-800 mt-0.5">Avg Basket: ₹140 • Fresh Mandi vegetables</p>
          </div>
          <ShoppingBag className="w-5 h-5 text-amber-600 shrink-0" />
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between interactive-card hover-glow-emerald">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-emerald-950">{t.localKiranaStore}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                WhatsApp
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5">Avg Basket: ₹135 • Zero delivery charges</p>
          </div>
          <Store className="w-5 h-5 text-emerald-600 shrink-0" />
        </div>
      </div>

      {/* 3. Filter Tabs (Mode Presets + Platforms) and Search */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Mode Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTabMode('all')}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTabMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.allFilter} ({QUICK_COMMERCE_CATALOG.length})
            </button>
            <button
              onClick={() => setActiveTabMode('elder')}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTabMode === 'elder'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              {t.elderFilter}
            </button>
            <button
              onClick={() => setActiveTabMode('hostel')}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTabMode === 'hostel'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-800'
              }`}
            >
              {t.hostelFilter}
            </button>
            <button
              onClick={() => setActiveTabMode('family')}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTabMode === 'family'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              {t.familyFilter}
            </button>
          </div>

          {/* Quick Platform Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
            {(['All', 'Zepto', 'Blinkit', 'Instamart'] as const).map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedPlatform === plat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Bar for Quick Commerce Products */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-24 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium transition-all"
          />
          {searchQuery && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => openQuickCommerceSearch('Zepto', searchQuery)}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
                title="Search on Zepto"
              >
                Zepto
              </button>
              <button
                onClick={() => openQuickCommerceSearch('Blinkit', searchQuery)}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 cursor-pointer"
                title="Search on Blinkit"
              >
                Blinkit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Recommended Products Carousel/Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredProducts.map((prod, idx) => {
          const isAdded = addedItemIds.includes(prod.id);

          return (
            <div
              key={prod.id}
              className={`p-3.5 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all flex flex-col justify-between gap-3 bg-white interactive-card ${
                idx % 3 === 0 ? 'hover-glow-purple' : idx % 3 === 1 ? 'hover-glow-amber' : 'hover-glow-emerald'
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                />

                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${prod.platformBg} ${prod.platformColor}`}
                    >
                      {prod.platform}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{prod.etaMinutes}m ETA</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mt-1">
                    {prod.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">{prod.weight}</span>
                    {prod.highlight && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {prod.highlight}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-black text-slate-900">₹{prod.price}</span>
                  {prod.originalPrice && (
                    <span className="text-[11px] text-slate-400 line-through">₹{prod.originalPrice}</span>
                  )}
                  {prod.originalPrice && (
                    <span className="text-[10px] font-bold text-emerald-600">
                      {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% off
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openQuickCommerceSearch(prod.platform, prod.name)}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
                    title={`View directly on ${prod.platform}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleAddProduct(prod)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-600 text-white animate-bounce-mini'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAdded ? t.addedBtn : t.addToCartBtn}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
