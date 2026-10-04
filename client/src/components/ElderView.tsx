import React, { useState, useEffect } from 'react';
import { Medicine, Language, ElderTodo, ShoppingItem, Prescription, MedicineToBuy, UserAccount } from '../types';
import {
  Pill,
  CheckCircle2,
  Clock,
  Volume2,
  ShieldCheck,
  Heart,
  Plus,
  CheckSquare,
  AlertTriangle,
  Smile,
  Check,
  Bell,
  BellOff,
  BellRing,
  ShoppingCart,
  Trash2,
  Share2,
  Zap,
  Edit3,
  Minus,
} from 'lucide-react';
import { exportKiranaWhatsApp } from '../utils/api';
import {
  playChimeSound,
  speakElderReminder,
  getNotificationPermission,
  requestNotificationPermission,
  triggerElderRoutineNotification,
} from '../utils/notifications';
import { QuickCommerceHub } from './QuickCommerceHub';
import { EditGroceryModal } from './EditGroceryModal';
import { ElderMedsOrderHub } from './ElderMedsOrderHub';
import { MonthlyExpenseCalculator } from './MonthlyExpenseCalculator';
import { translations } from '../utils/translations';

interface ElderViewProps {
  medicines: Medicine[];
  onUpdateMedicine: (id: string, status: 'taken' | 'skipped') => void;
  language: Language;
  todos: ElderTodo[];
  onToggleTodo: (id: string) => void;
  onAddTodo: (task: string, category: ElderTodo['category'], time: string) => void;
  onToggleTodoNotification?: (id: string) => void;
  onRefillMedicine: (med: Medicine) => void;
  // Shared Grocery / Kirana List props
  shoppingItems: ShoppingItem[];
  onToggleShoppingItem: (id: string) => void;
  onDeleteShoppingItem: (id: string) => void;
  onAddShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void;
  onEditShoppingItem?: (id: string, updated: { title: string; quantity: string; category?: string }) => void;
  // Prescription & Meds Order Hub props
  prescriptions: Prescription[];
  medsToBuy: MedicineToBuy[];
  onAddPrescription: (rx: Omit<Prescription, 'id'>) => void;
  onAddMedicineToBuy: (med: Omit<MedicineToBuy, 'id'>) => void;
  onUpdateMedicineStatus: (id: string, status: 'needed' | 'ordered' | 'received') => void;
  onDeleteMedicineToBuy: (id: string) => void;
  currentUser: UserAccount | null;
  householdMembers?: string[];
}

export const ElderView: React.FC<ElderViewProps> = ({
  medicines,
  onUpdateMedicine,
  language,
  todos,
  onToggleTodo,
  onAddTodo,
  onToggleTodoNotification,
  onRefillMedicine,
  shoppingItems,
  onToggleShoppingItem,
  onDeleteShoppingItem,
  onAddShoppingItem,
  onEditShoppingItem,
  prescriptions,
  medsToBuy,
  onAddPrescription,
  onAddMedicineToBuy,
  onUpdateMedicineStatus,
  onDeleteMedicineToBuy,
  currentUser,
  householdMembers = [],
}) => {
  const [morningCheckedIn, setMorningCheckedIn] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoTime, setNewTodoTime] = useState('11:00 AM');
  const [refillRequested, setRefillRequested] = useState<string | null>(null);

  // Grocery List state for Elder
  const [newGroceryTitle, setNewGroceryTitle] = useState('');
  const [newGroceryQty, setNewGroceryQty] = useState('1 unit');
  const [showQuickCommerce, setShowQuickCommerce] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  // Notification System state
  const [notificationPermission, setNotificationPermission] = useState<string>(() =>
    getNotificationPermission()
  );
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);
  const [activeAlertToast, setActiveAlertToast] = useState<{
    title: string;
    time: string;
  } | null>(null);

  const t = translations[language];

  const handleStepQty = (item: ShoppingItem, delta: number) => {
    if (!onEditShoppingItem) return;
    const rawQty = (item.quantity || '1 unit').trim();
    const match = rawQty.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
    if (match) {
      const currentNum = parseFloat(match[1]) || 1;
      const unit = match[2] || 'unit';
      const newNum = Math.max(1, currentNum + delta);
      onEditShoppingItem(item.id, {
        title: item.title,
        quantity: `${newNum} ${unit}`.trim(),
        category: item.category,
      });
    }
  };

  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
    if (granted) {
      triggerElderRoutineNotification({
        taskTitle:
          language === 'hi'
            ? 'दैनिक दिनचर्या के लिए नोटिफिकेशन चालू हो गए हैं!'
            : language === 'bn'
            ? 'দৈনিক রুটিনের জন্য নোটিফিকেশন সক্রিয় করা হয়েছে!'
            : 'System notifications are now activated for your daily routines!',
        time: 'Active Now',
        language,
        soundEnabled: soundAlertsEnabled,
      });
    }
  };

  const handleTestAlarm = () => {
    const nextPending = todos.find((t) => !t.completed) || todos[0] || {
      task: 'Blood Pressure Check & Rest',
      time: '11:00 AM',
    };

    setActiveAlertToast({
      title: nextPending.task,
      time: nextPending.time,
    });

    triggerElderRoutineNotification({
      taskTitle: nextPending.task,
      time: nextPending.time,
      language,
      soundEnabled: soundAlertsEnabled,
    });

    setTimeout(() => {
      setActiveAlertToast(null);
    }, 6000);
  };

  const speakText = (text: string) => {
    speakElderReminder(text, language);
  };

  const handleMorningTap = () => {
    setMorningCheckedIn(true);
    playChimeSound();
    const msg =
      language === 'hi'
        ? 'बहुत अच्छा! परिवार को सूचित कर दिया गया है कि आप सुरक्षित और ठीक हैं।'
        : language === 'bn'
        ? 'খুব ভালো! পরিবারকে জানানো হয়েছে যে আপনি ভালো আছেন।'
        : 'Wonderful! Your family has been notified that you are up and doing well.';
    speakText(msg);
  };

  const handleMedicineAction = (id: string, status: 'taken' | 'skipped', medName: string) => {
    onUpdateMedicine(id, status);
    if (status === 'taken') playChimeSound();
    const feedback =
      status === 'taken'
        ? language === 'hi'
          ? `${medName} ले ली गई। बहुत अच्छा!`
          : language === 'bn'
          ? `${medName} নেওয়া হয়েছে। খুব ভালো!`
          : `${medName} marked as taken. Good job!`
        : language === 'hi'
        ? `${medName} छोड़ दी गई। आवश्यकता पड़ने पर डॉक्टर से संपर्क करें।`
        : language === 'bn'
        ? `${medName} বাদ দেওয়া হয়েছে। প্রয়োজনে ডাক্তারের পরামর্শ নিন।`
        : `${medName} skipped. Remember to consult your doctor if needed.`;
    speakText(feedback);
  };

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    onAddTodo(newTodoText.trim(), 'routine', newTodoTime || 'Flexible');
    setNewTodoText('');
  };

  const handleAddGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryTitle.trim()) return;

    onAddShoppingItem({
      title: newGroceryTitle.trim(),
      quantity: newGroceryQty.trim() || '1 unit',
      category: 'staples',
      addedBy: language === 'hi' ? 'बुजुर्ग वॉइस / त्वरित एंट्री' : language === 'bn' ? 'প্রবীণ ভয়েস এন্ট্রি' : 'Elder Voice / Quick Entry',
      status: 'pending',
      reason: 'manual',
    });

    speakText(
      language === 'hi'
        ? `${newGroceryTitle} किराना लिस्ट में जोड़ दिया`
        : language === 'bn'
        ? `${newGroceryTitle} তালিকায় যোগ করা হয়েছে`
        : `Added ${newGroceryTitle} to your Kirana list`
    );
    setNewGroceryTitle('');
    setNewGroceryQty('1 unit');
  };

  const handleAddQuickStaple = (title: string, qty: string, category: string) => {
    onAddShoppingItem({
      title,
      quantity: qty,
      category,
      addedBy: 'Elder Quick Essentials',
      status: 'pending',
      reason: 'routine',
    });
    playChimeSound();
    speakText(
      language === 'hi'
        ? `${title} लिस्ट में जोड़ दिया`
        : language === 'bn'
        ? `${title} তালিকায় যোগ হয়েছে`
        : `Added ${title} to your grocery list.`
    );
  };

  const handleSendKiranaWhatsApp = async () => {
    const pending = shoppingItems.filter((i) => i.status === 'pending');
    if (pending.length === 0) {
      speakText(
        language === 'hi'
          ? 'आपकी किराना सूची खाली है। पहले कुछ सामान जोड़ें!'
          : language === 'bn'
          ? 'আপনার মুদি তালিকা খালি আছে!'
          : 'Your grocery list is empty. Add some items first!'
      );
      return;
    }

    const exportData = pending.map((item) => ({
      title: item.title,
      quantity: item.quantity || '1 unit',
    }));

    const result = await exportKiranaWhatsApp(exportData, language);
    window.open(result.whatsappUrl, '_blank');
  };

  const readShoppingListAloud = () => {
    const pending = shoppingItems.filter((i) => i.status === 'pending');
    if (pending.length === 0) {
      speakText(
        language === 'hi'
          ? 'आपकी किराना सूची के सभी सामान पूरे हो चुके हैं!'
          : language === 'bn'
          ? 'আপনার তালিকার সব জিনিস কেনা হয়েছে!'
          : 'All items on your grocery list are completed!'
      );
      return;
    }
    const itemNames = pending.map((i) => `${i.title} ${i.quantity || ''}`).join(', ');
    speakText(
      language === 'hi'
        ? `आपकी किराना लिस्ट में ${pending.length} सामान हैं: ${itemNames}`
        : language === 'bn'
        ? `আপনার তালিকায় ${pending.length}টি জিনিস আছে: ${itemNames}`
        : `You have ${pending.length} items on your Kirana list: ${itemNames}`
    );
  };

  const completedTodosCount = todos.filter((t) => t.completed).length;
  const todoProgressPercent = todos.length > 0 ? Math.round((completedTodosCount / todos.length) * 100) : 0;
  const nextScheduledTodo = todos.find((t) => !t.completed);
  const pendingShoppingCount = shoppingItems.filter((i) => i.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Active Notification Banner */}
      {activeAlertToast && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500 text-amber-950 border-4 border-amber-600 shadow-2xl flex items-center justify-between gap-4 animate-bounce-mini">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-300 flex items-center justify-center shrink-0 animate-pulse">
              <BellRing className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-amber-400 px-2 py-0.5 rounded-full border border-amber-600">
                ⏰ {language === 'hi' ? 'अलार्म घंटी बजी' : language === 'bn' ? 'অ্যালার্ম ঘণ্টা' : 'Routine Alarm Active'} ({activeAlertToast.time})
              </span>
              <h4 className="text-lg sm:text-xl font-black mt-0.5">{activeAlertToast.title}</h4>
            </div>
          </div>
          <button
            onClick={() => setActiveAlertToast(null)}
            className="px-4 py-2 bg-amber-950 hover:bg-slate-900 text-amber-300 rounded-xl text-xs font-black cursor-pointer shrink-0"
          >
            {language === 'hi' ? 'हटाएं' : language === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* 1. High Contrast Warm Elder Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 border-4 border-amber-600/30 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg text-amber-950 interactive-card hover-glow-amber">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white text-amber-600 flex items-center justify-center shrink-0 shadow-md">
            <Heart className="w-9 h-9 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          <div>
            <span className="text-xs uppercase font-black tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
              {t.elderProfileBadge}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
              {t.elderGreeting}
            </h1>
            <p className="text-sm font-semibold text-amber-900 mt-0.5">
              {t.caregiverConnected}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            speakText(
              language === 'hi'
                ? 'नमस्ते! आप रोज़ाना चेक-इन कर सकते हैं, अपने अलार्म देख सकते हैं और किराना सूची चेक कर सकते हैं।'
                : language === 'bn'
                ? 'নমস্কার! আপনি প্রতিদিনের চেক-ইন, অ্যালার্ম এবং মুদি তালিকা দেখতে পারেন।'
                : 'Welcome to your home assistant. You can check in for the day, manage your routine alarms, view your medicine schedule, and check off items on your Kirana list.'
            )
          }
          className="self-end sm:self-center flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-amber-50 rounded-2xl border-2 border-amber-600 text-amber-950 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          title="Read screen aloud"
        >
          <Volume2 className="w-5 h-5 text-amber-700" />
          <span>{t.readAloud}</span>
        </button>
      </div>

      {/* 2. DAILY "ALL OK" CHECK-IN */}
      <section className="bg-white rounded-3xl border-3 border-emerald-400 p-6 sm:p-8 shadow-md interactive-card hover-glow-emerald">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{language === 'hi' ? 'दैनिक सुबह का नियम' : language === 'bn' ? 'দৈনিক সকালের রুটিন' : 'Daily Morning Routine'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {morningCheckedIn ? t.dailyCheckinDone : t.dailyCheckinTitle}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {morningCheckedIn ? t.dailyCheckinDoneDesc : t.dailyCheckinDesc}
            </p>
          </div>

          <div>
            {!morningCheckedIn ? (
              <button
                onClick={handleMorningTap}
                className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border-4 border-emerald-700 ring-4 ring-emerald-200 cursor-pointer"
              >
                <Smile className="w-8 h-8" />
                <span>{t.iAmDoingWellBtn}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 font-extrabold text-lg">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                <span>{t.familyNotified}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE DAILY TO-DO LIST & NOTIFICATION SYSTEM */}
      <section className="bg-white rounded-3xl border-3 border-amber-300 p-6 sm:p-8 shadow-md space-y-6 interactive-card hover-glow-amber">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
              <CheckSquare className="w-4 h-4 text-amber-700" />
              <span>{language === 'hi' ? 'दैनिक स्वास्थ्य और आदतें' : language === 'bn' ? 'দৈনিক স্বাস্থ্য ও রুটিন' : 'Daily Health & Wellness Routines'}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {t.elderTodosTitle}
            </h2>
            <p className="text-sm text-slate-600">
              {t.elderTodosSubtitle}
            </p>
          </div>

          {/* Progress Bar Badge */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2.5 text-center shrink-0">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              {t.todaysProgress}
            </div>
            <div className="text-xl font-black text-amber-950">
              {completedTodosCount} / {todos.length} ({todoProgressPercent}%)
            </div>
            <div className="w-36 bg-amber-200 h-2 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${todoProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* NOTIFICATION CONTROLS & SCHEDULE BAR */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded-md">
                <BellRing className="w-3.5 h-3.5 text-amber-800" />
                <span>{t.routineNotificationCenter}</span>
              </span>

              {notificationPermission === 'granted' ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  {t.systemPushActive}
                </span>
              ) : (
                <button
                  onClick={handleRequestPermission}
                  className="text-[11px] font-bold text-amber-900 bg-white hover:bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-400 cursor-pointer shadow-xs transition-colors"
                >
                  {t.enableBrowserPush}
                </button>
              )}
            </div>

            <p className="text-xs text-amber-900 font-medium">
              {nextScheduledTodo ? (
                <span>
                  ⏰ {language === 'hi' ? 'अगला अलार्म' : language === 'bn' ? 'পরবর্তী অ্যালার্ম' : 'Next scheduled reminder'}: <strong>{nextScheduledTodo.time}</strong> —{' '}
                  {nextScheduledTodo.task}
                </span>
              ) : (
                <span>{language === 'hi' ? 'आज के सभी कार्य पूरे हो चुके हैं!' : language === 'bn' ? 'আজকের সব কাজ সম্পন্ন হয়েছে!' : 'All routine tasks for today have been completed! Great job!'}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                soundAlertsEnabled
                  ? 'bg-amber-100 border-amber-300 text-amber-950'
                  : 'bg-white border-slate-300 text-slate-500'
              }`}
              title="Toggle Audio & Voice Reminders"
            >
              {soundAlertsEnabled ? <Bell className="w-3.5 h-3.5 text-amber-700" /> : <BellOff className="w-3.5 h-3.5" />}
              <span>{soundAlertsEnabled ? t.soundVoiceOn : t.soundVoiceMuted}</span>
            </button>

            {/* Test Alarm Button */}
            <button
              onClick={handleTestAlarm}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Test the chime alarm and voice reminder"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>{t.testAlarmBtn}</span>
            </button>
          </div>
        </div>

        {/* Add New Custom Routine */}
        <form onSubmit={handleCreateTodo} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={t.addRoutinePlaceholder}
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            className="flex-1 text-base px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-amber-500 focus:outline-none font-medium placeholder:text-slate-400"
          />
          <input
            type="text"
            placeholder="Time (e.g. 11:00 AM)"
            value={newTodoTime}
            onChange={(e) => setNewTodoTime(e.target.value)}
            className="w-full sm:w-36 text-base px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-amber-500 focus:outline-none font-medium text-center"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>{t.addRoutineBtn}</span>
          </button>
        </form>

        {/* Checklist Items */}
        <div className="space-y-3">
          {todos.map((todo) => {
            const hasNotification = todo.notificationEnabled !== false;

            return (
              <div
                key={todo.id}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                  todo.completed
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-amber-50/50 hover:bg-amber-50 border-amber-200 hover:border-amber-400 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleTodo(todo.id);
                      if (!todo.completed) playChimeSound();
                    }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      todo.completed
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border-2 border-amber-600 bg-white hover:bg-amber-100'
                    }`}
                  >
                    {todo.completed ? <Check className="w-5 h-5 stroke-[3]" /> : null}
                  </button>

                  <div className="flex-1">
                    <span
                      className={`text-lg sm:text-xl font-bold block ${
                        todo.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {todo.task}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        {todo.time}
                      </span>
                      <span className="text-xs font-medium text-slate-500 capitalize">
                        • {todo.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onToggleTodoNotification && (
                    <button
                      type="button"
                      onClick={() => onToggleTodoNotification(todo.id)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        hasNotification
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      title={hasNotification ? 'Alarm is ON for this task' : 'Alarm is muted'}
                    >
                      {hasNotification ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                  )}

                  {todo.completed && (
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                      {t.completed}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ELDER KIRANA & HOUSEHOLD ESSENTIALS LIST SECTION */}
      <section className="bg-white rounded-3xl border-3 border-emerald-400 p-6 sm:p-8 shadow-md space-y-6 interactive-card hover-glow-emerald">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
              <ShoppingCart className="w-4 h-4 text-emerald-700" />
              <span>{t.elderKiranaTitle}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {t.elderKiranaTitle}
            </h2>
            <p className="text-sm text-slate-600">
              {pendingShoppingCount} {t.elderKiranaSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSendKiranaWhatsApp}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{t.sendToKiranaWhatsApp}</span>
            </button>

            <button
              onClick={readShoppingListAloud}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs cursor-pointer transition-colors"
              title="Speak list aloud"
            >
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <span>{t.readListBtn}</span>
            </button>
          </div>
        </div>

        {/* 1-Tap Quick Staples for Elders */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
            {t.quickStaplesHeader}
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: language === 'hi' ? '🥛 अमूल दूध 500ml' : language === 'bn' ? '🥛 আমুল দুধ ৫০০ml' : '🥛 Amul Milk 500ml',
                title: 'Amul Taaza Milk 500ml',
                qty: '500 ml',
                cat: 'dairy',
              },
              {
                label: language === 'hi' ? '🍌 ताज़ा केला (6 पीस)' : language === 'bn' ? '🍌 পাকা কলা (৬টি)' : '🍌 Bananas (6 pcs)',
                title: 'Fresh Bananas (Kela)',
                qty: '6 pcs',
                cat: 'vegetables',
              },
              {
                label: language === 'hi' ? '🍪 मेरी गोल्ड बिस्कुट' : language === 'bn' ? '🍪 মেরি গোল্ড বিস্কুট' : '🍪 Marie Gold Biscuits',
                title: 'Britannia Marie Gold',
                qty: '300 g',
                cat: 'snacks',
              },
              {
                label: language === 'hi' ? '☕ ग्रीन टी बैग्स' : language === 'bn' ? '☕ গ্রিন টি ব্যাগ' : '☕ Green Tea Bags',
                title: 'Tetley Green Tea Bags',
                qty: '25 bags',
                cat: 'health',
              },
              {
                label: language === 'hi' ? '🍯 डाबर शहद' : language === 'bn' ? '🍯 ডাবর মধু' : '🍯 Dabur Honey',
                title: 'Dabur Honey Bottle',
                qty: '250 g',
                cat: 'staples',
              },
            ].map((st, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAddQuickStaple(st.title, st.qty, st.cat)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer"
              >
                + {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Custom Grocery Item */}
        <form onSubmit={handleAddGrocery} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={t.addKiranaPlaceholder}
            value={newGroceryTitle}
            onChange={(e) => setNewGroceryTitle(e.target.value)}
            className="flex-1 text-base px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium placeholder:text-slate-400"
          />
          <input
            type="text"
            placeholder="Qty (e.g. 1 kg)"
            value={newGroceryQty}
            onChange={(e) => setNewGroceryQty(e.target.value)}
            className="w-full sm:w-32 text-base px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none font-medium text-center"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>{t.addItemBtn}</span>
          </button>
        </form>

        {/* Grocery Items List */}
        <div className="space-y-2.5">
          {shoppingItems.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              {language === 'hi' ? 'किराना सूची खाली है। ऊपर से कोई भी सामान जोड़ें!' : language === 'bn' ? 'মুদি তালিকা খালি আছে। যেকোনো সামগ্রী যোগ করুন!' : 'No items on the Kirana list right now. Tap any quick button above or speak to add items!'}
            </p>
          ) : (
            shoppingItems.map((item) => {
              const isBought = item.status === 'bought';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 text-sm transition-all ${
                    isBought
                      ? 'bg-slate-50 border-slate-200 opacity-50 line-through'
                      : 'bg-emerald-50/40 hover:bg-emerald-50 border-emerald-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => {
                        onToggleShoppingItem(item.id);
                        if (!isBought) playChimeSound();
                      }}
                      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        isBought
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-emerald-600 bg-white hover:bg-emerald-100'
                      }`}
                    >
                      {isBought && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">{item.title}</span>
                        {item.quantity && (
                          <div className="flex items-center rounded-md border border-slate-200 bg-white overflow-hidden text-xs font-bold text-slate-700">
                            <button
                              type="button"
                              onClick={() => handleStepQty(item, -1)}
                              className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                              title="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 py-0.5 font-mono">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleStepQty(item, 1)}
                              className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                              title="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {language === 'hi' ? 'स्रोत:' : language === 'bn' ? 'উৎস:' : 'Source:'} <strong className="text-slate-600">{item.addedBy}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                      title={t.editItem}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteShoppingItem(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Toggle Quick Commerce Recommendations */}
        <div className="pt-2">
          <button
            onClick={() => setShowQuickCommerce(!showQuickCommerce)}
            className="w-full py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-purple-600" />
            <span>
              {showQuickCommerce ? t.hideQuickCommerce : t.showQuickCommerceElder}
            </span>
          </button>
        </div>

        {showQuickCommerce && (
          <div className="pt-2">
            <QuickCommerceHub
              shoppingItems={shoppingItems}
              onAddItem={onAddShoppingItem}
              currentMode="elder"
              language={language}
            />
          </div>
        )}
      </section>

      {/* 5. MEDICATION SCHEDULE & DOSAGE TRACKER */}
      <section className="bg-white rounded-3xl border-3 border-sky-300 p-6 sm:p-8 shadow-md space-y-6 interactive-card hover-glow-indigo">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-300">
              <Pill className="w-4 h-4 text-sky-600" />
              <span>{language === 'hi' ? 'दवाइयों का समय' : language === 'bn' ? 'ওষুধের সময়সূচী' : 'Medicine Schedule'}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">{t.medScheduleTitle}</h2>
            <p className="text-sm text-slate-600">{t.medScheduleSubtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {medicines.map((med) => {
            const isTaken = med.todayStatus === 'taken';
            const isSkipped = med.todayStatus === 'skipped';
            const isLowStock = med.currentStock <= med.refillThreshold;

            return (
              <div
                key={med.id}
                className={`p-5 rounded-3xl border-2 transition-all shadow-xs ${
                  isTaken
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : isSkipped
                    ? 'bg-slate-100 border-slate-300 opacity-60'
                    : 'bg-white border-slate-300 hover:border-sky-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${med.pillColor}`}
                    >
                      <Pill className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-slate-900">{med.name}</h3>
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                          {med.scheduleTimes.join(', ')}
                        </span>
                      </div>
                      <p className="text-base font-bold text-sky-900">{med.dosage}</p>
                      <p className="text-sm text-slate-600">{med.instructions}</p>

                      <div className="flex items-center gap-3 pt-1 text-xs font-semibold">
                        <span className={isLowStock ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                          {language === 'hi' ? 'बची हुई गोलियां:' : language === 'bn' ? 'বাকি ওষুধ:' : 'Stock left:'} {med.currentStock}
                        </span>
                        {isLowStock && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-300">
                            {t.lowStockAlert}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    {isLowStock && (
                      <button
                        onClick={() => {
                          onRefillMedicine(med);
                          setRefillRequested(med.id);
                          speakText(
                            language === 'hi'
                              ? `${med.name} रीफिल के लिए किराना लिस्ट में जोड़ दी गई`
                              : language === 'bn'
                              ? `${med.name} রিফিলের জন্য তালিকায় যোগ হয়েছে`
                              : `Added ${med.name} to the family grocery list for refill.`
                          );
                          setTimeout(() => setRefillRequested(null), 3000);
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold border border-rose-300 transition-colors"
                      >
                        {refillRequested === med.id ? t.refillAdded : t.orderRefillBtn}
                      </button>
                    )}

                    {!isTaken ? (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleMedicineAction(med.id, 'taken', med.name)}
                          className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                          <span>{t.takeDoseBtn}</span>
                        </button>
                        <button
                          onClick={() => handleMedicineAction(med.id, 'skipped', med.name)}
                          className="px-4 py-3 rounded-2xl border-2 border-slate-300 hover:bg-slate-100 text-slate-600 font-bold text-sm transition-colors cursor-pointer"
                        >
                          {t.skipDoseBtn}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm border border-emerald-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>{t.takenToday}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. PRESCRIPTION VAULT & MEDS ORDER REFILS HUB */}
      <ElderMedsOrderHub
        prescriptions={prescriptions}
        medsToBuy={medsToBuy}
        onAddPrescription={onAddPrescription}
        onAddMedicineToBuy={onAddMedicineToBuy}
        onUpdateMedicineStatus={onUpdateMedicineStatus}
        onDeleteMedicineToBuy={onDeleteMedicineToBuy}
        onSyncToKiranaList={(title, qty) =>
          onAddShoppingItem({
            title: `${title} (Chemist)`,
            quantity: qty,
            category: 'other',
            addedBy: 'Prescription Order Hub',
            status: 'pending',
            reason: 'manual',
          })
        }
        language={language}
      />

      {/* 7. MONTHLY EXPENSE & HEALTHCARE BUDGET CALCULATOR */}
      <MonthlyExpenseCalculator
        mode="elder"
        language={language}
        shoppingItems={shoppingItems}
        currentUser={currentUser}
        householdMembers={householdMembers}
      />

      {/* Edit Grocery Item Modal */}
      {editingItem && onEditShoppingItem && (
        <EditGroceryModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={onEditShoppingItem}
          language={language}
        />
      )}
    </div>
  );
};
