import React from 'react';
import { AlertTriangle, PhoneCall, X } from 'lucide-react';

const EmergencyBanner = ({ isEmergency, language = 'en', onDismiss }) => {
  if (!isEmergency) return null;

  const messages = {
    en: {
      title: "CRITICAL: Potential Emergency Detected",
      subtitle: "Immediate medical intervention may be required. Please do not delay.",
      call108: "Call 108 (Ambulance)",
      call112: "Call 112 (National Emergency)"
    },
    hi: {
      title: "गंभीर चेतावनी: आपातकालीन स्थिति प्रतीत हो रही है",
      subtitle: "तत्काल चिकित्सा सहायता की आवश्यकता हो सकती है। कृपया समय न गंवाएं।",
      call108: "108 डायल करें (एम्बुलेंस)",
      call112: "112 डायल करें (आपातकालीन नंबर)"
    },
    mr: {
      title: "अतिदक्षता सूचना: वैद्यकीय आणीबाणी परिस्थिती आढळली",
      subtitle: "त्वरित वैद्यकीय उपचारांची गरज असू शकते. कृपया विलंब करू नका.",
      call108: "१०८ डायल करा (रुग्णवाहिका)",
      call112: "११२ डायल करा (राष्ट्रीय आपत्कालीन)"
    }
  };

  const t = messages[language] || messages.en;

  return (
    <div className="bg-red-600 text-white shadow-lg border-b border-red-700 animate-pulse">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Warning Icon & Text */}
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="p-2 bg-red-700/80 rounded-lg flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-base tracking-wide flex items-center justify-center md:justify-start gap-2">
              <span>{t.title}</span>
            </div>
            <p className="text-xs text-red-100">{t.subtitle}</p>
          </div>
        </div>

        {/* Quick Call Action Buttons */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-center">
          <a
            href="tel:108"
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white text-red-700 hover:bg-red-50 font-bold px-4 py-2 rounded-lg text-sm shadow transition-transform active:scale-95"
          >
            <PhoneCall className="w-4 h-4 fill-red-700" />
            <span>{t.call108}</span>
          </a>
          <a
            href="tel:112"
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-red-800 hover:bg-red-900 text-white font-bold px-4 py-2 rounded-lg text-sm border border-red-400/40 shadow transition-transform active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t.call112}</span>
          </a>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 hover:bg-red-700 rounded-md transition-colors text-red-200 hover:text-white"
              title="Dismiss alert"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyBanner;
