import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  Check,
  AlertCircle,
  Sparkles,
  ChefHat,
  ShoppingCart,
  RefreshCw,
  Layers,
  FlipHorizontal,
  UploadCloud,
  CheckCircle2,
  Video,
  KeyRound,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';
import { DetectedFridgeItem, ShoppingItem, PantryItem, ScanResponse } from '../types';
import { scanFridgeWithBackend, getGeminiKeyConfig, saveGeminiApiKey } from '../utils/api';

interface FridgeScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyInventory: (items: DetectedFridgeItem[]) => void;
  onAddToShopping: (items: Omit<ShoppingItem, 'id'>[]) => void;
}

const PRESET_DEMO_SCANS: { title: string; image: string; items: DetectedFridgeItem[]; recipe: any }[] = [
  {
    title: 'Family Refrigerator (Main Rack)',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    items: [
      { name: 'Amul Taaza Milk', localName: 'Milk (1L)', category: 'dairy', level: 'low', confidence: 0.96, shelfLocation: 'Door rack bottom' },
      { name: 'Fresh Tomatoes', localName: 'Tomatoes (Country)', category: 'vegetables', level: 'low', confidence: 0.91, shelfLocation: 'Crisper drawer', note: '2 left, need restock' },
      { name: 'Curd / Dahi', localName: 'Dahi (400g tub)', category: 'dairy', level: 'half', confidence: 0.94, shelfLocation: 'Middle shelf' },
      { name: 'Steel Dabba', localName: 'Chana Dal (चना दाल)', category: 'staples', level: 'half', confidence: 0.82, shelfLocation: 'Top shelf steel container', isUncertain: true, note: 'Memory Match: User labeled as Chana Dal' },
      { name: 'Farm Eggs (6 pcs)', localName: 'Eggs', category: 'dairy', level: 'plenty', confidence: 0.98, shelfLocation: 'Egg tray' },
      { name: 'Green Chillies & Ginger', localName: 'Chillies', category: 'vegetables', level: 'plenty', confidence: 0.89, shelfLocation: 'Crisper basket' },
    ],
    recipe: {
      title: 'Quick Dahi Aloo & Hot Phulka',
      costEstimate: '₹42 total',
      readyInMinutes: 15,
      ingredientsNeeded: ['Potatoes', 'Curd', 'Green Chillies', 'Spices'],
    },
  },
  {
    title: 'Hostel Mini-Fridge & Snack Shelf',
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
    items: [
      { name: 'Bread Loaf', localName: 'Sandwich Bread', category: 'staples', level: 'low', confidence: 0.94, shelfLocation: 'Top rack', note: '2 slices remaining' },
      { name: 'Eggs', localName: 'Eggs (4 left)', category: 'dairy', level: 'half', confidence: 0.97, shelfLocation: 'Door pocket' },
      { name: 'Amul Butter', localName: 'Butter Pack', category: 'dairy', level: 'low', confidence: 0.88, shelfLocation: 'Side tray' },
      { name: 'Maggi Packets', localName: 'Maggi Noodles (2 pkts)', category: 'snacks', level: 'plenty', confidence: 0.99, shelfLocation: 'Shelf 1' },
    ],
    recipe: {
      title: 'Spicy Egg Bhurji Toast',
      costEstimate: '₹28 total',
      readyInMinutes: 8,
      ingredientsNeeded: ['Eggs', 'Bread', 'Butter', 'Chillies'],
    },
  },
];

export const FridgeScanModal: React.FC<FridgeScanModalProps> = ({
  isOpen,
  onClose,
  onApplyInventory,
  onAddToShopping,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'preset'>('camera');
  const [selectedScanIdx, setSelectedScanIdx] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  // Gemini API Key management
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showKeyDrawer, setShowKeyDrawer] = useState(false);
  const [aiScanStatusNotice, setAiScanStatusNotice] = useState<string | null>(null);

  // Custom Item manual addition
  const [isAddingCustomItem, setIsAddingCustomItem] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState<PantryItem['category']>('vegetables');
  const [customItemLevel, setCustomItemLevel] = useState<DetectedFridgeItem['level']>('low');

  const [detectedItems, setDetectedItems] = useState<DetectedFridgeItem[]>(
    PRESET_DEMO_SCANS[0].items
  );
  const [recipeIdea, setRecipeIdea] = useState<any>(PRESET_DEMO_SCANS[0].recipe);
  const [opaqueDabbaConfirmed, setOpaqueDabbaConfirmed] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Check Gemini Key status
  useEffect(() => {
    if (isOpen) {
      getGeminiKeyConfig().then((cfg) => {
        setGeminiConfigured(cfg.configured);
      });
    }
  }, [isOpen]);

  // Initialize Camera when camera tab is selected
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser. Please use photo upload.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn('Video play warning:', err));
      }
    } catch (err: any) {
      console.warn('Unable to access device camera:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow camera access in your browser or use the Upload tab.'
          : 'No camera hardware found or device in use. Please select a Preset or Upload a photo.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCaptureSnapshot = async () => {
    if (!videoRef.current) return;

    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCustomImage(dataUrl);

      canvas.toBlob(async (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          await processImageScan(blob);
        }
      }, 'image/jpeg');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        setCustomImage(reader.result as string);
        setCapturedBlob(file);
        await processImageScan(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageScan = async (fileOrBlob: Blob | File) => {
    setIsAnalyzing(true);
    setAiScanStatusNotice(null);

    // Call Fastify backend API
    const backendResult = await scanFridgeWithBackend(fileOrBlob);

    if (backendResult) {
      if (backendResult.isRealAi) {
        setAiScanStatusNotice('✨ Analyzed with live Google Gemini 1.5 Flash Vision!');
      } else if (backendResult.notice) {
        setAiScanStatusNotice(backendResult.notice);
      } else if (backendResult.errorNotice) {
        setAiScanStatusNotice(backendResult.errorNotice);
      }

      if (backendResult.detectedItems && backendResult.detectedItems.length > 0) {
        setDetectedItems(backendResult.detectedItems);
      }
      if (backendResult.recipeIdea) {
        setRecipeIdea(backendResult.recipeIdea);
      }
    }

    setIsAnalyzing(false);
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    setIsSavingKey(true);
    const res = await saveGeminiApiKey(keyInput.trim());
    setIsSavingKey(false);

    if (res.success) {
      setGeminiConfigured(true);
      setShowKeyDrawer(false);
      setAiScanStatusNotice('✓ Gemini Vision Key activated! Re-scanning your photo now...');

      if (capturedBlob) {
        await processImageScan(capturedBlob);
      }
    } else {
      alert(`Error saving key: ${res.message}`);
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;

    const newItem: DetectedFridgeItem = {
      name: customItemName.trim(),
      localName: customItemName.trim(),
      category: customItemCategory,
      level: customItemLevel,
      confidence: 0.99,
      shelfLocation: 'Manual Tag',
      note: 'Added by user',
    };

    setDetectedItems((prev) => [newItem, ...prev]);
    setCustomItemName('');
    setIsAddingCustomItem(false);
  };

  const handleDeleteDetectedItem = (idx: number) => {
    setDetectedItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddLowItemsToShopping = () => {
    const lowItems = detectedItems.filter((item) => item.level === 'low');
    const itemsToAdd = lowItems.length > 0 ? lowItems : detectedItems;

    const newItems: Omit<ShoppingItem, 'id'>[] = itemsToAdd.map((item) => ({
      title: item.name,
      localTitle: item.localName,
      quantity: '1 unit / 1 kg',
      category: item.category,
      addedBy: `Fridge Scan (${item.level.toUpperCase()} level detected)`,
      status: 'pending',
      reason: 'scan',
    }));

    onAddToShopping(newItems);
    onApplyInventory(detectedItems);
    setSuccessMessage(`Added ${newItems.length} items to your Kirana grocery list!`);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Multimodal AI Fridge & Pantry Scanner</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {geminiConfigured ? 'Gemini 1.5 Vision Active' : 'Simulation Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live camera viewfinder, dabba memory, and automated Kirana refills
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyDrawer(!showKeyDrawer)}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                geminiConfigured
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30 animate-pulse'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{geminiConfigured ? 'AI Key Connected' : 'Connect Gemini Key'}</span>
            </button>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gemini API Key Drawer / Configuration Notice */}
        {(showKeyDrawer || (!geminiConfigured && customImage)) && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 shrink-0 transition-all animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Connect Google Gemini Vision to Read Your Real Pictures</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  HomeMate uses Google Gemini 1.5 Flash Vision to inspect pictures. Without an API key,
                  it uses realistic sample data. Getting a key is 100% free and takes 30 seconds:
                </p>
              </div>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <span>Get Free Key (Google AI Studio)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <form onSubmit={handleSaveApiKey} className="flex gap-2 mt-3">
              <input
                type="password"
                placeholder="Paste your Gemini API key (AIzaSy...)"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              <button
                type="submit"
                disabled={isSavingKey}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                {isSavingKey ? 'Activating...' : 'Save & Analyze'}
              </button>
            </form>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* AI Scan Status Alert */}
          {aiScanStatusNotice && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn border ${
                geminiConfigured
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{aiScanStatusNotice}</span>
            </div>
          )}

          {/* Input Method Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-2xl">
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveTab('camera');
                  setCustomImage(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Device Camera</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('upload');
                  stopCamera();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5 text-brand-600" />
                <span>Upload Photo</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('preset');
                  stopCamera();
                  setCustomImage(null);
                  setDetectedItems(PRESET_DEMO_SCANS[selectedScanIdx].items);
                  setRecipeIdea(PRESET_DEMO_SCANS[selectedScanIdx].recipe);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'preset'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Presets (Demo)</span>
              </button>
            </div>

            {/* Presets Sub-menu */}
            {activeTab === 'preset' && (
              <div className="flex items-center gap-1">
                {PRESET_DEMO_SCANS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedScanIdx(idx);
                      setDetectedItems(preset.items);
                      setRecipeIdea(preset.recipe);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      selectedScanIdx === idx
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {preset.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* VIEWPORT AREA */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-900 bg-slate-950 aspect-video flex items-center justify-center">
            {/* 1. Camera Viewfinder */}
            {activeTab === 'camera' && !customImage && (
              <>
                {isCameraActive ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Scanning Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                      <div className="w-full h-full border-2 border-dashed border-emerald-400/60 rounded-2xl relative animate-pulse">
                        <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded">
                          AI SCAN ZONE • 60 FPS
                        </div>
                        <div className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded">
                          CONTAINER RECOGNITION ACTIVE
                        </div>
                      </div>
                    </div>

                    {/* Camera Control Overlay */}
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                      <button
                        onClick={handleFlipCamera}
                        className="p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 transition-all shadow-lg active:scale-95 cursor-pointer"
                        title="Flip Camera"
                      >
                        <FlipHorizontal className="w-5 h-5" />
                      </button>

                      {/* Giant Shutter Button */}
                      <button
                        onClick={handleCaptureSnapshot}
                        className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 p-1 flex items-center justify-center shadow-2xl transition-all transform active:scale-90 ring-4 ring-emerald-500/80 cursor-pointer"
                        title="Capture & Scan"
                      >
                        <div className="w-13 h-13 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                          <Camera className="w-7 h-7" />
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-300 max-w-md">
                    <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-white mb-1">Camera Stream Not Active</p>
                    <p className="text-xs text-slate-400 mb-4">{cameraError || 'Click below to start camera access'}</p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        Enable Camera
                      </button>
                      <button
                        onClick={() => setActiveTab('preset')}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 cursor-pointer"
                      >
                        Use Demo Preset
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 2. Upload photo tab */}
            {activeTab === 'upload' && !customImage && (
              <label className="cursor-pointer flex flex-col items-center justify-center p-8 text-center text-slate-400 hover:text-slate-200 transition-colors">
                <UploadCloud className="w-14 h-14 text-emerald-400 mb-3 animate-bounce" />
                <span className="text-sm font-bold text-white">Click or drag a photo of your fridge</span>
                <span className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP supported (up to 15MB)</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            )}

            {/* 3. Preset image or captured photo preview */}
            {(customImage || activeTab === 'preset') && (
              <div className="relative w-full h-full">
                <img
                  src={customImage || PRESET_DEMO_SCANS[selectedScanIdx].image}
                  alt="Scanned Shelf"
                  className="w-full h-full object-cover"
                />

                {/* Overlaid Detected Badges */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 pointer-events-none">
                  {detectedItems.slice(0, 4).map((item, idx) => (
                    <div
                      key={idx}
                      className="pointer-events-auto bg-slate-950/85 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1.5 shadow-lg"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.level === 'low'
                            ? 'bg-rose-400 animate-ping'
                            : item.level === 'half'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span className="font-bold">{item.name}</span>
                      <span className="text-slate-400 font-mono">
                        ({Math.round(item.confidence * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>

                {/* Retake button */}
                {customImage && (
                  <button
                    onClick={() => {
                      setCustomImage(null);
                      setCapturedBlob(null);
                      if (activeTab === 'camera') startCamera();
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>
                )}
              </div>
            )}

            {/* Shutter Flash Animation */}
            {flashActive && <div className="absolute inset-0 bg-white transition-opacity duration-200" />}

            {/* Scanning Radar Overlay when Analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                <RefreshCw className="w-12 h-12 animate-spin text-emerald-400 mb-3" />
                <p className="font-black text-lg">
                  {geminiConfigured
                    ? 'Google Gemini Vision Reading Image...'
                    : 'Fastify Multimodal Engine Processing...'}
                </p>
                <p className="text-xs text-emerald-200 mt-1">
                  Detecting grocery items, quantities & containers
                </p>
              </div>
            )}
          </div>

          {/* Opaque Steel Dabba Memory Match Alert */}
          {detectedItems.some((i) => i.isUncertain) && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950">
                    Opaque Steel Dabba Memory Match
                  </h4>
                  <p className="text-xs text-amber-800">
                    Stainless steel container on Top Shelf is remembered as{' '}
                    <strong>Chana Dal (चना दाल)</strong>. Is this correct?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setOpaqueDabbaConfirmed(true)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    opaqueDabbaConfirmed
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {opaqueDabbaConfirmed ? '✓ Confirmed' : 'Yes, Confirm'}
                </button>
                <button
                  onClick={() => {
                    const renamed = prompt('What is in this steel dabba?', 'Masoor Dal');
                    if (renamed) {
                      setDetectedItems((prev) =>
                        prev.map((i) =>
                          i.isUncertain
                            ? { ...i, localName: renamed, name: renamed, isUncertain: false }
                            : i
                        )
                      );
                    }
                  }}
                  className="text-xs px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100 cursor-pointer"
                >
                  Edit Label
                </button>
              </div>
            </div>
          )}

          {/* Detected Items Grid with Tagging */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recognized Items ({detectedItems.length} items)
              </h3>

              <button
                onClick={() => setIsAddingCustomItem(!isAddingCustomItem)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingCustomItem ? 'Cancel' : 'Tag / Add Item'}</span>
              </button>
            </div>

            {/* Manual Tag & Add Item Form */}
            {isAddingCustomItem && (
              <form
                onSubmit={handleAddCustomItem}
                className="p-3 mb-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center gap-2 animate-fadeIn"
              >
                <input
                  type="text"
                  placeholder="Item name (e.g. Green Apples, Coke Can)..."
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                />

                <select
                  value={customItemCategory}
                  onChange={(e) => setCustomItemCategory(e.target.value as any)}
                  className="text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-white cursor-pointer"
                >
                  <option value="vegetables">Vegetables</option>
                  <option value="dairy">Dairy & Eggs</option>
                  <option value="staples">Staples</option>
                  <option value="snacks">Snacks</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={customItemLevel}
                  onChange={(e) => setCustomItemLevel(e.target.value as any)}
                  className="text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-white cursor-pointer"
                >
                  <option value="low">Low Stock</option>
                  <option value="half">Half</option>
                  <option value="plenty">Plenty</option>
                </select>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  Add Item
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {detectedItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    item.level === 'low'
                      ? 'bg-rose-50/70 border-rose-200'
                      : item.level === 'half'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>{item.name}</span>
                      {item.note && <span className="text-[10px] text-slate-500 font-normal">({item.note})</span>}
                    </div>
                    <span className="text-[11px] text-slate-500">{item.shelfLocation}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                        item.level === 'low'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : item.level === 'half'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.level}
                    </span>

                    <button
                      onClick={() => handleDeleteDetectedItem(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove from scan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recipe Suggestion from Available Items */}
          {recipeIdea && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                  Shelf-to-Table Recipe Idea
                </h4>
                <div className="text-sm font-bold text-indigo-900 mt-0.5">{recipeIdea.title}</div>
                <p className="text-xs text-indigo-800 mt-0.5">
                  Est. {recipeIdea.costEstimate} • Ready in {recipeIdea.readyInMinutes} mins • Uses:{' '}
                  {recipeIdea.ingredientsNeeded.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-600 text-white text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500">
            {detectedItems.length} items detected ({detectedItems.filter((i) => i.level === 'low').length} low stock)
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleAddLowItemsToShopping}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add Items to Kirana List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
