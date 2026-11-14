import React from 'react';
import {
  ShoppingBag,
  Camera,
  Users,
  Pill,
  Receipt,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Home,
  Plus,
} from 'lucide-react';
import { AppMode, Language } from '../types';

interface EmptyStateViewProps {
  currentMode: AppMode;
  language: Language;
  onOpenScan: () => void;
  onOpenDatabase: () => void;
  onAddShoppingClick: () => void;
  onReturnToDashboard: () => void;
  onLoadStarterPack?: () => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  currentMode,
  language,
  onOpenScan,
  onOpenDatabase,
  onAddShoppingClick,
  onReturnToDashboard,
  onLoadStarterPack,
}) => {
  const isHostel = currentMode === 'hostel';
  const isElder = currentMode === 'elder';

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* Hero Badge & Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Clean Slate • Household Ready</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Welcome to Your Fresh Household OS
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          {isElder
            ? 'Your personalized daily care space is pristine and ready. Set up daily medicine schedules, emergency contacts, and grocery deliveries.'
            : isHostel
            ? 'No shared chores or split expenses logged yet. Add your flatmates, connect UPI accounts, and let HomeMate split bills effortlessly.'
            : 'Your family inventory is empty. Start by snapping a quick picture of your fridge, adding family members, or typing your weekly Kirana list.'}
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onReturnToDashboard}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Go to Active Dashboard</span>
          </button>

          {onLoadStarterPack && (
            <button
              onClick={onLoadStarterPack}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Starter Pack (Milk, Bread, Chores)</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Launch Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AI Camera Scan */}
        <div
          onClick={onOpenScan}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
              Scan Fridge with AI
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Snap a photo with your device camera to automatically recognize groceries and restock low items.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
            <span>Open Camera</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Family & Accounts Database */}
        <div
          onClick={onOpenDatabase}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-700 transition-colors">
              Add Family & Accounts
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Register parents, children, or roommates along with emergency contacts and banking UPI accounts.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
            <span>Manage Database</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Add First Grocery Item */}
        <div
          onClick={onAddShoppingClick}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
              Add First Grocery Item
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Start building your household shopping list with 1-tap WhatsApp Kirana delivery formatting.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
            <span>Create List</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Daily Medicine or Splitwise */}
        <div
          onClick={onReturnToDashboard}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              {isElder ? <Pill className="w-6 h-6" /> : <Receipt className="w-6 h-6" />}
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-teal-700 transition-colors">
              {isElder ? 'Medication Reminders' : 'Split Household Bills'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isElder
                ? 'Large-print schedules, pill photo verification, and 1-tap local chemist prescription orders.'
                : 'Zero-fee UPI QR codes, equal bill splits, and automated hostel chore rotations.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Trust & Privacy Guarantee */}
      <div className="p-5 rounded-3xl bg-slate-100/80 border border-slate-200 text-slate-700 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>100% Private & Locally Resilient:</strong> All household data stays strictly encrypted in your local browser and your personal database backend.
          </span>
        </div>
        <button
          onClick={onReturnToDashboard}
          className="text-emerald-700 hover:text-emerald-800 font-extrabold whitespace-nowrap"
        >
          Back to Dashboard &rarr;
        </button>
      </div>
    </div>
  );
};
