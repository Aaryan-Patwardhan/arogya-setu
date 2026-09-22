import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

const VoiceController = ({ 
  isListening, 
  onToggleListening, 
  language = 'en', 
  interimTranscript = '',
  disabled = false 
}) => {
  const labels = {
    en: {
      idle: "Tap microphone to speak symptoms",
      listening: "Listening... speak now (pausing sends automatically)",
      unsupported: "Voice input not supported in this browser"
    },
    hi: {
      idle: "लक्षण बोलने के लिए माइक पर टैप करें",
      listening: "सुन रहे हैं... बोलिए (रुकने पर संदेश भेजा जाएगा)",
      unsupported: "इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है"
    },
    mr: {
      idle: "लक्षण सांगण्यासाठी माईकवर टॅप करा",
      listening: "ऐकत आहे... बोला (थांबल्यास आपोआप पाठवले जाईल)",
      unsupported: "या ब्राउझरमध्ये व्हॉईस इनपुट उपलब्ध नाही"
    }
  };

  const t = labels[language] || labels.en;

  return (
    <div className="flex flex-col items-center justify-center p-3">
      {/* Mic Action Button */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring indicator when listening */}
        {isListening && (
          <div className="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-mic-pulse pointer-events-none" />
        )}

        <button
          onClick={onToggleListening}
          disabled={disabled}
          type="button"
          title={isListening ? "Stop listening" : "Start voice input"}
          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 ring-4 ring-red-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <MicOff className="w-7 h-7 animate-bounce" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* Voice Status Text & Sound Wave simulation */}
      <div className="mt-2.5 text-center max-w-md">
        <p className={`text-xs font-medium transition-colors ${isListening ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
          {isListening ? t.listening : t.idle}
        </p>

        {isListening && (
          <div className="flex items-center justify-center space-x-1 mt-2">
            <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-emerald-600 rounded-full animate-pulse delay-75" />
            <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
            <span className="w-1 h-6 bg-emerald-600 rounded-full animate-pulse delay-100" />
            <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse delay-200" />
          </div>
        )}

        {/* Live transcription preview while speaking */}
        {isListening && interimTranscript && (
          <p className="mt-2 text-xs italic text-slate-700 bg-white/80 border border-emerald-200 py-1 px-3 rounded-full inline-block shadow-sm max-w-sm truncate">
            "{interimTranscript}"
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceController;
