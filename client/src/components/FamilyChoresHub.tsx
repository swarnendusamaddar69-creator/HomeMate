import React, { useState } from 'react';
import { FamilyChore, Language, UserAccount } from '../types';
import {
  CheckSquare,
  Plus,
  Check,
  RotateCw,
  Sparkles,
  Award,
  Trash2,
  Users,
  UserPlus,
  X,
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
  householdMembers?: string[];
  onAddMember?: (name: string) => void;
  onDeleteMember?: (name: string) => void;
}

export const FamilyChoresHub: React.FC<FamilyChoresHubProps> = ({
  chores,
  onToggleChore,
  onAddChore,
  onDeleteChore,
  onRefreshChores,
  currentUser,
  language,
  householdMembers = [],
  onAddMember,
  onDeleteMember,
}) => {
  const t = translations[language];

  // Dynamic user-defined members: starts purely with whoever registered (or empty)
  const activeMembersList = householdMembers.length > 0
    ? householdMembers
    : currentUser?.displayName
    ? [currentUser.displayName]
    : [];

  const memberColors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-teal-500',
    'bg-indigo-500',
  ];

  const familyMembers = activeMembersList.map((name, idx) => ({
    name,
    label: name,
    color: memberColors[idx % memberColors.length],
  }));

  const [showAddModal, setShowAddModal] = useState(false);
  const [task, setTask] = useState('');
  const [assignedTo, setAssignedTo] = useState(activeMembersList[0] || 'Me');
  const [dueDate, setDueDate] = useState('Today, 7 PM');
  const [category, setCategory] = useState<FamilyChore['category']>('cleaning');
  const [aiSuggestedNotification, setAiSuggestedNotification] = useState<string | null>(null);

  // New member inline form
  const [showAddMemberInput, setShowAddMemberInput] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const handleAddNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !onAddMember) return;
    onAddMember(newMemberName.trim());
    setNewMemberName('');
    setShowAddMemberInput(false);
  };

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
      assignedTo: assignedTo || activeMembersList[0] || 'Me',
      dueDate,
      category,
      completed: false,
      points: 10,
    });

    setTask('');
    setShowAddModal(false);
  };

  const handleAiSuggestChore = () => {
    const aiChoresList = [
      { task: 'Deep clean microwave interior and gas stove top', category: 'kitchen' as const, dueDate: 'Weekend Morning' },
      { task: 'Restock RO water purifier bottle & check filter TDS', category: 'cleaning' as const, dueDate: 'Today, 6 PM' },
      { task: 'Sort dried laundry and fold into bedroom cupboards', category: 'cleaning' as const, dueDate: 'Today Evening' },
      { task: 'Water balcony garden pots, Tulsi and trim dry leaves', category: 'plants' as const, dueDate: 'Tomorrow 8 AM' },
      { task: 'Dust living room bookshelves and wipe TV screen', category: 'cleaning' as const, dueDate: 'Saturday Afternoon' },
      { task: 'Check refrigerator vegetable crisper & organize dabbas', category: 'kitchen' as const, dueDate: 'Tonight' },
    ];

    const candidate = aiChoresList.find((idea) => !chores.some((c) => c.task === idea.task)) || aiChoresList[0];
    const targetMember = activeMembersList.length > 0
      ? activeMembersList[Math.floor(Math.random() * activeMembersList.length)]
      : (currentUser?.displayName || 'Family Member');

    onAddChore({
      task: candidate.task,
      assignedTo: targetMember,
      category: candidate.category,
      dueDate: candidate.dueDate,
      completed: false,
      points: 15,
    });

    setAiSuggestedNotification(`✨ AI added: "${candidate.task}" assigned to ${targetMember}`);
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
              Fairness Engine
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
            onClick={() => {
              if (activeMembersList.length > 0 && !assignedTo) {
                setAssignedTo(activeMembersList[0]);
              }
              setShowAddModal(true);
            }}
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

      {/* Dynamic Family Members & Fairness Meter */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-black text-slate-800">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>{t.choreFairnessTitle} ({familyMembers.length} Active Members)</span>
          </span>

          <div className="flex items-center gap-2">
            {!showAddMemberInput ? (
              <button
                onClick={() => setShowAddMemberInput(true)}
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
              >
                <UserPlus className="w-3 h-3" />
                <span>+ Add Family Member</span>
              </button>
            ) : (
              <form onSubmit={handleAddNewMember} className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="e.g. Mom, Dad, Partner"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMemberInput(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {familyMembers.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
            <Users className="w-7 h-7 mx-auto text-slate-400 mb-1" />
            <p className="font-bold text-xs">No family members registered yet</p>
            <p className="text-[11px] text-slate-400">Click "+ Add Family Member" above to add your family members!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {familyMembers.map((member) => {
              const count = memberCounts[member.name] || 0;
              const percentage = Math.min(100, Math.round((count / maxChores) * 100));

              return (
                <div key={member.name} className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-1.5 relative group">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 truncate pr-2">{member.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                        {count} done
                      </span>
                      {onDeleteMember && familyMembers.length > 1 && (
                        <button
                          onClick={() => onDeleteMember(member.name)}
                          title={`Remove ${member.name}`}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
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
        )}
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
          {chores.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No house chores scheduled yet. Click "+ Add Chore" or "✨ AI Suggest Chores" to schedule chores!
            </div>
          ) : (
            chores.map((chore) => {
              const memberObj = familyMembers.find((m) => m.name === chore.assignedTo);

              return (
                <div
                  key={chore.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                    chore.completed
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 shadow-xs hover:border-emerald-300'
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
                      {chore.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div>
                      <span className={`font-bold block ${chore.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {chore.task}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">{chore.dueDate}</span>
                        <span className="text-[10px] font-bold text-emerald-600">+{chore.points} pts</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-2xs ${
                        memberObj?.color || 'bg-slate-500'
                      }`}
                    >
                      {chore.assignedTo}
                    </span>

                    <button
                      onClick={() => onDeleteChore(chore.id)}
                      className="p-1 rounded-md text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Chore Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-emerald-100 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-black text-base text-slate-900">
                {t.addChoreBtn}
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChore} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chore Task Description *
                </label>
                <input
                  type="text"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="e.g. Wipe dining counter, Buy fresh vegetables"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Assign To
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                  >
                    {activeMembersList.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                    {activeMembersList.length === 0 && (
                      <option value="Me">Me</option>
                    )}
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
                  <option value="cleaning">Cleaning / सफाई</option>
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
