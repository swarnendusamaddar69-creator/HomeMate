import React from 'react';
import {
  X,
  Sparkles,
  Layers,
  CloudSun,
  Camera,
  Mic,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code2,
  Cpu,
  Palette,
  Lightbulb,
} from 'lucide-react';

interface WidgetSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weatherWidgetEnabled: boolean;
  onToggleWeatherWidget: () => void;
  voiceHudEnabled: boolean;
  onToggleVoiceHud: () => void;
}

export const WidgetSuggestionsModal: React.FC<WidgetSuggestionsModalProps> = ({
  isOpen,
  onClose,
  weatherWidgetEnabled,
  onToggleWeatherWidget,
  voiceHudEnabled,
  onToggleVoiceHud,
}) => {
  if (!isOpen) return null;

  const widgetLibraries = [
    {
      title: 'Free Weather & Environmental Data',
      library: 'Open-Meteo API',
      category: 'Live Data Feed',
      description: 'Zero API keys required. Provides live temperature, humidity, UV index, and air quality.',
      howToUse: 'fetch("https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.20&current=temperature_2m,relative_humidity_2m")',
      link: 'https://open-meteo.com/',
      badge: 'Free & Public',
    },
    {
      title: 'Iconography & Modern Glyphs',
      library: 'Lucide React',
      category: 'UI Components',
      description: 'Over 1,000+ beautifully clean, feather-light icons built specifically for React with SVG rendering.',
      howToUse: 'npm install lucide-react -> import { Camera, Heart, Sparkles } from "lucide-react";',
      link: 'https://lucide.dev/',
      badge: 'Included in HomeMate',
    },
    {
      title: 'UPI Payment QR Generator',
      library: 'qrcode / qrcode.react',
      category: 'Finance & Payments',
      description: 'Generates real-time, vector-crisp QR codes compliant with NPCI UPI standard intent URLs.',
      howToUse: 'QRCode.toDataURL("upi://pay?pa=recipient@bank&am=250&cu=INR")',
      link: 'https://www.npmjs.com/package/qrcode',
      badge: 'Included in HomeMate',
    },
    {
      title: 'Device Camera Vision & Scanner',
      library: 'HTML5 MediaDevices + Canvas',
      category: 'Multimodal Vision',
      description: 'Access phone or webcam streams natively without any third-party app installations.',
      howToUse: 'navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })',
      link: 'https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia',
      badge: 'Browser Native',
    },
    {
      title: 'Multilingual Voice Assistant',
      library: 'Web Speech API',
      category: 'Accessibility & Voice',
      description: 'Native speech-to-text and text-to-speech with full support for Indian accents and languages.',
      howToUse: 'const recognition = new window.webkitSpeechRecognition(); recognition.lang = "en-IN";',
      link: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API',
      badge: 'Browser Native',
    },
    {
      title: 'Dashboards & Metric Visualizations',
      library: 'Tremor / Recharts',
      category: 'Analytics & Graphs',
      description: 'Effortless React cards, progress rings, area charts, and KPIs styled with Tailwind CSS.',
      howToUse: 'npm install @tremor/react or npm install recharts',
      link: 'https://tremor.so/',
      badge: 'Recommended Addition',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">Interactive Widget Center & Sources</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Hub
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Understand where your widgets come from and customize what appears on your dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Quick Widget Toggles */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>Customize Active Dashboard Widgets</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Turn interactive real-time widgets on or off for your current view
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Weather & Comfort Widget</h4>
                    <p className="text-[11px] text-slate-500">Live temp, humidity, and comfort tips</p>
                  </div>
                </div>
                <button
                  onClick={onToggleWeatherWidget}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                    weatherWidgetEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                      weatherWidgetEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Voice Command Assistant HUD</h4>
                    <p className="text-[11px] text-slate-500">Multilingual speech recognition</p>
                  </div>
                </div>
                <button
                  onClick={onToggleVoiceHud}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                    voiceHudEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                      voiceHudEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Educational: Where to get & build widgets */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Widget Sources & Developer Recommendations</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Best open-source libraries and APIs used to power these real-time widgets
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {widgetLibraries.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                      <span>{item.title}</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[10px] font-mono text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 overflow-x-auto">
                      {item.howToUse}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-semibold text-slate-500">{item.library}</span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <span>Learn More</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            All widgets are designed with responsive design, offline fallbacks, and zero bloat.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
