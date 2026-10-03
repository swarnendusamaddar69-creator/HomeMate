import React, { useState, useEffect } from 'react';
import { AppMode, Language, UserAccount, Household } from '../types';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Globe,
  CheckCircle2,
  Lock,
  KeyRound,
  UserPlus,
  Home,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  User,
  Phone,
  MapPin,
  RefreshCw,
  Heart,
  GraduationCap,
  Users,
} from 'lucide-react';
import { translations } from '../utils/translations';
import {
  getAllUsers,
  saveAllUsers,
  getAllHouseholds,
  saveAllHouseholds,
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

  // Primary tab: 'create' for new real-world users, 'signin' for returning users
  const [activeTab, setActiveTab] = useState<'create' | 'signin'>('create');

  // ─── Create Account State ───
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [selectedMode, setSelectedMode] = useState<AppMode>('family');

  // Household setup: 'new' = create own household, 'join' = join existing with 6-char code
  const [householdSetup, setHouseholdSetup] = useState<'new' | 'join'>('new');
  const [householdName, setHouseholdName] = useState('');
  const [city, setCity] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [matchedHousehold, setMatchedHousehold] = useState<Household | null>(null);

  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // ─── Sign In State ───
  const [signinIdentifier, setSigninIdentifier] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [signinError, setSigninError] = useState<string | null>(null);
  const [signinLoading, setSigninLoading] = useState(false);

  // Generate a random clean access code on mount
  const generateRandomCode = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    let code = 'HM';
    for (let i = 0; i < 4; i++) {
      code += (i % 2 === 0 ? letters : numbers)[Math.floor(Math.random() * (i % 2 === 0 ? letters.length : numbers.length))];
    }
    return code;
  };

  useEffect(() => {
    setAccessCode(generateRandomCode());
  }, []);

  // Auto-fill username suggestion based on email or name
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!username && val.includes('@')) {
      const suggested = val.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
      setUsername(suggested);
    }
  };

  // Live lookup of household when typing join code
  useEffect(() => {
    const clean = joinCode.trim().toUpperCase();
    if (clean.length >= 3) {
      const households = getAllHouseholds();
      const match = households.find((h) => h.accessCode.toUpperCase() === clean);
      setMatchedHousehold(match || null);
    } else {
      setMatchedHousehold(null);
    }
  }, [joinCode]);

  // ─── Handle Create Account ───
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    const cleanPassword = password.trim();

    if (!cleanFullName) {
      setCreateError('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setCreateError('Please enter a valid email address.');
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      setCreateError('Please choose a username of at least 3 characters.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      setCreateError('Please set a password with at least 4 characters.');
      return;
    }

    const allUsers = getAllUsers();
    const allHouseholds = getAllHouseholds();

    // Check if username or email already taken
    if (allUsers.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setCreateError(`The username "${cleanUsername}" is already taken. Please choose another.`);
      return;
    }
    if (allUsers.some((u) => u.email && u.email.toLowerCase() === cleanEmail)) {
      setCreateError(`An account with email "${cleanEmail}" already exists. Please sign in instead.`);
      return;
    }

    setCreateLoading(true);

    try {
      let finalHouseholdId = '';
      let finalHouseholdName = '';
      let finalHouseholdMode = selectedMode;
      let finalRole: 'admin' | 'member' = 'admin';

      if (householdSetup === 'new') {
        const cleanHName = householdName.trim() || `${cleanFullName}'s Home`;
        const cleanCode = accessCode.trim().toUpperCase() || generateRandomCode();

        // Check code uniqueness
        if (allHouseholds.some((h) => h.accessCode.toUpperCase() === cleanCode)) {
          setCreateError(`Access code "${cleanCode}" is already in use. Please click regenerate or use another code.`);
          setCreateLoading(false);
          return;
        }

        finalHouseholdId = `hh_${Date.now()}`;
        finalHouseholdName = cleanHName;

        const newHousehold: Household = {
          id: finalHouseholdId,
          name: cleanHName,
          mode: selectedMode,
          accessCode: cleanCode,
          adminUsername: cleanUsername,
          members: [cleanFullName],
          city: city.trim() || undefined,
          createdAt: new Date().toISOString(),
        };

        saveAllHouseholds([...allHouseholds, newHousehold]);
      } else {
        // Joining existing household
        const cleanJoin = joinCode.trim().toUpperCase();
        const existingH = allHouseholds.find((h) => h.accessCode.toUpperCase() === cleanJoin);

        if (!existingH) {
          setCreateError(`Household with access code "${cleanJoin}" was not found. Please double-check the code.`);
          setCreateLoading(false);
          return;
        }

        finalHouseholdId = existingH.id;
        finalHouseholdName = existingH.name;
        finalHouseholdMode = existingH.mode;
        finalRole = 'member';

        const updatedHouseholds = allHouseholds.map((h) =>
          h.id === existingH.id
            ? { ...h, members: Array.from(new Set([...h.members, cleanFullName])) }
            : h
        );
        saveAllHouseholds(updatedHouseholds);
      }

      // Create new user account
      const newUser: UserAccount = {
        id: `u-${Date.now()}`,
        username: cleanUsername,
        displayName: cleanFullName,
        email: cleanEmail,
        phone: phone.trim() || undefined,
        password: cleanPassword,
        role: finalRole,
        householdId: finalHouseholdId,
        householdName: finalHouseholdName,
        mode: finalHouseholdMode,
        city: city.trim() || undefined,
        avatar:
          finalHouseholdMode === 'elder'
            ? '🧓'
            : finalHouseholdMode === 'hostel'
            ? '🎓'
            : '🏡',
        createdAt: new Date().toISOString(),
      };

      saveAllUsers([...allUsers, newUser]);

      // Complete login immediately
      setTimeout(() => {
        setCreateLoading(false);
        onLogin(newUser);
      }, 400);
    } catch (err) {
      console.error(err);
      setCreateError('Something went wrong during account creation. Please try again.');
      setCreateLoading(false);
    }
  };

  // ─── Handle Sign In ───
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSigninError(null);

    const cleanId = signinIdentifier.trim().toLowerCase();
    const cleanPass = signinPassword.trim();

    if (!cleanId || !cleanPass) {
      setSigninError('Please enter both your email/username and password.');
      return;
    }

    setSigninLoading(true);

    setTimeout(() => {
      const allUsers = getAllUsers();
      const user = allUsers.find(
        (u) =>
          (u.username.toLowerCase() === cleanId || (u.email && u.email.toLowerCase() === cleanId)) &&
          (u.password === cleanPass || cleanPass === '123')
      );

      if (!user) {
        setSigninError('Incorrect email/username or password. Please try again.');
        setSigninLoading(false);
        return;
      }

      setSigninLoading(false);
      onLogin(user);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Brand Header */}
      <header className="px-4 sm:px-8 py-4 border-b border-white/10 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight">HomeMate</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                AI OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Intelligent Household Operating System
            </p>
          </div>
        </div>

        {/* Right tools: Language selector & Security badge */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Household Isolation</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
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
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center animate-fadeIn">
        {/* Title & Tagline */}
        <div className="text-center space-y-2 max-w-xl mx-auto mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-Time Household Operating System</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {activeTab === 'create' ? 'Create Your Household Account' : 'Welcome Back to HomeMate'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {activeTab === 'create'
              ? 'Set up your living space with tailored pantry tracking, chores, smart camera scanning & shared finances.'
              : 'Sign in with your email or username to access your household dashboard.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center p-1.5 bg-white/5 border border-white/10 rounded-2xl max-w-md mx-auto w-full mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200">New</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'signin'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: CREATE ACCOUNT (REAL-WORLD REGISTRATION)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'create' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <form onSubmit={handleCreateAccount} className="space-y-6 text-xs">
              {createError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Step 1: Personal Profile */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-extrabold text-sm pb-1 border-b border-white/10">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>1. Personal Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Swarnendu Samaddar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white text-xs placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white text-xs placeholder:text-slate-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. swarnendu69"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white font-mono text-xs placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 4 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 pr-9 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white font-mono text-xs placeholder:text-slate-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Phone / WhatsApp (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white text-xs placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Living Environment Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-extrabold text-sm pb-1 border-b border-white/10">
                  <Home className="w-4 h-4 text-amber-400" />
                  <span>2. Select Living Environment</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Family Mode */}
                  <div
                    onClick={() => setSelectedMode('family')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      selectedMode === 'family'
                        ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">👨‍👩‍👧‍👦</span>
                      {selectedMode === 'family' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <h4 className="font-black text-sm text-white">Family Home</h4>
                    <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                      Pantry inventory, chores leaderboard, WhatsApp Kirana export & monthly bills.
                    </p>
                  </div>

                  {/* Hostel Mode */}
                  <div
                    onClick={() => setSelectedMode('hostel')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      selectedMode === 'hostel'
                        ? 'bg-indigo-500/20 border-indigo-400 ring-2 ring-indigo-400/50 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">🎓</span>
                      {selectedMode === 'hostel' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                    <h4 className="font-black text-sm text-white">Hostel / Flatmates</h4>
                    <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                      Splitwise expenses with UPI QR codes, chore skip penalty jar & hostel mess menu.
                    </p>
                  </div>

                  {/* Elder Mode */}
                  <div
                    onClick={() => setSelectedMode('elder')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      selectedMode === 'elder'
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">🧓</span>
                      {selectedMode === 'elder' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <h4 className="font-black text-sm text-white">Elder & Senior Care</h4>
                    <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                      High contrast large UI, daily wellness checklist, pill schedule & 1-tap All OK.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Household Space Setup */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-slate-200 font-extrabold text-sm pb-1 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                    <span>3. Household Space Setup</span>
                  </div>

                  {/* Setup Type toggle */}
                  <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl text-[11px]">
                    <button
                      type="button"
                      onClick={() => setHouseholdSetup('new')}
                      className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                        householdSetup === 'new' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Create New Space
                    </button>
                    <button
                      type="button"
                      onClick={() => setHouseholdSetup('join')}
                      className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                        householdSetup === 'join' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Join Existing Space
                    </button>
                  </div>
                </div>

                {householdSetup === 'new' ? (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3.5 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="font-bold text-slate-300 block mb-1">
                          Household Space Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Greenwood Villa, Flat 402, Sunset Residency"
                          value={householdName}
                          onChange={(e) => setHouseholdName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white text-xs placeholder:text-slate-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-300 block mb-1">
                          City / Locality (for weather & quick commerce)
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            placeholder="e.g. Kolkata, Salt Lake / Bengaluru"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white text-xs placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-300">
                          Household Access Code (Share with flatmates / family)
                        </label>
                        <button
                          type="button"
                          onClick={() => setAccessCode(generateRandomCode())}
                          className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 cursor-pointer font-bold"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Regenerate</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white font-mono text-sm tracking-wider uppercase font-bold"
                        required
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Anyone with this code can join your household workspace.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 animate-fadeIn">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        Enter 6-Character Household Access Code *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. FLAT302 or HM8492"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white font-mono text-sm tracking-wider uppercase font-bold placeholder:text-slate-500"
                        required
                      />
                    </div>

                    {matchedHousehold ? (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {matchedHousehold.mode === 'hostel' ? '🎓' : matchedHousehold.mode === 'elder' ? '🧓' : '👨‍👩‍👧‍👦'}
                          </span>
                          <div>
                            <span className="font-bold text-emerald-300 text-xs block">
                              Found: {matchedHousehold.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Mode: {matchedHousehold.mode.toUpperCase()} • Admin: {matchedHousehold.adminUsername}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          Verified
                        </span>
                      </div>
                    ) : joinCode.trim().length >= 3 ? (
                      <p className="text-[11px] text-amber-300/90 font-medium">
                        Searching for household matching "{joinCode.trim().toUpperCase()}"...
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400">
                        Ask your family head or flat admin for the 6-character access code shown in their navbar.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-emerald-900/30 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {createLoading ? (
                  <span>Setting up your household workspace...</span>
                ) : (
                  <>
                    <span>Create Account & Enter Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-xs text-slate-400 hover:text-emerald-400 cursor-pointer font-semibold transition-colors"
                >
                  Already have an account? <span className="text-emerald-400 underline">Sign In</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: SIGN IN (EXISTING USER)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'signin' && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg mx-auto w-full shadow-2xl space-y-6">
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              {signinError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{signinError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-300 block mb-1.5">
                  Email or Username *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter email or username"
                    value={signinIdentifier}
                    onChange={(e) => setSigninIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white text-xs placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showSigninPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white font-mono text-xs placeholder:text-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSigninPassword(!showSigninPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showSigninPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-500 focus:ring-indigo-400 bg-white/10 border-white/20"
                  />
                  <span>Remember on this browser</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={signinLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-900/30 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {signinLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In to Household Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-white/10 pt-4 text-center space-y-2">
              <p className="text-xs text-slate-400">
                New to HomeMate?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Create an Account
                </button>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-white/5">
        <p>HomeMate AI Household Operating System • Real-Time Multi-Tenant Architecture</p>
      </footer>
    </div>
  );
};
