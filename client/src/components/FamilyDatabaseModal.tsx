import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  CreditCard,
  UserPlus,
  PlusCircle,
  Trash2,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  QrCode,
  Heart,
  Database,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { FamilyMemberRecord, AccountInfoRecord, DatabaseStatus } from '../types';
import {
  fetchFamilyMembers,
  createFamilyMember,
  deleteFamilyMember as apiDeleteFamilyMember,
  fetchAccounts,
  createAccountInfo,
  deleteAccountInfo as apiDeleteAccountInfo,
  fetchDatabaseStatus,
} from '../utils/api';
import {
  getStoredFamilyMembers,
  saveStoredFamilyMembers,
  getStoredAccounts,
  saveStoredAccounts,
} from '../utils/storage';

interface FamilyDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  householdId?: string;
  householdName?: string;
  onMemberAdded?: (name: string) => void;
}

export const FamilyDatabaseModal: React.FC<FamilyDatabaseModalProps> = ({
  isOpen,
  onClose,
  householdId = 'family_household',
  householdName = 'Family Household',
  onMemberAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'accounts'>('members');
  const [members, setMembers] = useState<FamilyMemberRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountInfoRecord[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Success / Error Feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add Member Form State
  const [showAddMember, setShowAddMember] = useState(false);
  const [memName, setMemName] = useState('');
  const [memRelationship, setMemRelationship] = useState('Parent');
  const [memCustomRelationship, setMemCustomRelationship] = useState('');
  const [memEmail, setMemEmail] = useState('');
  const [memPhone, setMemPhone] = useState('');
  const [memAccount, setMemAccount] = useState('');
  const [memUpi, setMemUpi] = useState('');
  const [memBank, setMemBank] = useState('');
  const [memEmergency, setMemEmergency] = useState(false);
  const [memNotes, setMemNotes] = useState('');

  // Add Account Form State
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accHolder, setAccHolder] = useState('');
  const [accType, setAccType] = useState<'bank' | 'upi' | 'wallet' | 'card'>('upi');
  const [accNumberOrId, setAccNumberOrId] = useState('');
  const [accBankProvider, setAccBankProvider] = useState('');
  const [accIfsc, setAccIfsc] = useState('');
  const [accIsPrimary, setAccIsPrimary] = useState(false);
  const [accNotes, setAccNotes] = useState('');

  // Load initial data from backend or local storage
  const loadData = async () => {
    setLoading(true);
    try {
      const [remoteMembers, remoteAccounts, status] = await Promise.all([
        fetchFamilyMembers(householdId),
        fetchAccounts(householdId),
        fetchDatabaseStatus(),
      ]);

      if (remoteMembers && remoteMembers.length > 0) {
        setMembers(remoteMembers);
        saveStoredFamilyMembers(remoteMembers);
      } else {
        const local = getStoredFamilyMembers();
        setMembers(local);
      }

      if (remoteAccounts && remoteAccounts.length > 0) {
        setAccounts(remoteAccounts);
        saveStoredAccounts(remoteAccounts);
      } else {
        const localAcc = getStoredAccounts();
        setAccounts(localAcc);
      }

      setDbStatus(status);
    } catch (err) {
      console.warn('Error loading database data:', err);
      setMembers(getStoredFamilyMembers());
      setAccounts(getStoredAccounts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, householdId]);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
  };

  // ── Handle Add Family Member ──
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName.trim()) {
      showError('Please enter the family member\'s full name.');
      return;
    }

    const finalRel = memRelationship === 'Other' ? (memCustomRelationship.trim() || 'Family Member') : memRelationship;

    try {
      const newRecord = await createFamilyMember({
        householdId,
        name: memName.trim(),
        relationship: finalRel,
        email: memEmail.trim(),
        phone: memPhone.trim(),
        accountNumber: memAccount.trim(),
        upiId: memUpi.trim(),
        bankName: memBank.trim(),
        emergencyContact: memEmergency,
        notes: memNotes.trim(),
      });

      const updated = [newRecord, ...members];
      setMembers(updated);
      saveStoredFamilyMembers(updated);

      if (onMemberAdded) {
        onMemberAdded(newRecord.name);
      }

      // Also create an account entry if UPI or bank details provided
      if (memUpi.trim() || memAccount.trim()) {
        const autoAcc = await createAccountInfo({
          householdId,
          accountHolder: newRecord.name,
          accountType: memUpi.trim() ? 'upi' : 'bank',
          accountNumberOrId: memUpi.trim() || memAccount.trim(),
          bankOrProvider: memBank.trim() || (memUpi.trim() ? 'UPI ID' : 'Savings Account'),
          isPrimary: accounts.length === 0,
          notes: `Associated with family member ${newRecord.name} (${finalRel})`,
        });
        const updatedAccs = [autoAcc, ...accounts];
        setAccounts(updatedAccs);
        saveStoredAccounts(updatedAccs);
      }

      showSuccess(`Added "${newRecord.name}" to the household database!`);

      // Reset form
      setMemName('');
      setMemRelationship('Parent');
      setMemCustomRelationship('');
      setMemEmail('');
      setMemPhone('');
      setMemAccount('');
      setMemUpi('');
      setMemBank('');
      setMemEmergency(false);
      setMemNotes('');
      setShowAddMember(false);
    } catch (err: any) {
      showError(err.message || 'Failed to add family member to database.');
    }
  };

  // ── Handle Delete Member ──
  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the database?`)) return;
    try {
      await apiDeleteFamilyMember(id);
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      saveStoredFamilyMembers(updated);
      showSuccess(`Removed "${name}" from database.`);
    } catch (err: any) {
      showError('Could not delete member.');
    }
  };

  // ── Handle Add Account ──
  const handleAddAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accHolder.trim()) {
      showError('Please enter account holder name.');
      return;
    }
    if (!accNumberOrId.trim()) {
      showError('Please enter account number or UPI ID.');
      return;
    }

    try {
      const newAcc = await createAccountInfo({
        householdId,
        accountHolder: accHolder.trim(),
        accountType: accType,
        accountNumberOrId: accNumberOrId.trim(),
        bankOrProvider: accBankProvider.trim() || 'Bank / Provider',
        ifscOrHandle: accIfsc.trim(),
        isPrimary: accIsPrimary,
        notes: accNotes.trim(),
      });

      const updated = [newAcc, ...accounts];
      setAccounts(updated);
      saveStoredAccounts(updated);

      showSuccess(`Added account info for "${newAcc.accountHolder}"!`);

      // Reset form
      setAccHolder('');
      setAccType('upi');
      setAccNumberOrId('');
      setAccBankProvider('');
      setAccIfsc('');
      setAccIsPrimary(false);
      setAccNotes('');
      setShowAddAccount(false);
    } catch (err: any) {
      showError(err.message || 'Failed to save account info.');
    }
  };

  // ── Handle Delete Account ──
  const handleDeleteAccount = async (id: string, holder: string) => {
    if (!confirm(`Remove account for ${holder}?`)) return;
    try {
      await apiDeleteAccountInfo(id);
      const updated = accounts.filter((a) => a.id !== id);
      setAccounts(updated);
      saveStoredAccounts(updated);
      showSuccess(`Account for "${holder}" removed.`);
    } catch (err) {
      showError('Could not delete account.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="db-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="db-modal-title" className="text-base sm:text-lg font-black tracking-tight">
                  Household Database & Accounts
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{dbStatus?.engine === 'postgresql' ? 'PostgreSQL' : 'Persistent Storage'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Centralized registry for family members, emergency contacts & banking accounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close database modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 bg-slate-50 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                activeTab === 'members'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Family Members</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
                {members.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                activeTab === 'accounts'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Account & Bank Info</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
                {accounts.length}
              </span>
            </button>
          </div>

          <button
            onClick={loadData}
            title="Refresh database"
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>

        {/* Alerts / Feedback */}
        {successMessage && (
          <div
            role="status"
            className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fadeIn"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="flex-1">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mx-5 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-800 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 touch-scroll">
          
          {/* TAB 1: FAMILY MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Registered Household Members ({members.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Members stored securely in the database for task assignment, medicine tracking, and account transfers.
                  </p>
                </div>
                {!showAddMember && (
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Family Member</span>
                  </button>
                )}
              </div>

              {/* Add Family Member Form */}
              {showAddMember && (
                <form
                  onSubmit={handleAddMemberSubmit}
                  className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border-2 border-emerald-300/80 space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-900 flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>New Family Member Profile</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={memName}
                        onChange={(e) => setMemName(e.target.value)}
                        placeholder="e.g. Ramesh Sharma"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Relationship / Role
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={memRelationship}
                          onChange={(e) => setMemRelationship(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Grandparent">Grandparent (Dada / Dadi / Nana / Nani)</option>
                          <option value="Parent">Parent (Father / Mother)</option>
                          <option value="Spouse">Spouse / Partner</option>
                          <option value="Child">Child (Son / Daughter)</option>
                          <option value="Sibling">Sibling (Brother / Sister)</option>
                          <option value="Flatmate">Flatmate / Roommate</option>
                          <option value="Caregiver">Caregiver / Home Nurse</option>
                          <option value="Other">Other / Custom</option>
                        </select>
                        {memRelationship === 'Other' && (
                          <input
                            type="text"
                            value={memCustomRelationship}
                            onChange={(e) => setMemCustomRelationship(e.target.value)}
                            placeholder="Specify relation..."
                            className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="email"
                          value={memEmail}
                          onChange={(e) => setMemEmail(e.target.value)}
                          placeholder="member@homemate.ai"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="tel"
                          value={memPhone}
                          onChange={(e) => setMemPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        UPI ID (Optional)
                      </label>
                      <div className="relative">
                        <QrCode className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={memUpi}
                          onChange={(e) => setMemUpi(e.target.value)}
                          placeholder="e.g. name@okhdfcbank"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bank Account Number / Bank Name
                      </label>
                      <div className="relative">
                        <Building className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={memAccount}
                          onChange={(e) => setMemAccount(e.target.value)}
                          placeholder="e.g. 50100492819412 (HDFC)"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="emergency-check"
                      checked={memEmergency}
                      onChange={(e) => setMemEmergency(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="emergency-check" className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span>Primary Emergency Contact for Household SOS</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Notes, Medication Routine, or Dietary Restrictions
                    </label>
                    <textarea
                      rows={2}
                      value={memNotes}
                      onChange={(e) => setMemNotes(e.target.value)}
                      placeholder="e.g. Needs diabetic care, allergic to peanuts, takes evening BP medicines..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                    >
                      Save to Database
                    </button>
                  </div>
                </form>
              )}

              {/* Members List Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-slate-900">
                              {member.name}
                            </span>
                            {member.emergencyContact && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                                <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                                <span>Emergency</span>
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-emerald-700">
                            {member.relationship}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          title="Delete member"
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Contact Channels with Clickable mailto and tel links */}
                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        {member.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a
                              href={`mailto:${member.email}`}
                              className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline truncate"
                            >
                              {member.email}
                            </a>
                          </div>
                        ) : null}

                        {member.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a
                              href={`tel:${member.phone.replace(/\s+/g, '')}`}
                              className="text-slate-800 hover:text-emerald-700 font-bold hover:underline"
                            >
                              {member.phone}
                            </a>
                          </div>
                        ) : null}

                        {(member.upiId || member.accountNumber) && (
                          <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-500">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {member.upiId ? `UPI: ${member.upiId}` : `Acc: ${member.accountNumber}`}
                            </span>
                          </div>
                        )}

                        {member.notes && (
                          <p className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                            "{member.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>ID: {member.id}</span>
                      <span>Added {new Date(member.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}

                {members.length === 0 && !showAddMember && (
                  <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No family members in database yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click the "Add Family Member" button above to add parents, children, or roommates.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ACCOUNT & BANK INFO */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Household Bank & UPI Accounts ({accounts.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Accounts stored for grocery reimbursement, Splitwise settlements, and utility payments.
                  </p>
                </div>
                {!showAddAccount && (
                  <button
                    onClick={() => setShowAddAccount(true)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Bank / UPI Account</span>
                  </button>
                )}
              </div>

              {/* Add Account Form */}
              {showAddAccount && (
                <form
                  onSubmit={handleAddAccountSubmit}
                  className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border-2 border-indigo-200 space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-indigo-900 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                      <span>New Account Information</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddAccount(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Account Holder Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={accHolder}
                        onChange={(e) => setAccHolder(e.target.value)}
                        placeholder="e.g. Ramesh Sharma"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Account Type
                      </label>
                      <select
                        value={accType}
                        onChange={(e) => setAccType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="upi">UPI ID (Google Pay / PhonePe / Paytm)</option>
                        <option value="bank">Bank Savings Account</option>
                        <option value="wallet">Digital Wallet</option>
                        <option value="card">Household Debit / Credit Card</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {accType === 'upi' ? 'UPI Address' : 'Account Number / ID'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={accNumberOrId}
                        onChange={(e) => setAccNumberOrId(e.target.value)}
                        placeholder={accType === 'upi' ? 'e.g. ramesh.sharma@okhdfcbank' : 'e.g. 50100492819412'}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bank / Provider Name
                      </label>
                      <input
                        type="text"
                        value={accBankProvider}
                        onChange={(e) => setAccBankProvider(e.target.value)}
                        placeholder="e.g. HDFC Bank, SBI, ICICI"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        IFSC Code / Branch (Optional)
                      </label>
                      <input
                        type="text"
                        value={accIfsc}
                        onChange={(e) => setAccIfsc(e.target.value)}
                        placeholder="e.g. HDFC0001234"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="primary-account-check"
                        checked={accIsPrimary}
                        onChange={(e) => setAccIsPrimary(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="primary-account-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                        Mark as Default Primary Account
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Notes / Usage instructions
                    </label>
                    <input
                      type="text"
                      value={accNotes}
                      onChange={(e) => setAccNotes(e.target.value)}
                      placeholder="e.g. Use for weekly milk bill and vegetables"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAccount(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                    >
                      Save Account to Database
                    </button>
                  </div>
                </form>
              )}

              {/* Accounts List Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-slate-900">
                              {acc.accountHolder}
                            </span>
                            {acc.isPrimary && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Primary
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-indigo-600">
                            {acc.bankOrProvider} • {acc.accountType.toUpperCase()}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteAccount(acc.id, acc.accountHolder)}
                          title="Remove account"
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs flex items-center justify-between">
                        <span className="text-slate-500 font-sans text-[11px]">Details:</span>
                        <span className="font-bold text-slate-800 select-all">{acc.accountNumberOrId}</span>
                      </div>

                      {acc.ifscOrHandle && (
                        <div className="mt-1 text-[11px] text-slate-500 font-mono">
                          IFSC: {acc.ifscOrHandle}
                        </div>
                      )}

                      {acc.notes && (
                        <p className="mt-2 text-[11px] text-slate-500 italic">
                          "{acc.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>ID: {acc.id}</span>
                      <span>Added {new Date(acc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}

                {accounts.length === 0 && !showAddAccount && (
                  <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No account info added yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Add UPI IDs or bank accounts for grocery splitting and family expense management.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Live Engine Info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Database engine: <strong className="text-slate-700">{dbStatus?.engine || 'Local Persistent File'}</strong> ({members.length} members, {accounts.length} accounts)
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
