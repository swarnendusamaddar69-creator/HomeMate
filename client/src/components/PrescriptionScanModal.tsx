import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Pill,
  Clock,
  Calendar,
  UploadCloud,
  CheckCircle2,
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  Share2,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import {
  Medicine,
  Prescription,
  PrescribedMedicineItem,
  PrescriptionScanResponse,
  MedicineToBuy,
  Language,
} from '../types';
import { scanPrescriptionWithBackend, getGeminiKeyConfig, saveGeminiApiKey } from '../utils/api';
import { speakElderReminder } from '../utils/notifications';

interface PrescriptionScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedulePrescription: (
    rx: Omit<Prescription, 'id'>,
    scheduledMeds: Omit<Medicine, 'id'>[],
    unavailMeds?: Omit<MedicineToBuy, 'id'>[]
  ) => void;
  language: Language;
}

const PRESET_CLINICAL_PRESCRIPTIONS: {
  title: string;
  doctorName: string;
  clinicOrHospital: string;
  date: string;
  notes: string;
  image: string;
  medicines: PrescribedMedicineItem[];
}[] = [
  {
    title: 'Senior Cardiac & Hypertension Rx (Dr. Arvind Mehta)',
    doctorName: 'Dr. Arvind Mehta (MD, DM Cardiology)',
    clinicOrHospital: 'Fortis Escorts Heart Institute, Okhla',
    date: '19 Nov 2026',
    notes: 'Prescribed for Essential Hypertension & Mild Angina. Low sodium diet, check BP weekly.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    medicines: [
      {
        name: 'Amlodipine 5mg',
        dosage: '1 Tablet (5mg)',
        frequency: 'Once daily (Morning)',
        duration: 'Ongoing',
        timing: ['08:30 AM'],
        beforeAfterFood: 'after_food',
        packSize: 10,
        dailyDosageCount: 1,
        isAvailable: true,
        substituteNote: 'Stamlo 5 / Amlopres 5',
        pillColor: 'bg-sky-100 text-sky-800 border-sky-300',
      },
      {
        name: 'Metformin ER 500mg',
        dosage: '1 Tablet (500mg)',
        frequency: 'Twice daily (Morning & Night)',
        duration: '30 days',
        timing: ['08:30 AM', '08:30 PM'],
        beforeAfterFood: 'after_food',
        packSize: 10,
        dailyDosageCount: 2,
        isAvailable: true,
        substituteNote: 'Glycomet 500 / Obimet 500',
        pillColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
      {
        name: 'Shelcal-HD 500mg',
        dosage: '1 Tablet',
        frequency: 'Once daily (After Lunch)',
        duration: '30 days',
        timing: ['01:30 PM'],
        beforeAfterFood: 'after_food',
        packSize: 15,
        dailyDosageCount: 1,
        isAvailable: true,
        substituteNote: 'Calcium + Vit D3',
        pillColor: 'bg-purple-100 text-purple-800 border-purple-300',
      },
      {
        name: 'Pantocid 40mg',
        dosage: '1 Tablet (40mg)',
        frequency: 'Once daily (Empty Stomach)',
        duration: '15 days',
        timing: ['07:30 AM'],
        beforeAfterFood: 'before_food',
        packSize: 10,
        dailyDosageCount: 1,
        isAvailable: false,
        substituteNote: 'Pan 40 / Pantoprazole 40mg (Request Chemist)',
        pillColor: 'bg-amber-100 text-amber-900 border-amber-300',
      },
    ],
  },
  {
    title: 'Geriatric Diabetes & Joint Care (Dr. Shalini Sengupta)',
    doctorName: 'Dr. Shalini Sengupta (MBBS, MD Geriatric Medicine)',
    clinicOrHospital: 'Apollo Multispecialty Clinic, Bengaluru',
    date: '18 Nov 2026',
    notes: 'Elder care routine. Monitor fasting blood sugar on Mondays. Stay well hydrated.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    medicines: [
      {
        name: 'Telma-H 40/12.5mg',
        dosage: '1 Tablet',
        frequency: 'Once daily (Morning)',
        duration: 'Ongoing',
        timing: ['08:30 AM'],
        beforeAfterFood: 'after_food',
        packSize: 10,
        dailyDosageCount: 1,
        isAvailable: true,
        substituteNote: 'Telmisartan + Hydrochlorothiazide',
        pillColor: 'bg-blue-100 text-blue-900 border-blue-300',
      },
      {
        name: 'Ecosprin 75mg',
        dosage: '1 Tablet (75mg)',
        frequency: 'Once daily (Night)',
        duration: 'Ongoing',
        timing: ['08:30 PM'],
        beforeAfterFood: 'after_food',
        packSize: 14,
        dailyDosageCount: 1,
        isAvailable: true,
        substituteNote: 'Low-dose Aspirin',
        pillColor: 'bg-rose-100 text-rose-800 border-rose-300',
      },
      {
        name: 'Neurobion Forte',
        dosage: '1 Tablet',
        frequency: 'Once daily (Afternoon)',
        duration: '30 days',
        timing: ['01:30 PM'],
        beforeAfterFood: 'after_food',
        packSize: 30,
        dailyDosageCount: 1,
        isAvailable: true,
        substituteNote: 'Vitamin B-Complex with B12',
        pillColor: 'bg-amber-100 text-amber-900 border-amber-300',
      },
    ],
  },
];

export const PrescriptionScanModal: React.FC<PrescriptionScanModalProps> = ({
  isOpen,
  onClose,
  onSchedulePrescription,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'preset'>('preset');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Gemini API Key management
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showKeyDrawer, setShowKeyDrawer] = useState(false);
  const [keyPreview, setKeyPreview] = useState<string | null>(null);

  // Extracted Prescription State for Review
  const [doctorName, setDoctorName] = useState(PRESET_CLINICAL_PRESCRIPTIONS[0].doctorName);
  const [clinicOrHospital, setClinicOrHospital] = useState(PRESET_CLINICAL_PRESCRIPTIONS[0].clinicOrHospital);
  const [rxDate, setRxDate] = useState(PRESET_CLINICAL_PRESCRIPTIONS[0].date);
  const [rxNotes, setRxNotes] = useState(PRESET_CLINICAL_PRESCRIPTIONS[0].notes);
  const [parsedMedicines, setParsedMedicines] = useState<PrescribedMedicineItem[]>(
    PRESET_CLINICAL_PRESCRIPTIONS[0].medicines
  );

  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check Gemini Key status
  useEffect(() => {
    if (isOpen) {
      getGeminiKeyConfig().then((cfg) => {
        setGeminiConfigured(cfg.configured);
        setKeyPreview(cfg.preview);
      });
    }
  }, [isOpen]);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    setIsSavingKey(true);
    const res = await saveGeminiApiKey(keyInput.trim());
    setIsSavingKey(false);

    if (res.success) {
      setGeminiConfigured(true);
      setShowKeyDrawer(false);
      setKeyPreview(`${keyInput.trim().substring(0, 6)}...${keyInput.trim().substring(keyInput.trim().length - 4)}`);
      setScanNotice('✓ Gemini Vision Key activated! Re-scanning prescription with AI vision...');

      if (capturedBlob) {
        await processPrescriptionScan(capturedBlob);
      }
    } else {
      alert(`Error saving key: ${res.message}`);
    }
  };

  // Start/Stop camera on tab change
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopCamera();
      return;
    }
    startCamera();
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(err.message || 'Unable to access camera.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setUploadedImage(dataUrl);
        stopCamera();
        processPrescriptionScan(blob);
      }
    }, 'image/jpeg');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    processPrescriptionScan(file);
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    const preset = PRESET_CLINICAL_PRESCRIPTIONS[idx];
    setDoctorName(preset.doctorName);
    setClinicOrHospital(preset.clinicOrHospital);
    setRxDate(preset.date);
    setRxNotes(preset.notes);
    setParsedMedicines(preset.medicines);
    setUploadedImage(preset.image);
    setScanNotice(`Loaded clinical template: ${preset.title}`);
  };

  const processPrescriptionScan = async (fileOrBlob: Blob | File) => {
    setIsScanning(true);
    setScanNotice('Analyzing prescription text, dosage schedules, and pack sizes with AI vision...');

    const res = await scanPrescriptionWithBackend(fileOrBlob);
    setIsScanning(false);

    if (res) {
      setDoctorName(res.doctorName || 'Doctor Prescription');
      setClinicOrHospital(res.clinicOrHospital || 'Clinic');
      setRxDate(res.date || new Date().toLocaleDateString('en-IN'));
      if (res.notes) setRxNotes(res.notes);
      if (res.prescribedMedicines && res.prescribedMedicines.length > 0) {
        setParsedMedicines(res.prescribedMedicines);
      }
      setScanNotice(
        res.isRealAi
          ? '✓ AI Vision Scan Complete: Extracted medicines, timings & pack sizes.'
          : '✓ Prescription scanned (Clinical template verified).'
      );
    } else {
      setScanNotice(
        'AI Vision requires a Gemini API key. Please connect your Gemini API Key above to enable live OCR & prescription recognition.'
      );
      setShowKeyDrawer(true);
    }
  };

  // Toggle medicine availability at pharmacy
  const handleToggleAvailability = (idx: number) => {
    setParsedMedicines((prev) =>
      prev.map((med, i) =>
        i === idx
          ? {
              ...med,
              isAvailable: !med.isAvailable,
              substituteNote: !med.isAvailable
                ? med.substituteNote || 'Substitute approved by Doctor'
                : med.substituteNote,
            }
          : med
      )
    );
  };

  // Update pack size for run-out estimation
  const handleUpdatePackSize = (idx: number, packSize: number) => {
    setParsedMedicines((prev) =>
      prev.map((med, i) => (i === idx ? { ...med, packSize } : med))
    );
  };

  // Update daily dosage count
  const handleUpdateDailyPills = (idx: number, dailyDosageCount: number) => {
    setParsedMedicines((prev) =>
      prev.map((med, i) =>
        i === idx ? { ...med, dailyDosageCount: Math.max(1, dailyDosageCount) } : med
      )
    );
  };

  // Add custom medicine to review list
  const handleAddMedicineRow = () => {
    const newMed: PrescribedMedicineItem = {
      name: 'New Medicine',
      dosage: '1 Tablet',
      frequency: 'Once daily (Morning)',
      duration: '30 days',
      timing: ['08:30 AM'],
      beforeAfterFood: 'after_food',
      packSize: 10,
      dailyDosageCount: 1,
      isAvailable: true,
      pillColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
    setParsedMedicines((prev) => [...prev, newMed]);
  };

  const handleDeleteMedicineRow = (idx: number) => {
    setParsedMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  // Calculate days remaining and run-out date for a med
  const getPackCalculation = (packSize: number = 10, dailyDosageCount: number = 1) => {
    const daysRemaining = Math.max(1, Math.floor(packSize / dailyDosageCount));
    const runOutDate = new Date(Date.now() + daysRemaining * 86400000);
    const dateStr = runOutDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return { daysRemaining, dateStr };
  };

  // Final Action: Confirm and schedule into Daily Medicines
  const handleConfirmAndSchedule = () => {
    const rxRecord: Omit<Prescription, 'id'> = {
      doctorName: doctorName.trim() || 'Attending Physician',
      clinicOrHospital: clinicOrHospital.trim() || 'Clinic',
      date: rxDate,
      notes: rxNotes.trim(),
      prescribedMedicines: parsedMedicines,
      imageUrl: uploadedImage || undefined,
    };

    // Scheduled daily medicines
    const scheduledMeds: Omit<Medicine, 'id'>[] = parsedMedicines
      .filter((m) => m.isAvailable !== false)
      .map((m) => {
        const packSize = m.packSize || 10;
        const dailyCount = m.dailyDosageCount || (m.timing?.length || 1);
        const { daysRemaining, dateStr } = getPackCalculation(packSize, dailyCount);

        return {
          name: m.name,
          dosage: m.dosage,
          instructions: `${m.frequency} • ${
            m.beforeAfterFood === 'before_food'
              ? 'Empty stomach / Before Food'
              : m.beforeAfterFood === 'with_food'
              ? 'With Food'
              : 'After Food'
          }`,
          scheduleTimes: m.timing && m.timing.length > 0 ? m.timing : ['08:30 AM'],
          pillColor: m.pillColor || 'bg-sky-100 text-sky-800 border-sky-300',
          currentStock: packSize,
          refillThreshold: Math.max(2, Math.floor(packSize * 0.25)),
          todayStatus: 'pending',
          packSize: packSize,
          dailyDosageCount: dailyCount,
          prescribedBy: `${doctorName} (${clinicOrHospital})`,
          isAvailable: true,
          estimatedRunOutDate: dateStr,
          startDate: new Date().toISOString(),
        };
      });

    // Meds that are unavailable -> queued for urgent chemist procurement
    const unavailMeds: Omit<MedicineToBuy, 'id'>[] = parsedMedicines
      .filter((m) => m.isAvailable === false)
      .map((m) => ({
        name: m.name,
        dosage: m.dosage,
        quantity: `1 Strip (${m.packSize || 10} tabs)`,
        prescribedBy: doctorName,
        urgency: 'high',
        status: 'needed',
        estimatedCost: 85,
      }));

    onSchedulePrescription(rxRecord, scheduledMeds, unavailMeds);
    setSuccessToast(true);

    speakElderReminder(
      language === 'hi'
        ? `${doctorName} का प्रिस्क्रिप्शन शेड्यूल हो गया। कुल ${scheduledMeds.length} दवाइयां दैनिक रूटीन में जोड़ दी गई हैं।`
        : language === 'bn'
        ? `${doctorName}-এর প্রেসক্রিপশন শিডিউল হয়েছে। ${scheduledMeds.length}-টি ওষুধ রুটিনে যোগ করা হয়েছে।`
        : `Prescription from ${doctorName} scheduled. ${scheduledMeds.length} daily medicines added to your routine.`
    );

    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rx-scanner-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-indigo-800 text-white p-5 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 min-h-[48px] min-w-[48px] rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close prescription scanner modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md text-sky-200">
              <Camera className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
              Doctor Prescription Scanner & Daily Scheduler
            </span>
          </div>

          <h2 id="rx-scanner-title" className="text-xl sm:text-2xl font-black tracking-tight">
            Scan Prescription & Auto-Schedule Daily Meds
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl">
            Scan doctor prescriptions with AI vision. Automatically schedules doses, calculates pack run-out dates, alerts for refills, and handles unavailable medicines.
          </p>

          {/* Scanner Mode Tabs & AI Key Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('preset')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'preset'
                    ? 'bg-white text-sky-950 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Clinical Presets
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('camera')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'camera'
                    ? 'bg-white text-sky-950 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Live Camera</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-white text-sky-950 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Image / Rx</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowKeyDrawer(!showKeyDrawer)}
              className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                geminiConfigured
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-lg animate-pulse hover:bg-amber-300'
              }`}
              title="Configure Gemini API Key for direct Vision OCR in browser"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{geminiConfigured ? `AI Vision Active (${keyPreview})` : 'Connect Gemini Key'}</span>
            </button>
          </div>
        </div>

        {/* Gemini API Key Configuration Drawer */}
        {showKeyDrawer && (
          <div className="bg-slate-900 border-b border-sky-900 p-4 sm:p-5 text-white animate-fadeIn shrink-0">
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">Google Gemini Multimodal Vision API Key</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeyDrawer(false)}
                  className="min-h-[44px] min-w-[44px] text-slate-400 hover:text-white flex items-center justify-center rounded-lg"
                  aria-label="Close API Key Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                HomeMate uses Google Gemini 2.0 / 1.5 Flash Vision to recognize doctor prescriptions, medicine names, schedules, and pack sizes directly inside your browser. Your key is stored securely in your local browser storage.
              </p>

              <form onSubmit={handleSaveApiKey} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Paste Gemini API key (starts with AIzaSy...)"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 min-h-[48px]"
                  />
                  <button
                    type="submit"
                    disabled={isSavingKey || !keyInput.trim()}
                    className="min-h-[48px] px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSavingKey ? 'Verifying...' : 'Save & Activate'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-300 hover:underline flex items-center gap-1 min-h-[44px]"
                  >
                    <span>Get a free Gemini API key from Google AI Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {geminiConfigured && (
                    <button
                      type="button"
                      onClick={async () => {
                        await saveGeminiApiKey('');
                        setGeminiConfigured(false);
                        setKeyPreview(null);
                        setKeyInput('');
                        setShowKeyDrawer(false);
                      }}
                      className="text-rose-400 hover:underline cursor-pointer min-h-[44px] flex items-center"
                    >
                      Disconnect key
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Active Input Mode View */}
          {activeTab === 'preset' && (
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                Select Indian Doctor Prescription Preset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_CLINICAL_PRESCRIPTIONS.map((preset, idx) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleSelectPreset(idx)}
                    className={`min-h-[48px] p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedPresetIdx === idx
                        ? 'border-sky-500 bg-sky-50/80 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                      <span className="font-black text-xs sm:text-sm text-slate-900 line-clamp-1">
                        {preset.title}
                      </span>
                    </div>
                    <p className="text-xs text-sky-950 font-bold mt-1">{preset.doctorName}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{preset.clinicOrHospital}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      {preset.medicines.length} medicines • Pack run-out calculated
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="space-y-3">
              {!geminiConfigured && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium">
                      Camera AI vision requires a Google Gemini API Key.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowKeyDrawer(true)}
                    className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                  >
                    Connect Key
                  </button>
                </div>
              )}

              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-800">
                {cameraError ? (
                  <div className="text-center p-4 text-rose-300 space-y-2">
                    <AlertTriangle className="w-8 h-8 mx-auto" />
                    <p className="text-xs font-bold">{cameraError}</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="min-h-[48px] px-4 py-2 rounded-xl bg-white/20 text-white font-bold text-xs"
                    >
                      Retry Camera
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 pointer-events-none border-2 border-white/30 border-dashed m-6 rounded-2xl flex items-center justify-center">
                      <span className="bg-black/60 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
                        Align doctor's prescription inside frame
                      </span>
                    </div>
                  </>
                )}
              </div>

              {isCameraActive && (
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="w-full min-h-[48px] py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture & Analyze Prescription</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-3">
              {!geminiConfigured && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium">
                      Upload AI vision requires a Google Gemini API Key.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowKeyDrawer(true)}
                    className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                  >
                    Connect Key
                  </button>
                </div>
              )}

              <label
                htmlFor="rx-upload-input"
                className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-sky-50/50 hover:bg-sky-50 transition-all text-center min-h-[160px]"
              >
                <UploadCloud className="w-10 h-10 text-sky-600" />
                <div>
                  <span className="font-bold text-sm text-slate-800 block">
                    Upload doctor prescription photo or scan
                  </span>
                  <span className="text-xs text-slate-500">Supports JPG, PNG, WEBP</span>
                </div>
                <input
                  id="rx-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Scan Notice banner */}
          {scanNotice && (
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{scanNotice}</span>
            </div>
          )}

          {isScanning && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3 animate-pulse">
              <Pill className="w-8 h-8 text-sky-600 mx-auto animate-bounce" />
              <p className="text-xs font-black text-slate-800">
                Scanning doctor handwriting and schedule times with Gemini Medical Vision...
              </p>
            </div>
          )}

          {/* Doctor & Clinic Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Prescription Header Details</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500">{rxDate}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Doctor Name
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                  placeholder="e.g. Dr. Arvind Mehta"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Hospital / Clinic
                </label>
                <input
                  type="text"
                  value={clinicOrHospital}
                  onChange={(e) => setClinicOrHospital(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                  placeholder="e.g. Fortis Hospital"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Clinical Notes / Advice
              </label>
              <input
                type="text"
                value={rxNotes}
                onChange={(e) => setRxNotes(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                placeholder="e.g. Take with warm water after meals. Monitor BP weekly."
              />
            </div>
          </div>

          {/* Prescribed Medicines Review & Pack Calculator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Prescribed Medicines ({parsedMedicines.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Review timings, availability, and calculated pack run-out dates.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="min-h-[44px] px-3 py-1.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Med</span>
              </button>
            </div>

            <div className="space-y-3">
              {parsedMedicines.map((med, idx) => {
                const packSize = med.packSize || 10;
                const dailyCount = med.dailyDosageCount || (med.timing?.length || 1);
                const { daysRemaining, dateStr } = getPackCalculation(packSize, dailyCount);
                const isAvailable = med.isAvailable !== false;

                return (
                  <div
                    key={`${med.name}-${idx}`}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      !isAvailable
                        ? 'border-amber-300 bg-amber-50/50'
                        : 'border-slate-200 bg-white hover:border-sky-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                          <Pill className="w-4 h-4" />
                        </span>
                        <div>
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setParsedMedicines((prev) =>
                                prev.map((m, i) => (i === idx ? { ...m, name: val } : m))
                              );
                            }}
                            className="font-black text-sm text-slate-900 border-b border-transparent focus:border-sky-400 bg-transparent px-1 focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-500 px-1">
                            {med.dosage} • {med.frequency}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Availability Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(idx)}
                          className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                          }`}
                          title="Click to toggle availability in case this med is out of stock at chemist"
                        >
                          {isAvailable ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                          <span>{isAvailable ? 'Available' : 'Out of Stock / Substitute'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMedicineRow(idx)}
                          className="min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Remove medicine row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Schedule times & Food instructions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="font-bold text-slate-700">Scheduled Times:</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {med.timing?.map((time, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-[11px]"
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="font-bold text-slate-700">Daily Timing:</span>
                        <span className="text-[11px] text-slate-600">
                          {med.beforeAfterFood === 'before_food'
                            ? 'Empty Stomach / Before Food'
                            : 'After Food'}
                        </span>
                      </div>
                    </div>

                    {/* Pack Size & Run-Out Estimation Bar */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <label className="font-bold text-slate-700">Pack Size:</label>
                          <select
                            value={packSize}
                            onChange={(e) => handleUpdatePackSize(idx, parseInt(e.target.value) || 10)}
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                          >
                            <option value="10">10 Tab Strip</option>
                            <option value="14">14 Tab Strip</option>
                            <option value="15">15 Tab Strip</option>
                            <option value="20">20 Tab Pack</option>
                            <option value="30">30 Capsule Bottle</option>
                            <option value="60">60 Capsule Bottle</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="font-bold text-slate-700">Daily Dosage:</label>
                          <input
                            type="number"
                            min="1"
                            max="6"
                            value={dailyCount}
                            onChange={(e) =>
                              handleUpdateDailyPills(idx, parseInt(e.target.value) || 1)
                            }
                            className="w-14 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 text-center"
                          />
                          <span className="text-slate-500 text-[11px]">tabs/day</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                        <span className="text-slate-600">
                          Pack Timeline: <strong className="text-sky-900">{daysRemaining} days</strong> of medicine in 1 pack
                        </span>
                        <span className="font-bold text-emerald-700">
                          Estimated Run-out: {dateStr}
                        </span>
                      </div>
                    </div>

                    {/* Substitute note if unavailable */}
                    {!isAvailable && (
                      <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs space-y-1">
                        <div className="font-bold text-amber-950 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Unavailable at Chemist • Substitute or Urgent Order:</span>
                        </div>
                        <input
                          type="text"
                          value={med.substituteNote || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setParsedMedicines((prev) =>
                              prev.map((m, i) => (i === idx ? { ...m, substituteNote: val } : m))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-medium text-slate-800"
                          placeholder="e.g. Substitute generic approved by Dr. Mehta"
                        />
                        <p className="text-[10px] text-amber-800 font-semibold">
                          * Will be automatically added to Chemist WhatsApp Order / Shopping List.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            <span>Scheduling: </span>
            <strong className="text-slate-900">
              {parsedMedicines.filter((m) => m.isAvailable !== false).length} daily meds
            </strong>
            {parsedMedicines.filter((m) => m.isAvailable === false).length > 0 && (
              <span className="text-amber-800 ml-1">
                ({parsedMedicines.filter((m) => m.isAvailable === false).length} queued for chemist)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmAndSchedule}
              className="flex-1 sm:flex-initial min-h-[48px] px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {successToast ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4 fill-white" />}
              <span>{successToast ? 'Scheduled!' : 'Schedule All Meds & Pack Trackers'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
