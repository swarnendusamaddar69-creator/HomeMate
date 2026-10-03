import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Plus, Check, Radio } from 'lucide-react';
import { Language, ShoppingItem } from '../types';
import { normalizeGroceryInput } from '../utils/synonyms';

interface VoiceCommandHudProps {
  language: Language;
  onAddItem: (item: Omit<ShoppingItem, 'id'>) => void;
  isElderMode?: boolean;
}

export const VoiceCommandHud: React.FC<VoiceCommandHudProps> = ({
  language,
  onAddItem,
  isElderMode = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  const speakFeedback = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (language === 'hi') utterance.lang = 'hi-IN';
      else if (language === 'bn') utterance.lang = 'bn-IN';
      else utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleProcessSentence = (text: string) => {
    setTranscript(text);
    const parsed = normalizeGroceryInput(text, language);

    const newItem: Omit<ShoppingItem, 'id'> = {
      title: parsed.title,
      localTitle: parsed.localTitle,
      quantity: parsed.quantity,
      category: parsed.category,
      addedBy: `Voice: "${text}"`,
      status: 'pending',
      reason: 'voice',
    };

    onAddItem(newItem);
    setLastAdded(`${parsed.quantity} ${parsed.localTitle || parsed.title}`);

    const feedbackMsg =
      language === 'hi'
        ? `${parsed.localTitle || parsed.title} लिस्ट में जोड़ दिया`
        : language === 'bn'
        ? `${parsed.localTitle || parsed.title} লিস্টে যোগ করা হয়েছে`
        : `Added ${parsed.quantity} ${parsed.title} to shopping list`;

    speakFeedback(feedbackMsg);

    setTimeout(() => {
      setLastAdded(null);
    }, 4500);
  };

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback demo simulation
      const samplePhrases = [
        'Add 2 litres milk and a loaf of brown bread',
        'Tomatoes and onions are running low',
        '1 kg fresh potatoes and ginger',
        'Add 6 eggs and butter to Kirana list',
      ];
      const random = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
      handleProcessSentence(random);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      if (language === 'hi') recognition.lang = 'hi-IN';
      else if (language === 'bn') recognition.lang = 'bn-IN';
      else recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('Listening... speak what you need to buy...');
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setIsListening(false);
        handleProcessSentence(text);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript('Tap mic again or choose a sample command below');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed, using fallback:', err);
      setIsListening(false);
      handleProcessSentence('Add 1 packet milk and 1 dozen eggs');
    }
  };

  return (
    <div
      className={`rounded-3xl p-5 transition-all shadow-sm border ${
        isElderMode
          ? 'bg-amber-100/70 border-3 border-amber-400 text-amber-950'
          : 'bg-slate-900 text-white border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Assistant Identity */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 transition-transform ${
              isListening ? 'scale-110 animate-pulse' : ''
            } ${
              isElderMode
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-indigo-600 text-white shadow-md'
            }`}
          >
            {isListening ? (
              <Radio className="w-6 h-6 animate-spin text-white" />
            ) : (
              <Sparkles className="w-6 h-6 text-white" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-extrabold ${isElderMode ? 'text-amber-950' : 'text-white'}`}>
                {isElderMode
                  ? language === 'hi'
                    ? 'आवाज से सामान जोड़ें (Voice Assistant)'
                    : 'Speak to Add Items'
                  : 'Multilingual Voice Assistant HUD'}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isElderMode
                    ? 'bg-amber-200 text-amber-900 border border-amber-300'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}
              >
                Web Speech API
              </span>
            </div>
            <p className={`text-xs ${isElderMode ? 'text-amber-900' : 'text-slate-400'}`}>
              Say "Add 2kg potatoes and milk" or tap any sample prompt below
            </p>
          </div>
        </div>

        {/* Right: Big Interactive Mic Button */}
        <button
          onClick={toggleListening}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-400/50 animate-pulse'
              : isElderMode
              ? 'bg-amber-600 hover:bg-amber-700 text-white border-2 border-amber-800'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          <span>{isListening ? 'Listening... Tap to Stop' : 'Tap & Speak Voice Command'}</span>
        </button>
      </div>

      {/* Spoken Feedback Confirmation Banner */}
      {lastAdded && (
        <div className="mt-4 flex items-center gap-2.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-bold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>✓ Added to household list: {lastAdded}</span>
        </div>
      )}

      {/* Suggested Voice Commands */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
        <span className={`text-[11px] font-bold ${isElderMode ? 'text-amber-900' : 'text-slate-400'}`}>
          Quick Commands:
        </span>
        {[
          'Add 1 litre Amul Milk',
          'Add 1 kg Tomatoes and Ginger',
          'Bread and Eggs are finished',
          'Add Chana Dal and Rice',
        ].map((phrase, idx) => (
          <button
            key={idx}
            onClick={() => handleProcessSentence(phrase)}
            className={`text-xs px-3 py-1 rounded-xl transition-all font-semibold flex items-center gap-1 cursor-pointer ${
              isElderMode
                ? 'bg-white hover:bg-amber-200 text-amber-950 border border-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
            }`}
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            <span>"{phrase}"</span>
          </button>
        ))}
      </div>
    </div>
  );
};
