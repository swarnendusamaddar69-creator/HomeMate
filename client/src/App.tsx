import React, { useState, useEffect } from 'react';
import {
  AppMode,
  Language,
  ShoppingItem,
  PantryItem,
  Medicine,
  HostelChore,
  HostelExpense,
  MessMenuDay,
  DetectedFridgeItem,
  ElderTodo,
  UserAccount,
  Household,
  FamilyChore,
  Prescription,
  MedicineToBuy,
} from './types';
import {
  INITIAL_PANTRY,
  INITIAL_PANTRY_ELDER,
  INITIAL_PANTRY_HOSTEL,
  INITIAL_PANTRY_FAMILY,
  INITIAL_SHOPPING,
  INITIAL_SHOPPING_ELDER,
  INITIAL_SHOPPING_HOSTEL,
  INITIAL_SHOPPING_FAMILY,
  INITIAL_MEDICINES,
  INITIAL_ELDER_TODOS,
  INITIAL_HOSTEL_CHORES,
  INITIAL_HOSTEL_EXPENSES,
  INITIAL_MESS_MENU,
  INITIAL_FAMILY_CHORES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_MEDS_TO_BUY,
  DEFAULT_USERS,
  getStoredData,
  saveStoredData,
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  getAllHouseholds,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { VoiceCommandHud } from './components/VoiceCommandHud';
import { FridgeScanModal } from './components/FridgeScanModal';
import { ElderView } from './components/ElderView';
import { HostelView } from './components/HostelView';
import { FamilyView } from './components/FamilyView';
import { WeatherWidget } from './components/WeatherWidget';
import { WidgetSuggestionsModal } from './components/WidgetSuggestionsModal';
import { LoginOnboarding } from './components/LoginOnboarding';
import { BackgroundAura } from './components/BackgroundAura';
import { MobileBottomNav } from './components/MobileBottomNav';
import { translations } from './utils/translations';
import { Camera, Undo2, CheckCircle2, Sparkles } from 'lucide-react';
import { playChimeSound } from './utils/notifications';

export function App() {
  // 1. Language defaults to English as requested
  const [language, setLanguage] = useState<Language>(() =>
    getStoredData<Language>('language', 'en')
  );

  // User Authentication & Session state (Real-World: only active if user signed in)
  const [currentUser, setCurrentUserState] = useState<UserAccount | null>(() => {
    return getCurrentUser();
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!getCurrentUser();
  });

  const [currentMode, setCurrentMode] = useState<AppMode>(() => {
    const saved = getCurrentUser();
    return saved?.mode || getStoredData<AppMode>('mode', 'family');
  });

  // Household data
  const households = getAllHouseholds();
  const activeHousehold = households.find((h) => h.id === currentUser?.householdId) || null;

  // Helper to determine the active household identifier
  const getHouseholdKey = (user: UserAccount | null, mode: AppMode): string => {
    if (user?.householdId) return user.householdId;
    if (mode === 'elder') return 'elder_home';
    if (mode === 'hostel') return 'flat_b302';
    return 'sharma_family';
  };

  const activeHouseholdKey = getHouseholdKey(currentUser, currentMode);

  // Strictly isolated per-household grocery & kirana lists (raw user data)
  const [householdShoppingMap, setHouseholdShoppingMap] = useState<Record<string, ShoppingItem[]>>(() => {
    return {};
  });

  // Strictly isolated per-household fridge & pantry lists (raw user data)
  const [householdPantryMap, setHouseholdPantryMap] = useState<Record<string, PantryItem[]>>(() => {
    return {};
  });

  // Active household's shopping items (100% isolated per household)
  const shoppingItems =
    householdShoppingMap[activeHouseholdKey] ||
    getStoredData<ShoppingItem[]>(`shopping_v3_${activeHouseholdKey}`, []);

  // Active household's pantry items (100% isolated per household)
  const pantryItems =
    householdPantryMap[activeHouseholdKey] ||
    getStoredData<PantryItem[]>(`pantry_v3_${activeHouseholdKey}`, []);

  // Domain data (Pure user-driven raw data)
  const [medicines, setMedicines] = useState<Medicine[]>(() =>
    getStoredData<Medicine[]>('medicines_v3', [])
  );

  const [elderTodos, setElderTodos] = useState<ElderTodo[]>(() =>
    getStoredData<ElderTodo[]>('elder_todos_v3', [])
  );

  const [hostelChores, setHostelChores] = useState<HostelChore[]>(() =>
    getStoredData<HostelChore[]>('chores_v3', [])
  );

  const [hostelExpenses, setHostelExpenses] = useState<HostelExpense[]>(() =>
    getStoredData<HostelExpense[]>('expenses_v3', [])
  );

  const [messMenu, setMessMenu] = useState<MessMenuDay[]>(() =>
    getStoredData<MessMenuDay[]>('mess_v3', [])
  );

  const [familyChores, setFamilyChores] = useState<FamilyChore[]>(() =>
    getStoredData<FamilyChore[]>('family_chores_v3', [])
  );

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() =>
    getStoredData<Prescription[]>('prescriptions_v3', [])
  );

  const [medsToBuy, setMedsToBuy] = useState<MedicineToBuy[]>(() =>
    getStoredData<MedicineToBuy[]>('meds_to_buy_v3', [])
  );

  // Modals & Widgets toggles
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [weatherWidgetEnabled, setWeatherWidgetEnabled] = useState(true);
  const [voiceHudEnabled, setVoiceHudEnabled] = useState(true);
  const [undoToast, setUndoToast] = useState<{ message: string; onUndo: () => void } | null>(null);

  const t = translations[language];

  // Auth Handlers with Household State Synchronization
  const handleLogin = (user: UserAccount) => {
    setCurrentUserState(user);
    persistCurrentUser(user);
    setCurrentMode(user.mode);
    setIsLoggedIn(true);
    saveStoredData('is_logged_in', true);

    const hKey = getHouseholdKey(user, user.mode);
    setHouseholdShoppingMap((prev) => {
      if (prev[hKey]) return prev;
      return {
        ...prev,
        [hKey]: getStoredData<ShoppingItem[]>(`shopping_v3_${hKey}`, []),
      };
    });
    setHouseholdPantryMap((prev) => {
      if (prev[hKey]) return prev;
      return {
        ...prev,
        [hKey]: getStoredData<PantryItem[]>(`pantry_v3_${hKey}`, []),
      };
    });
  };

  const handleLogout = () => {
    setCurrentUserState(null);
    persistCurrentUser(null);
    setIsLoggedIn(false);
    saveStoredData('is_logged_in', false);
  };

  const handleSelectMode = (newMode: AppMode) => {
    setCurrentMode(newMode);
    saveStoredData('mode', newMode);
    const matchedUser = DEFAULT_USERS.find((u) => u.mode === newMode);
    if (matchedUser) {
      setCurrentUserState(matchedUser);
      persistCurrentUser(matchedUser);
    }
  };

  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'hi' : language === 'hi' ? 'bn' : 'en';
    setLanguage(nextLang);
    saveStoredData('language', nextLang);
  };

  // Sync general settings & mode-specific state to local storage
  useEffect(() => {
    saveStoredData('language', language);
  }, [language]);

  useEffect(() => {
    saveStoredData('mode', currentMode);
  }, [currentMode]);

  useEffect(() => {
    saveStoredData('medicines_v3', medicines);
  }, [medicines]);

  useEffect(() => {
    saveStoredData('elder_todos_v3', elderTodos);
  }, [elderTodos]);

  useEffect(() => {
    saveStoredData('chores_v3', hostelChores);
  }, [hostelChores]);

  useEffect(() => {
    saveStoredData('expenses_v3', hostelExpenses);
  }, [hostelExpenses]);

  useEffect(() => {
    saveStoredData('mess_v3', messMenu);
  }, [messMenu]);

  useEffect(() => {
    saveStoredData('family_chores_v3', familyChores);
  }, [familyChores]);

  useEffect(() => {
    saveStoredData('prescriptions_v3', prescriptions);
  }, [prescriptions]);

  useEffect(() => {
    saveStoredData('meds_to_buy_v3', medsToBuy);
  }, [medsToBuy]);

  // Setters that persist strictly to the active household's isolated storage
  const setShoppingForCurrentHousehold = (
    updater: (prev: ShoppingItem[]) => ShoppingItem[]
  ) => {
    setHouseholdShoppingMap((prevMap) => {
      const currentList = prevMap[activeHouseholdKey] || [];
      const updated = updater(currentList);
      saveStoredData(`shopping_v3_${activeHouseholdKey}`, updated);
      return {
        ...prevMap,
        [activeHouseholdKey]: updated,
      };
    });
  };

  const setPantryForCurrentHousehold = (
    updater: (prev: PantryItem[]) => PantryItem[]
  ) => {
    setHouseholdPantryMap((prevMap) => {
      const currentList = prevMap[activeHouseholdKey] || [];
      const updated = updater(currentList);
      saveStoredData(`pantry_v3_${activeHouseholdKey}`, updated);
      return {
        ...prevMap,
        [activeHouseholdKey]: updated,
      };
    });
  };

  // Shopping handlers using the active household's isolated list
  const handleAddShoppingItem = (item: Omit<ShoppingItem, 'id'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setShoppingForCurrentHousehold((prev) => [newItem, ...prev]);

    triggerUndoableAction(`Added "${newItem.title}" to list`, () => {
      setShoppingForCurrentHousehold((prev) => prev.filter((i) => i.id !== newItem.id));
    });
  };

  const handleAddMultipleShopping = (items: Omit<ShoppingItem, 'id'>[]) => {
    const newItems: ShoppingItem[] = items.map((item, idx) => ({
      ...item,
      id: `s-scan-${Date.now()}-${idx}`,
    }));
    setShoppingForCurrentHousehold((prev) => [...newItems, ...prev]);

    triggerUndoableAction(`Added ${newItems.length} items from fridge scan`, () => {
      const idsToRemove = new Set(newItems.map((i) => i.id));
      setShoppingForCurrentHousehold((prev) => prev.filter((i) => !idsToRemove.has(i.id)));
    });
  };

  const handleToggleShoppingItem = (id: string) => {
    setShoppingForCurrentHousehold((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'pending' ? 'bought' : 'pending' }
          : item
      )
    );
  };

  const handleDeleteShoppingItem = (id: string) => {
    const deleted = shoppingItems.find((i) => i.id === id);
    if (!deleted) return;

    setShoppingForCurrentHousehold((prev) => prev.filter((i) => i.id !== id));

    triggerUndoableAction(`Removed "${deleted.title}" from list`, () => {
      setShoppingForCurrentHousehold((prev) => [deleted, ...prev]);
    });
  };

  // Editable Grocery Items Handler
  const handleEditShoppingItem = (
    id: string,
    updated: { title: string; quantity: string; category?: string }
  ) => {
    setShoppingForCurrentHousehold((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              title: updated.title,
              quantity: updated.quantity,
              category: updated.category || item.category,
            }
          : item
      )
    );
  };

  // Medicine handlers
  const handleUpdateMedicine = (id: string, status: 'taken' | 'skipped') => {
    const med = medicines.find((m) => m.id === id);
    if (!med) return;

    setMedicines((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              todayStatus: status,
              currentStock: status === 'taken' ? Math.max(0, m.currentStock - 1) : m.currentStock,
            }
          : m
      )
    );
  };

  const handleRefillMedicine = (med: Medicine) => {
    handleAddShoppingItem({
      title: `${med.name} (Refill)`,
      localTitle: med.name,
      quantity: '1 Strip (10 tabs)',
      category: 'other',
      addedBy: 'Med Refill Alert',
      status: 'pending',
      reason: 'manual',
    });
  };

  // Elder Todo Handlers
  const handleToggleElderTodo = (id: string) => {
    setElderTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleAddElderTodo = (task: string, category: ElderTodo['category'], time: string) => {
    const newTodo: ElderTodo = {
      id: `et-${Date.now()}`,
      task,
      category,
      time,
      completed: false,
      notificationEnabled: true,
    };
    setElderTodos((prev) => [...prev, newTodo]);
  };

  const handleToggleElderTodoNotification = (id: string) => {
    setElderTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, notificationEnabled: !todo.notificationEnabled } : todo
      )
    );
  };

  // Prescription & Meds to Buy Handlers
  const handleAddPrescription = (rx: Omit<Prescription, 'id'>) => {
    const newRx: Prescription = {
      ...rx,
      id: `rx-${Date.now()}`,
    };
    setPrescriptions((prev) => [newRx, ...prev]);
  };

  const handleAddMedicineToBuy = (med: Omit<MedicineToBuy, 'id'>) => {
    const newMed: MedicineToBuy = {
      ...med,
      id: `mtb-${Date.now()}`,
    };
    setMedsToBuy((prev) => [newMed, ...prev]);
  };

  const handleUpdateMedicineStatus = (
    id: string,
    status: 'needed' | 'ordered' | 'received'
  ) => {
    setMedsToBuy((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  const handleDeleteMedicineToBuy = (id: string) => {
    setMedsToBuy((prev) => prev.filter((m) => m.id !== id));
  };

  // Hostel Handlers
  const handleCompleteChore = (id: string) => {
    setHostelChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'completed' } : c))
    );
    playChimeSound();
  };

  const handleRotateChore = (id: string) => {
    setHostelChores((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const roommates = ['Rohan', 'Vikram', 'Ankit'];
          const currentIndex = roommates.indexOf(c.assignee);
          const nextIndex = (currentIndex + 1) % roommates.length;
          return {
            ...c,
            assignee: roommates[nextIndex],
            skipCount: (c.skipCount || 0) + 1,
          };
        }
        return c;
      })
    );
  };

  const handleAddHostelChore = (chore: Omit<HostelChore, 'id'>) => {
    const newChore: HostelChore = {
      ...chore,
      id: `c-${Date.now()}`,
    };
    setHostelChores((prev) => [...prev, newChore]);
  };

  const handleRefreshHostelChores = () => {
    setHostelChores((prev) =>
      prev.map((c) => ({
        ...c,
        status: 'pending',
      }))
    );
  };

  const handleSettleExpense = (id: string) => {
    setHostelExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, settled: true } : e))
    );
    playChimeSound();
  };

  const handleAddExpense = (expense: Omit<HostelExpense, 'id' | 'date'>) => {
    const newExp: HostelExpense = {
      ...expense,
      id: `e-${Date.now()}`,
      date: 'Today',
    };
    setHostelExpenses((prev) => [newExp, ...prev]);
  };

  const handleToggleSkipMess = (day: string) => {
    setMessMenu((prev) =>
      prev.map((m) =>
        m.day === day ? { ...m, skippedDinnerToday: !m.skippedDinnerToday } : m
      )
    );
  };

  // Family Chores Handlers
  const handleToggleFamilyChore = (id: string) => {
    setFamilyChores((prev) =>
      prev.map((chore) => {
        if (chore.id === id) {
          const nowDone = !chore.completed;
          if (nowDone) playChimeSound();
          return {
            ...chore,
            completed: nowDone,
            completedBy: nowDone ? currentUser?.displayName || 'Family Member' : undefined,
            completedAt: nowDone
              ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined,
          };
        }
        return chore;
      })
    );
  };

  const handleAddFamilyChore = (chore: Omit<FamilyChore, 'id'>) => {
    const newChore: FamilyChore = {
      ...chore,
      id: `fc-${Date.now()}`,
    };
    setFamilyChores((prev) => [newChore, ...prev]);
  };

  const handleDeleteFamilyChore = (id: string) => {
    setFamilyChores((prev) => prev.filter((c) => c.id !== id));
  };

  const handleRefreshFamilyChores = () => {
    setFamilyChores((prev) =>
      prev.map((c) => ({
        ...c,
        completed: false,
        completedBy: undefined,
        completedAt: undefined,
      }))
    );
  };

  // Fridge scan handler
  const handleApplyInventory = (detectedItems: DetectedFridgeItem[]) => {
    const updated = [...pantryItems];
    detectedItems.forEach((d) => {
      const idx = updated.findIndex(
        (p) => p.name.toLowerCase().trim() === d.name.toLowerCase().trim()
      );
      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          level: d.level,
          confidence: d.confidence,
          lastUpdated: 'Just now (AI scan)',
        };
      } else {
        updated.push({
          id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: d.name,
          localName: d.localName,
          category: d.category,
          level: d.level,
          locationHint: d.shelfLocation,
          confidence: d.confidence,
          lastUpdated: 'Just now (AI scan)',
        });
      }
    });

    setPantryForCurrentHousehold(() => updated);
  };

  const triggerUndoableAction = (message: string, onUndo: () => void) => {
    setUndoToast({ message, onUndo });
    setTimeout(() => {
      setUndoToast((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  // If user is not logged in or has no active session, show the Dedicated Login Onboarding screen
  if (!isLoggedIn || !currentUser) {
    return (
      <LoginOnboarding
        onLogin={handleLogin}
        language={language}
        onLanguageChange={setLanguage}
      />
    );
  }

  return (
    <div
      className={`min-h-screen font-sans transition-all duration-300 selection:bg-emerald-500 selection:text-white relative overflow-x-hidden ${
        currentMode === 'elder'
          ? 'bg-theme-elder text-slate-800'
          : currentMode === 'hostel'
          ? 'bg-theme-hostel text-slate-100'
          : 'bg-theme-family text-slate-800'
      }`}
    >
      {/* Dynamic Animated Ambient Background Aura Canvas */}
      <BackgroundAura mode={currentMode} />

      {/* 1. Dedicated Navbar */}
      <Navbar
        currentMode={currentMode}
        currentUser={currentUser}
        household={activeHousehold}
        onLogout={handleLogout}
        language={language}
        onLanguageChange={setLanguage}
        onOpenWidgetSuggestions={() => setIsWidgetModalOpen(true)}
      />

      {/* 2. Main Content Container (with safe-area and mobile dock bottom clearance) */}
      <main className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-12 safe-area-bottom">
        {/* Quick Hero Banner with Real Camera Fridge Scan Button */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl border shadow-xs interactive-card ${
            currentMode === 'hostel'
              ? 'bg-slate-900/90 border-indigo-800/80 text-white hover-glow-indigo'
              : currentMode === 'elder'
              ? 'bg-gradient-to-r from-amber-50/95 via-orange-50/90 to-amber-100/80 border-amber-300/80 text-slate-900 hover-glow-amber'
              : 'bg-gradient-to-r from-white via-slate-50 to-emerald-50/70 border-slate-200/90 text-slate-900 hover-glow-emerald'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-md ${
                currentMode === 'hostel'
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                  : currentMode === 'elder'
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
              }`}
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-base font-extrabold ${
                    currentMode === 'hostel' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {currentMode === 'elder'
                    ? t.cameraBannerTitleElder
                    : currentMode === 'hostel'
                    ? t.cameraBannerTitleHostel
                    : t.cameraBannerTitleFamily}
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>{t.deviceCameraLive}</span>
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  currentMode === 'hostel' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {t.cameraBannerSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsScanModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-md transition-all transform hover:scale-102 active:scale-95 ring-3 ring-emerald-300/60 cursor-pointer"
          >
            <Camera className="w-5 h-5 text-white" />
            <span>{t.openFridgeCamera}</span>
          </button>
        </div>

        {/* Live Household Weather & Climate Comfort Widget */}
        {weatherWidgetEnabled && <WeatherWidget />}

        {/* Real-time Voice Command Assistant HUD */}
        {voiceHudEnabled && (
          <VoiceCommandHud
            language={language}
            onAddItem={handleAddShoppingItem}
            isElderMode={currentMode === 'elder'}
          />
        )}

        {/* Standalone View based on Active Mode */}
        {currentMode === 'elder' && (
          <ElderView
            medicines={medicines}
            onUpdateMedicine={handleUpdateMedicine}
            language={language}
            todos={elderTodos}
            onToggleTodo={handleToggleElderTodo}
            onAddTodo={handleAddElderTodo}
            onToggleTodoNotification={handleToggleElderTodoNotification}
            onRefillMedicine={handleRefillMedicine}
            shoppingItems={shoppingItems}
            onToggleShoppingItem={handleToggleShoppingItem}
            onDeleteShoppingItem={handleDeleteShoppingItem}
            onAddShoppingItem={handleAddShoppingItem}
            onEditShoppingItem={handleEditShoppingItem}
            prescriptions={prescriptions}
            medsToBuy={medsToBuy}
            onAddPrescription={handleAddPrescription}
            onAddMedicineToBuy={handleAddMedicineToBuy}
            onUpdateMedicineStatus={handleUpdateMedicineStatus}
            onDeleteMedicineToBuy={handleDeleteMedicineToBuy}
            currentUser={currentUser}
          />
        )}

        {currentMode === 'hostel' && (
          <HostelView
            chores={hostelChores}
            onCompleteChore={handleCompleteChore}
            onRotateChore={handleRotateChore}
            onAddChore={handleAddHostelChore}
            onRefreshChores={handleRefreshHostelChores}
            expenses={hostelExpenses}
            onSettleExpense={handleSettleExpense}
            onAddExpense={handleAddExpense}
            messMenu={messMenu}
            onToggleSkipMess={handleToggleSkipMess}
            pantryItems={pantryItems}
            language={language}
            currentUser={currentUser}
            shoppingItems={shoppingItems}
            onToggleShoppingItem={handleToggleShoppingItem}
            onDeleteShoppingItem={handleDeleteShoppingItem}
            onAddShoppingItem={handleAddShoppingItem}
            onEditShoppingItem={handleEditShoppingItem}
          />
        )}

        {currentMode === 'family' && (
          <FamilyView
            shoppingItems={shoppingItems}
            onToggleItem={handleToggleShoppingItem}
            onDeleteItem={handleDeleteShoppingItem}
            onAddItem={handleAddShoppingItem}
            onEditShoppingItem={handleEditShoppingItem}
            pantryItems={pantryItems}
            language={language}
            currentUser={currentUser}
            familyChores={familyChores}
            onToggleFamilyChore={handleToggleFamilyChore}
            onAddFamilyChore={handleAddFamilyChore}
            onDeleteFamilyChore={handleDeleteFamilyChore}
            onRefreshFamilyChores={handleRefreshFamilyChores}
          />
        )}
      </main>

      {/* AI Fridge Scan Modal (Supports Real Device Camera) */}
      <FridgeScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onApplyInventory={handleApplyInventory}
        onAddToShopping={handleAddMultipleShopping}
      />

      {/* Widget Suggestions & Architecture Educational Modal */}
      <WidgetSuggestionsModal
        isOpen={isWidgetModalOpen}
        onClose={() => setIsWidgetModalOpen(false)}
        weatherWidgetEnabled={weatherWidgetEnabled}
        onToggleWeatherWidget={() => setWeatherWidgetEnabled(!weatherWidgetEnabled)}
        voiceHudEnabled={voiceHudEnabled}
        onToggleVoiceHud={() => setVoiceHudEnabled(!voiceHudEnabled)}
      />

      {/* Reversible Action Toast (Undo) */}
      {undoToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{undoToast.message}</span>
          <button
            onClick={() => {
              undoToast.onUndo();
              setUndoToast(null);
            }}
            className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 ml-2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>{t.undo}</span>
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation Dock (1-tap interface switcher & AI camera) */}
      <MobileBottomNav
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        onOpenScan={() => setIsScanModalOpen(true)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />
    </div>
  );
}

export default App;
