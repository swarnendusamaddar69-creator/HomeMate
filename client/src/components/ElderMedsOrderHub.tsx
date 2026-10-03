import React, { useState } from 'react';
import { Prescription, MedicineToBuy, Language, ShoppingItem } from '../types';
import {
  FileText,
  Pill,
  Plus,
  Share2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Upload,
  Calendar,
  Sparkles,
  ShoppingBag,
  Trash2,
  Clock,
  Phone,
  Check,
} from 'lucide-react';
import { translations } from '../utils/translations';

interface ElderMedsOrderHubProps {
  prescriptions: Prescription[];
  medsToBuy: MedicineToBuy[];
  onAddPrescription: (rx: Omit<Prescription, 'id'>) => void;
  onAddMedicineToBuy: (med: Omit<MedicineToBuy, 'id'>) => void;
  onUpdateMedicineStatus: (id: string, status: 'needed' | 'ordered' | 'received') => void;
  onDeleteMedicineToBuy: (id: string) => void;
  onSyncToKiranaList: (title: string, qty: string) => void;
  language: Language;
}

export const ElderMedsOrderHub: React.FC<ElderMedsOrderHubProps> = ({
  prescriptions,
  medsToBuy,
  onAddPrescription,
  onAddMedicineToBuy,
  onUpdateMedicineStatus,
  onDeleteMedicineToBuy,
  onSyncToKiranaList,
  language,
}) => {
  const t = translations[language];

  // Prescription modal state
  const [showAddRxModal, setShowAddRxModal] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [clinic, setClinic] = useState('');
  const [rxDate, setRxDate] = useState(
    new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  );
  const [rxNotes, setRxNotes] = useState('');
  const [medRowName, setMedRowName] = useState('');
  const [medRowDosage, setMedRowDosage] = useState('');
  const [medRowFreq, setMedRowFreq] = useState('');
  const [prescribedList, setPrescribedList] = useState<
    { name: string; dosage: string; frequency: string; duration: string }[]
  >([]);

  // Med to Buy modal state
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medQty, setMedQty] = useState('1 Strip');
  const [medUrgency, setMedUrgency] = useState<'high' | 'medium' | 'routine'>('high');
  const [medCost, setMedCost] = useState('85');

  const [copiedChemistToast, setCopiedChemistToast] = useState(false);

  const handleAddMedRowToRx = () => {
    if (!medRowName.trim()) return;
    setPrescribedList((prev) => [
      ...prev,
      {
        name: medRowName.trim(),
        dosage: medRowDosage.trim() || '1 Tab',
        frequency: medRowFreq.trim() || 'Twice daily',
        duration: 'Ongoing',
      },
    ]);
    setMedRowName('');
    setMedRowDosage('');
    setMedRowFreq('');
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim()) return;

    onAddPrescription({
      doctorName: doctorName.trim(),
      clinicOrHospital: clinic.trim() || 'City Clinic',
      date: rxDate,
      notes: rxNotes.trim() || 'Take with water after meals',
      prescribedMedicines:
        prescribedList.length > 0
          ? prescribedList
          : [{ name: doctorName.includes('Eye') ? 'Eye Drops' : 'General Tablets', dosage: '1 Tab', frequency: 'Daily', duration: '30 days' }],
    });

    setDoctorName('');
    setClinic('');
    setRxNotes('');
    setPrescribedList([]);
    setShowAddRxModal(false);
  };

  const handleSaveMedToBuy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    onAddMedicineToBuy({
      name: medName.trim(),
      dosage: medDosage.trim() || 'Standard Dose',
      quantity: medQty.trim() || '1 Strip',
      urgency: medUrgency,
      status: 'needed',
      estimatedCost: parseFloat(medCost) || 90,
      prescribedBy: 'Prescription Vault',
    });

    setMedName('');
    setMedDosage('');
    setShowAddMedModal(false);
  };

  const handleWhatsAppChemist = () => {
    const needed = medsToBuy.filter((m) => m.status === 'needed');
    if (needed.length === 0) {
      alert(language === 'hi' ? 'खरीदने के लिए कोई दवा बाकी नहीं है!' : 'No medicines pending to buy!');
      return;
    }

    const lines = needed.map((m, idx) => `${idx + 1}. *${m.name}* - ${m.quantity} (${m.dosage})`);
    const header =
      language === 'hi'
        ? `*संजीवनी मेडिकल स्टोर - दवाई ऑर्डर (होम डिलीवरी)*\nकृपया ये दवाइयां घर पहुंचा दीजिए:`
        : language === 'bn'
        ? `*সঞ্জীবনী মেডিকেল স্টোর - ওষুধের অর্ডার*\nঅনুগ্রহ করে এই ওষুধগুলো বাড়িতে পাঠিয়ে দিন:`
        : `*Sanjivani Medical Store - Medicine Prescription Order*\nPlease deliver these medicines to home:`;

    const text = `${header}\n\n${lines.join('\n')}\n\nPatient: Nanaji / Dadu (Flat 402)\nEmergency Contact: Priya (Daughter)\n\nSent via HomeMate AI OS`;

    navigator.clipboard.writeText(text);
    setCopiedChemistToast(true);
    setTimeout(() => setCopiedChemistToast(false), 3000);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const neededCount = medsToBuy.filter((m) => m.status === 'needed').length;

  return (
    <div className="bg-white rounded-3xl border-3 border-amber-300 p-6 sm:p-7 shadow-md interactive-card hover-glow-amber space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
            <Pill className="w-4 h-4 text-amber-700" />
            <span>
              {language === 'hi'
                ? 'प्रिस्क्रिप्शन और दवा खरीद हब'
                : language === 'bn'
                ? 'প্রেসক্রিপশন ও ওষুধ অর্ডার হাব'
                : 'Prescription Vault & Meds Order Hub'}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {language === 'hi'
              ? 'डॉक्टर प्रिस्क्रिप्शन और दवाइयां खरीदें'
              : language === 'bn'
              ? 'ডাক্তারের প্রেসক্রিপশন ও ওষুধ কিনুন'
              : 'Prescription Vault & Medicine Orders'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {neededCount} {language === 'hi' ? 'दवाईयां खरीदने की ज़रूरत है • मेडिकल स्टोर पर व्हाट्सएप भेजें' : 'medicines needed • 1-Tap chemist WhatsApp order or Apollo 24/7 delivery'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleWhatsAppChemist}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>
              {language === 'hi'
                ? 'केमिस्ट को भेजें (WhatsApp)'
                : language === 'bn'
                ? 'দোকানে পাঠান (WhatsApp)'
                : 'Order via Chemist (WhatsApp)'}
            </span>
          </button>

          <button
            onClick={() => setShowAddMedModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>
              {language === 'hi'
                ? 'दवा जोड़ें'
                : language === 'bn'
                ? 'ওষুধ যোগ'
                : 'Add Med to Buy'}
            </span>
          </button>

          <button
            onClick={() => setShowAddRxModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>
              {language === 'hi'
                ? 'प्रिस्क्रिप्शन जोड़ें'
                : language === 'bn'
                ? 'প্রেসক্রিপশন যোগ'
                : 'Upload Prescription'}
            </span>
          </button>
        </div>
      </div>

      {copiedChemistToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Prescription order copied & opening WhatsApp to Sanjivani Medical Store!</span>
        </div>
      )}

      {/* 1. Meds to Buy Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700">
          <span className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-amber-600" />
            <span>
              {language === 'hi'
                ? 'दवाईयां जो खरीदनी हैं (Meds List to Buy)'
                : language === 'bn'
                ? 'যে ওষুধগুলো কিনতে হবে (Meds to Buy)'
                : 'Medicines to Buy & Refills Needed'}
            </span>
          </span>
          <span className="text-slate-500 font-normal capitalize">
            {neededCount} needed right now
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {medsToBuy.map((med) => {
            const isReceived = med.status === 'received';
            const isOrdered = med.status === 'ordered';

            return (
              <div
                key={med.id}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                  isReceived
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : med.urgency === 'high'
                    ? 'bg-rose-50/50 border-rose-300 shadow-xs'
                    : 'bg-amber-50/40 border-amber-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        med.urgency === 'high'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : med.urgency === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {med.urgency === 'high' ? 'High Urgency' : med.urgency === 'medium' ? 'Refill Soon' : 'Routine'}
                    </span>

                    <span className="font-mono font-bold text-slate-900 text-xs">
                      ₹{med.estimatedCost}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                    {med.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <strong>{med.quantity}</strong> • {med.dosage}
                  </p>
                  {med.prescribedBy && (
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Prescribed: {med.prescribedBy}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/80">
                  {!isReceived ? (
                    <>
                      <button
                        onClick={() =>
                          onUpdateMedicineStatus(med.id, isOrdered ? 'received' : 'ordered')
                        }
                        className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                          isOrdered
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
                        }`}
                      >
                        {isOrdered ? 'Mark Received ✓' : 'Mark Ordered'}
                      </button>

                      <button
                        onClick={() => onSyncToKiranaList(med.name, med.quantity)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-[11px] font-bold cursor-pointer"
                        title="Add to daily Kirana list"
                      >
                        + Kirana
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Stock Received ✓</span>
                    </span>
                  )}

                  <button
                    onClick={() => onDeleteMedicineToBuy(med.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Doctor Prescription Vault */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>
            {language === 'hi'
              ? 'सक्रिय डॉक्टर प्रिस्क्रिप्शन (Prescription Vault)'
              : language === 'bn'
              ? 'ডাক্তারের প্রেসক্রিপশন ভল্ট (Prescriptions)'
              : 'Active Prescriptions Vault'}
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h5 className="font-extrabold text-sm text-slate-900">{rx.doctorName}</h5>
                  <span className="text-xs font-medium text-slate-500 block">
                    {rx.clinicOrHospital} • <span className="font-mono">{rx.date}</span>
                  </span>
                </div>
                <span className="p-1.5 rounded-xl bg-white border border-slate-200 text-indigo-600 shadow-2xs">
                  <FileText className="w-4 h-4" />
                </span>
              </div>

              {/* Prescribed Meds Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Prescribed Medicines:
                </span>
                <div className="space-y-1">
                  {rx.prescribedMedicines.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-800">{m.name}</strong>
                        <span className="text-[11px] text-slate-400 block">{m.frequency}</span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {m.dosage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {rx.notes && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900">
                  <strong>Doctor Advice:</strong> {rx.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Pharmacy Quick Commerce Direct Ordering */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-purple-950 uppercase tracking-wider">
              Instant Pharmacy Doorstep Delivery
            </h5>
            <p className="text-xs text-purple-800 mt-0.5">
              Order directly on verified pharmacy apps with upload prescription support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://www.apollopharmacy.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold flex items-center gap-1 shadow-2xs"
          >
            <span>Apollo 24/7</span>
            <ExternalLink className="w-3 h-3 text-purple-600" />
          </a>
          <a
            href="https://www.1mg.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold flex items-center gap-1 shadow-2xs"
          >
            <span>Tata 1mg</span>
            <ExternalLink className="w-3 h-3 text-purple-600" />
          </a>
        </div>
      </div>

      {/* Modal: Add Med to Buy */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Pill className="w-5 h-5 text-amber-600" />
                <span>Add Medicine to Buy</span>
              </h3>
              <button
                onClick={() => setShowAddMedModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMedToBuy} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metformin 500mg, Shelcal 500, Dolo 650..."
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Dosage / Form
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg Tab, Syrup"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Quantity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Strips, 1 Bottle"
                    value={medQty}
                    onChange={(e) => setMedQty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Urgency
                  </label>
                  <select
                    value={medUrgency}
                    onChange={(e) => setMedUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold bg-white"
                  >
                    <option value="high">🔴 High (Needed Today)</option>
                    <option value="medium">🟡 Medium (This Week)</option>
                    <option value="routine">🟢 Routine Backup</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Est. Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={medCost}
                    onChange={(e) => setMedCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black shadow-md cursor-pointer"
                >
                  Add to Buy List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Prescription */}
      {showAddRxModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Upload / Record Prescription</span>
              </h3>
              <button
                onClick={() => setShowAddRxModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Doctor Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Alok Verma, MD"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Clinic / Hospital
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Max Hospital, Saket"
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Prescription Date
                </label>
                <input
                  type="text"
                  value={rxDate}
                  onChange={(e) => setRxDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              {/* Prescribed Medicine Adder */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">
                  Add Prescribed Medicines:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Medicine name"
                    value={medRowName}
                    onChange={(e) => setMedRowName(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (1 Tab)"
                    value={medRowDosage}
                    onChange={(e) => setMedRowDosage(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Timing (Morning)"
                      value={medRowFreq}
                      onChange={(e) => setMedRowFreq(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddMedRowToRx}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {prescribedList.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {prescribedList.map((m, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] p-1.5 rounded-lg bg-white border border-slate-200 flex justify-between"
                      >
                        <span>
                          <strong>{m.name}</strong> ({m.dosage})
                        </span>
                        <span className="text-slate-500">{m.frequency}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Doctor Advice / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Low sodium diet, take after meals, check BP daily..."
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRxModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md cursor-pointer"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
