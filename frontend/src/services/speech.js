// ArogyaSetu Speech Service (Web Speech API Wrapper for STT & TTS)
// SPDX-FileCopyrightText: 2026 Aaryan Patwardhan

const LANG_CODE_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
};

export const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
};

export const isSpeechSynthesisSupported = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export class SpeechRecognizer {
  constructor({ language = 'en', onTranscript, onSilenceDetected, onError, onStateChange }) {
    this.language = language;
    this.onTranscript = onTranscript;
    this.onSilenceDetected = onSilenceDetected;
    this.onError = onError;
    this.onStateChange = onStateChange;

    this.recognition = null;
    this.isListening = false;
    this.silenceTimer = null;
    this.lastTranscript = '';

    this.init();
  }

  init() {
    if (!isSpeechRecognitionSupported()) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionClass();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = LANG_CODE_MAP[this.language] || 'en-IN';

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStateChange) this.onStateChange(true);
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const activeText = finalTranscript || interimTranscript;
      if (activeText) {
        this.lastTranscript = activeText;
        if (this.onTranscript) this.onTranscript(activeText, Boolean(finalTranscript));

        // Reset silence detection timer (1.8 seconds of silence triggers auto-submission)
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.silenceTimer = setTimeout(() => {
          if (this.lastTranscript.trim() && this.isListening) {
            if (this.onSilenceDetected) {
              this.onSilenceDetected(this.lastTranscript.trim());
            }
            this.stop();
          }
        }, 1800);
      }
    };

    this.recognition.onerror = (event) => {
      if (this.onError) this.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onStateChange) this.onStateChange(false);
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
    };
  }

  setLanguage(lang) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = LANG_CODE_MAP[lang] || 'en-IN';
    }
  }

  start() {
    if (!this.recognition || this.isListening) return;
    this.lastTranscript = '';
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('SpeechRecognition start error:', e);
    }
  }

  stop() {
    if (!this.recognition || !this.isListening) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.warn('SpeechRecognition stop error:', e);
    }
    this.isListening = false;
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.onStateChange) this.onStateChange(false);
  }
}

/**
 * Text-to-Speech synthesis helper with language fallback
 */
export const speakLocalizedText = (text, language = 'en', onStart, onEnd) => {
  if (!isSpeechSynthesisSupported()) return;

  // Stop any active utterance
  window.speechSynthesis.cancel();

  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const targetLocale = LANG_CODE_MAP[language] || 'en-IN';
  utterance.lang = targetLocale;
  utterance.rate = 0.95; // Slightly slower for clarity in medical context
  utterance.pitch = 1.0;

  // Find best available matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => v.lang === targetLocale || v.lang.startsWith(language)
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
};

export const stopSpeechPlayback = () => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};
