import React, { useState } from 'react';
import { FamilyChore, Language, UserAccount } from '../types';
import {
  CheckSquare,
  Plus,
  Sparkles,
  RotateCw,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Flame,
  Award,
  Calendar,
} from 'lucide-react';
import { translations } from '../utils/translations';

interface FamilyChoresHubProps {
  chores: FamilyChore[];
  onToggleChore: (id: string) => void;
  onAddChore: (chore: Omit<FamilyChore, 'id'>) => void;
  onDeleteChore: (id: string) => void;
  onRefreshChores: () => void;
  currentUser: UserAccount | null;
  language: Language;
}

export const FamilyChoresHub: React.FC<FamilyChoresHubProps> = ({
  chores,
  onToggleChore,
  onAddChore,
  onDeleteChore,
  onRefreshChores,
  currentUser,
  language,
}) => {
  const t = translations[language];

  const familyMembers = [
    { name: 'Sunita (Mom)', label: language === 'hi' ? 'मम्मी (सुनीता)' : language === 'bn' ? 'মা (সুনীতা)' : 'Mummy (Sunita)', color: 'bg-emerald-500' },
    { name: 'Rajesh (Dad)', label: language === 'hi' ? 'पापा (राजेश)' : language === 'bn' ? 'বাবা (রাজেশ)' : 'Papa (Rajesh)', color: 'bg-blue-500' },
    { name: 'Aarav (Son)', label: language === 'hi' ? 'आरव (बेटा)' : language === 'bn' ? 'আরভ (ছেলে)' : 'Aarav (Son)', color: 'bg-amber-500' },
    { name: 'Priya (Daughter)', label: language === 'hi' ? 'प्रिया (बेटी)' : language === 'bn' ? 'প্রিয়া (মেয়ে)' : 'Priya (Daughter)', color: 'bg-purple-500' },
  ];

  const [showAddModal, setShowAddModal] = useState(false);
  const [task, setTask] = useState('');
  const [assignedTo, setAssignedTo] = useState('Sunita (Mom)');
  const [dueDate, setDueDate] = useState('Today, 7 PM');
  const [category, setCategory] = useState<FamilyChore['category']>('cleaning');
  const [aiSuggestedNotification, setAiSuggestedNotification] = useState<string | null>(null);

  // Compute live chore fairness count
  const memberCounts: Record<string, number> = {};
  familyMembers.forEach((m) => {
    memberCounts[m.name] = chores.filter(
      (c) => c.completed && (c.assignedTo === m.name || c.completedBy === m.name)
    ).length;
  });

  const maxChores = Math.max(...Object.values(memberCounts), 5);

  const handleCreateChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    onAddChore({
      task: task.trim(),
      assignedTo,
      dueDate,
      category,
      completed: false,
      points: 10,
    });

    setTask('');
    setShowAddModal(false);
  };

  const handleAiSuggestChore = () => {
    const aiIdeas = [
      {
        task: 'Deep clean microwave interior and gas stove top',
        assignedTo: 'Rajesh (Dad)',
        category: 'kitchen' as const,
        dueDate: 'Weekend Morning',
      },
      {
        task: 'Restock RO water purifier bottle & check filter TDS',
        assignedTo: 'Aarav (Son)',
        category: 'cleaning' as const,
        dueDate: 'Today, 6 PM',
      },
      {
        task: 'Sort dried laundry and fold into bedroom cupboards',
        assignedTo: 'Priya (Daughter)',
        category: 'cleaning' as const,
        dueDate: 'Today Evening',
      },
      {
        task: 'Water balcony garden pots, Tulsi and trim dry leaves',
        assignedTo: 'Sunita (Mom)',
        category: 'plants' as const,
        dueDate: 'Tomorrow 8 AM',
      },
      {
        task: 'Dust living room bookshelves and wipe TV screen',
        assignedTo: 'Aarav (Son)',
        category: 'cleaning' as const,
        dueDate: 'Saturday Afternoon',
      },
      {
        task: 'Check refrigerator vegetable crisper & organize dabbas',
        assignedTo: 'Sunita (Mom)',
        category: 'kitchen' as const,
        dueDate: 'Today Night',
      },
    ];

    // Pick one not currently in tasks
    const candidate = aiIdeas.find((idea) => !chores.some((c) => c.task === idea.task)) || aiIdeas[0];

    onAddChore({
      task: candidate.task,
      assignedTo: candidate.assignedTo,
      category: candidate.category,
      dueDate: candidate.dueDate,
      completed: false,
      points: 15,
    });

    setAiSuggestedNotification(`✨ AI added: "${candidate.task}" assigned to ${candidate.assignedTo}`);
    setTimeout(() => setAiSuggestedNotification(null), 3500);
  };

  return (
    <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm interactive-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckSquare className="w-5 h-5" />
            </span>
            <h3 className="font-black text-lg text-slate-900 tracking-tight">
              {t.familyChoresTitle}
            </h3>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live Fairness
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.familyChoresSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAiSuggestChore}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.aiSuggestChores}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{t.addChoreBtn}</span>
          </button>

          <button
            onClick={onRefreshChores}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title={t.refreshChores}
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {aiSuggestedNotification && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{aiSuggestedNotification}</span>
        </div>
      )}

      {/* Dynamic Chore Fairness Meter */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs font-black text-slate-800">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>{t.choreFairnessTitle}</span>
          </span>
          <span className="text-[11px] text-slate-500 font-normal">
            Completed chores automatically update member balance
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {familyMembers.map((member) => {
            const count = memberCounts[member.name] || 0;
            const percentage = Math.min(100, Math.round((count / maxChores) * 100));

            return (
              <div key={member.name} className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{member.label}</span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                    {count} {language === 'hi' ? 'काम' : language === 'bn' ? 'কাজ' : 'done'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${member.color}`}
                    style={{ width: `${Math.max(8, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chores Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
          <span>Active House Tasks ({chores.length})</span>
          <span>
            {chores.filter((c) => c.completed).length} of {chores.length} completed
          </span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {chores.map((chore) => {
            const memberObj = familyMembers.find((m) => m.name === chore.assignedTo);

            return (
              <div
                key={chore.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                  chore.completed
                    ? 'bg-emerald-50/50 border-emerald-200 opacity-80'
                    : 'bg-white border-slate-200/90 shadow-xs hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleChore(chore.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      chore.completed
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-slate-300 hover:border-emerald-500'
                    }`}
                  >
                    {chore.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div>
                    <span
                      className={`font-bold block ${
                        chore.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {chore.task}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <User className="w-3 h-3 text-emerald-600" />
                        <span>{memberObj?.label || chore.assignedTo}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{chore.dueDate}</span>
                      </span>
                      {chore.completed && chore.completedAt && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">
                            ✓ {t.choreCompleted} ({chore.completedAt})
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteChore(chore.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete chore"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal to Add New Chore */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <span>Assign House Chore</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChore} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chore Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Water plants, Fold laundry, Take out garbage..."
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {t.assignedTo} *
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                  >
                    {familyMembers.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Due / Time
                  </label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="e.g. Today 8 PM, Daily"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FamilyChore['category'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                >
                  <option value="cleaning">Cleaning / झाड़ू-पोंछा</option>
                  <option value="kitchen">Kitchen / रसोई</option>
                  <option value="shopping">Shopping / बाज़ार</option>
                  <option value="plants">Plants / पौधे</option>
                  <option value="repairs">Repairs & Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md cursor-pointer"
                >
                  {t.addChoreBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
