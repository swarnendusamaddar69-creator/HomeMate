import { Language } from '../types';

/**
 * Web Audio API gentle bell chime synthesizer.
 * Does not require external MP3 files and works seamlessly offline.
 */
export function playChimeSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Gentle 3-note ascending chime: E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [
      { freq: 659.25, time: 0, duration: 0.3 },
      { freq: 783.99, time: 0.12, duration: 0.35 },
      { freq: 1046.5, time: 0.24, duration: 0.6 },
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      // Soft envelope (gentle attack, smooth decay)
      gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration + 0.05);
    });
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

/**
 * Text-to-speech speaker for elderly routines.
 */
export function speakElderReminder(text: string, language: Language = 'en'): void {
  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'bn') utterance.lang = 'bn-IN';
    else utterance.lang = 'en-IN';
    utterance.rate = 0.95; // slightly slower, clearer pace for elders
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

/**
 * Check if the browser supports desktop notifications
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return false;
  }
}

/**
 * Send a native browser desktop notification with sound and voice fallback
 */
export function triggerElderRoutineNotification({
  taskTitle,
  time,
  language = 'en',
  soundEnabled = true,
}: {
  taskTitle: string;
  time: string;
  language?: Language;
  soundEnabled?: boolean;
}): void {
  // 1. Play synthesized bell chime
  if (soundEnabled) {
    playChimeSound();
  }

  // 2. Speak reminder aloud after chime starts
  const speechText =
    language === 'hi'
      ? `याद दिलाना: ${time} का समय हो गया है। ${taskTitle}`
      : language === 'bn'
      ? `মনে করিয়ে দেওয়া হচ্ছে: ${time} বেজেছে। ${taskTitle}`
      : `Reminder: It's ${time}. Time for: ${taskTitle}`;

  setTimeout(() => {
    if (soundEnabled) {
      speakElderReminder(speechText, language);
    }
  }, 350);

  // 3. Native system push notification
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      new Notification(`⏰ Homemate Routine Reminder: ${time}`, {
        body: taskTitle,
        icon: '/favicon.ico',
        tag: `elder-reminder-${Date.now()}`,
      });
    } catch (e) {
      console.warn('Could not launch system notification:', e);
    }
  }
}
