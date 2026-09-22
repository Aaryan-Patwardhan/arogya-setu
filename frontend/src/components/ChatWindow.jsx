import React, { useRef, useEffect } from 'react';
import { Volume2, VolumeX, Send, User, Bot, AlertCircle, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

const ChatWindow = ({
  messages,
  inputText,
  setInputText,
  onSubmitMessage,
  isLoading,
  language = 'en',
  activeAudioId,
  onPlayTTS,
  onStopTTS
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const urgencyStyles = {
    EMERGENCY: {
      badge: 'bg-red-100 text-red-800 border-red-200',
      icon: ShieldAlert,
      label: 'Emergency Alert'
    },
    CONSULT_TODAY: {
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertCircle,
      label: 'Consult Today'
    },
    HOME_CARE: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle,
      label: 'Home Care & Monitoring'
    }
  };

  const placeholders = {
    en: "Describe your symptoms (e.g. 'fever with headache for 2 days' or 'severe chest pain')...",
    hi: "अपने लक्षण बताएं (जैसे '2 दिन से सिरदर्द और बुखार' या 'सीने में दर्द')...",
    mr: "तुमची लक्षणे सांगा (उदा. '२ दिवसांपासून ताप आणि डोकेदुखी' किंवा 'छातीत दुखत आहे')..."
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmitMessage();
    }
  };

  return (
    <div className="flex flex-col h-[540px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isPlaying = activeAudioId === msg.id;

          if (isUser) {
            return (
              <div key={msg.id} className="flex items-start justify-end space-x-2">
                <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[85%] sm:max-w-[75%] shadow-xs">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <span className="text-[10px] text-emerald-100 block text-right mt-1">{msg.time}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              </div>
            );
          }

          // Assistant Message
          const triage = msg.triage;
          const urgencyConfig = triage?.urgency ? urgencyStyles[triage.urgency] : null;

          return (
            <div key={msg.id} className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 max-w-[90%] sm:max-w-[82%] shadow-xs space-y-3">
                {/* Urgency Badge if present */}
                {urgencyConfig && (
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${urgencyConfig.badge}`}>
                      <urgencyConfig.icon className="w-3.5 h-3.5" />
                      {urgencyConfig.label}
                    </span>
                    {triage.specialty_needed && (
                      <span className="text-[11px] font-medium text-slate-500">
                        Dept: <strong className="text-slate-700">{triage.specialty_needed}</strong>
                      </span>
                    )}
                  </div>
                )}

                {/* Localized Response Text */}
                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {msg.text}
                </p>

                {/* Recommended Immediate Actions */}
                {triage?.recommended_action && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 text-xs">
                    <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Recommended Immediate Steps:
                    </p>
                    <p className="text-slate-600 leading-normal">{triage.recommended_action}</p>
                  </div>
                )}

                {/* Clinical Disclaimer */}
                {triage?.disclaimer && (
                  <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-200/50">
                    {triage.disclaimer}
                  </p>
                )}

                {/* Footer Controls: Audio Listen Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => (isPlaying ? onStopTTS() : onPlayTTS(msg))}
                    className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                      isPlaying
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-emerald-700 border border-slate-200'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen Aloud</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-slate-400">{msg.time}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-500 text-xs italic p-2">
            <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Analyzing symptoms and finding nearest facilities...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholders[language] || placeholders.en}
          disabled={isLoading}
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        <button
          onClick={onSubmitMessage}
          disabled={isLoading || !inputText.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl shadow-xs transition-colors flex-shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
