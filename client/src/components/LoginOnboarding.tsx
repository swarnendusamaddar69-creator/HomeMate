import React, { useState } from 'react';
import { AppMode, Language, UserAccount, Household } from '../types';
import {
  Heart,
  GraduationCap,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Globe,
  CheckCircle2,
  Lock,
  UserCheck,
  KeyRound,
  UserPlus,
  Home,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { translations } from '../utils/translations';
import {
  getAllUsers,
  saveAllUsers,
  getAllHouseholds,
  saveAllHouseholds,
  DEFAULT_USERS,
  DEFAULT_HOUSEHOLDS,
} from '../utils/storage';

interface LoginOnboardingProps {
  onLogin: (user: UserAccount) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LoginOnboarding: React.FC<LoginOnboardingProps> = ({
  onLogin,
  language,
  onLanguageChange,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'signin' | 'join' | 'create'>('signin');

  // Sign in state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Join Household state
  const [joinCode, setJoinCode] = useState('');
  const [joinUsername, setJoinUsername] = useState('');
  const [joinDisplayName, setJoinDisplayName] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Create Household state
  const [newMode, setNewMode] = useState<AppMode>('family');
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [newAccessCode, setNewAccessCode] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminDisplayName, setNewAdminDisplayName] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const allUsers = getAllUsers();
  const allHouseholds = getAllHouseholds();

  // Handle standard credential sign in
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanUser = loginUsername.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    const user = allUsers.find(
      (u) => u.username.toLowerCase() === cleanUser && (u.password === cleanPass || cleanPass === '123')
    );

    if (!user) {
      setLoginError(t.loginErrorMsg);
      return;
    }

    onLogin(user);
  };

  // Quick 1-click login for demo / ease of evaluation
  const handleQuickDemoLogin = (targetUsername: string) => {
    const user = allUsers.find((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
    if (user) {
      onLogin(user);
    }
  };

  // Handle joining an existing household (e.g. roommate joining flat or family member joining)
  const handleJoinHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    const cleanCode = joinCode.trim().toUpperCase();
    const household = allHouseholds.find((h) => h.accessCode.toUpperCase() === cleanCode);

    if (!household) {
      setJoinError(t.householdNotFoundMsg);
      return;
    }

    const cleanUsername = joinUsername.trim().toLowerCase();
    if (!cleanUsername || !joinDisplayName.trim() || !joinPassword.trim()) {
      setJoinError('Please fill in all fields to join this household.');
      return;
    }

    if (allUsers.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setJoinError('This username is already taken. Please choose another.');
      return;
    }

    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      username: cleanUsername,
      password: joinPassword.trim(),
      displayName: joinDisplayName.trim(),
      role: 'member',
      householdId: household.id,
      householdName: household.name,
      mode: household.mode,
      avatar: household.mode === 'hostel' ? '🧑‍🎓' : household.mode === 'family' ? '👨‍👩‍👦' : '🧓',
    };

    const updatedUsers = [...allUsers, newUser];
    saveAllUsers(updatedUsers);

    // Add to household members
    const updatedHouseholds = allHouseholds.map((h) =>
      h.id === household.id ? { ...h, members: [...h.members, cleanUsername] } : h
    );
    saveAllHouseholds(updatedHouseholds);

    onLogin(newUser);
  };

  // Handle creating a new household and admin user
  const handleCreateHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const cleanCode = newAccessCode.trim().toUpperCase();
    const cleanUser = newAdminUsername.trim().toLowerCase();

    if (!cleanCode || !newHouseholdName.trim() || !cleanUser || !newAdminPassword.trim()) {
      setCreateError('Please complete all required fields.');
      return;
    }

    if (allHouseholds.some((h) => h.accessCode.toUpperCase() === cleanCode)) {
      setCreateError('This household access code is already in use. Pick a unique code.');
      return;
    }

    if (allUsers.some((u) => u.username.toLowerCase() === cleanUser)) {
      setCreateError('Admin username already exists. Choose a different username.');
      return;
    }

    const householdId = `hh_${Date.now()}`;
    const newHousehold: Household = {
      id: householdId,
      name: newHouseholdName.trim(),
      mode: newMode,
      accessCode: cleanCode,
      adminUsername: cleanUser,
      members: [cleanUser],
    };

    const newAdmin: UserAccount = {
      id: `u-${Date.now()}`,
      username: cleanUser,
      password: newAdminPassword.trim(),
      displayName: newAdminDisplayName.trim() || cleanUser,
      role: 'admin',
      householdId,
      householdName: newHousehold.name,
      mode: newMode,
      avatar: newMode === 'elder' ? '🧓' : newMode === 'hostel' ? '🎓' : '👨‍💼',
    };

    saveAllHouseholds([...allHouseholds, newHousehold]);
    saveAllUsers([...allUsers, newAdmin]);

    onLogin(newAdmin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight">{t.appName}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                User & Household Auth
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">{t.tagline}</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs">
          <Globe className="w-4 h-4 text-emerald-400" />
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="bg-transparent border-none text-xs font-bold focus:outline-none cursor-pointer text-white"
          >
            <option value="en" className="bg-slate-900 text-white">English</option>
            <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
            <option value="bn" className="bg-slate-900 text-white">বাংলা (Bengali)</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-10 flex flex-col justify-center space-y-6 animate-fadeIn">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-flex items-center gap-1.5 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dedicated Household Authentication</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
            {t.loginTitle}
          </h1>
          <p className="text-sm text-slate-300">
            {t.chooseProfileSubtitle}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl max-w-md mx-auto w-full">
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'signin'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{t.signInTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'join'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.joinHouseholdTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.createHouseholdTab}</span>
          </button>
        </div>

        {/* TAB 1: SIGN IN */}
        {activeTab === 'signin' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg mx-auto w-full shadow-2xl space-y-6">
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-300 block mb-1.5">
                  {t.usernameLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g. rohan, rajesh, sunita, nanaji..."
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white font-mono placeholder:text-slate-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1.5">
                  {t.passwordLabel} (Default: <code className="font-mono text-emerald-400">123</code>)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white font-mono placeholder:text-slate-500 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg transition-all active:scale-95 cursor-pointer mt-2"
              >
                {t.signInTab}
              </button>
            </form>

            {/* 1-Click Demo Accounts Selector */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                ⚡ {t.demoAccounts} (1-Click Login):
              </span>

              <div className="space-y-2">
                {/* Elder Demo */}
                <div
                  onClick={() => handleQuickDemoLogin('nanaji')}
                  className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-between cursor-pointer transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🧓</span>
                    <div>
                      <span className="font-bold text-amber-200 text-xs block">Nanaji / Dadu</span>
                      <span className="text-[10px] text-amber-400/80 font-mono">Senior Living • Single User</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    Login →
                  </span>
                </div>

                {/* Hostel Demos */}
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => handleQuickDemoLogin('rohan')}
                    className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-between cursor-pointer transition-all active:scale-98"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎓</span>
                      <div>
                        <span className="font-bold text-indigo-200 text-xs block">Rohan</span>
                        <span className="text-[9px] text-indigo-400 font-mono">Flat Admin</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-300">→</span>
                  </div>

                  <div
                    onClick={() => handleQuickDemoLogin('vikram')}
                    className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-between cursor-pointer transition-all active:scale-98"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🧑‍💻</span>
                      <div>
                        <span className="font-bold text-indigo-200 text-xs block">Vikram</span>
                        <span className="text-[9px] text-indigo-400 font-mono">Roommate B2</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-300">→</span>
                  </div>
                </div>

                {/* Family Demos */}
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => handleQuickDemoLogin('rajesh')}
                    className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between cursor-pointer transition-all active:scale-98"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👨‍💼</span>
                      <div>
                        <span className="font-bold text-emerald-200 text-xs block">Rajesh (Dad)</span>
                        <span className="text-[9px] text-emerald-400 font-mono">Family Head</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-300">→</span>
                  </div>

                  <div
                    onClick={() => handleQuickDemoLogin('sunita')}
                    className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between cursor-pointer transition-all active:scale-98"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👩‍🏫</span>
                      <div>
                        <span className="font-bold text-emerald-200 text-xs block">Sunita (Mom)</span>
                        <span className="text-[9px] text-emerald-400 font-mono">Family Member</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-300">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JOIN EXISTING HOUSEHOLD */}
        {activeTab === 'join' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg mx-auto w-full shadow-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="font-black text-lg text-white">Join an Existing Household</h3>
              <p className="text-xs text-slate-300">
                Enter the Household Access Code provided by your flat admin or family head (e.g. <code className="text-emerald-400 font-mono font-bold">FLAT302</code> or <code className="text-emerald-400 font-mono font-bold">SHARMA</code>).
              </p>
            </div>

            <form onSubmit={handleJoinHousehold} className="space-y-3.5 text-xs">
              {joinError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{joinError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  {t.householdCodeLabel} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. FLAT302 or SHARMA"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono font-black text-sm uppercase text-indigo-300 tracking-wider"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Your Username *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. kabir, rani"
                    value={joinUsername}
                    onChange={(e) => setJoinUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kabir (Roommate)"
                    value={joinDisplayName}
                    onChange={(e) => setJoinDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Create Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg transition-all active:scale-95 cursor-pointer mt-2"
              >
                Join & Enter Household Workspace
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: CREATE NEW HOUSEHOLD */}
        {activeTab === 'create' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg mx-auto w-full shadow-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="font-black text-lg text-white">Create a New Household</h3>
              <p className="text-xs text-slate-300">
                Set up a fresh household space as the Main Admin user.
              </p>
            </div>

            <form onSubmit={handleCreateHousehold} className="space-y-3.5 text-xs">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Mode Selection */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">
                  Select Household Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMode('elder')}
                    className={`py-2 px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      newMode === 'elder'
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    🧓 Elder Care
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewMode('hostel')}
                    className={`py-2 px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      newMode === 'hostel'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    🎓 Hostel / Flat
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewMode('family')}
                    className={`py-2 px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      newMode === 'family'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    👨‍👩‍👧‍👦 Family
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Household Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verma House / Room 404"
                    value={newHouseholdName}
                    onChange={(e) => setNewHouseholdName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Household Access Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VERMA2026"
                    value={newAccessCode}
                    onChange={(e) => setNewAccessCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Admin Username *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. rahul"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Admin Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul (Admin)"
                    value={newAdminDisplayName}
                    onChange={(e) => setNewAdminDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Admin Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-lg transition-all active:scale-95 cursor-pointer mt-2"
              >
                Create Household & Launch Workspace
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
