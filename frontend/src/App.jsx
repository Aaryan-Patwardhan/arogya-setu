import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import EmergencyBanner from './components/EmergencyBanner';
import VoiceController from './components/VoiceController';
import ChatWindow from './components/ChatWindow';
import HospitalCard from './components/HospitalCard';
import Footer from './components/Footer';

import { 
  SpeechRecognizer, 
  speakLocalizedText, 
  stopSpeechPlayback 
} from './services/speech';
import { 
  sendTriageMessage, 
  getHospitals, 
  checkHealth 
} from './services/api';

import { Building2, Filter, AlertCircle, Sparkles } from 'lucide-react';

const INITIAL_WELCOME = {
  en: "Hello, I am ArogyaSetu, your district healthcare triage assistant. You can speak or type your symptoms, and I will guide you to appropriate care and the nearest facilities in Latur.",
  hi: "नमस्ते, मैं आरोग्यसेतु हूँ, आपका जिला स्वास्थ्य सहायिका। आप बोलकर या लिखकर अपने लक्षण बता सकते हैं, और मैं आपको लातूर के नजदीकी अस्पतालों तक पहुँचाने में मदद करूँगा।",
  mr: "नमस्कार, मी आरोग्यसेतु आहे, तुमचा जिल्हा आरोग्य सहाय्यक. तुम्ही बोलून किंवा लिहून तुमची लक्षणे सांगू शकता, आणि मी तुम्हाला लातूरमधील योग्य रुग्णालयांचे मार्गदर्शन करेन."
};

function App() {
  const [language, setLanguage] = useState('en');
  const [districtName, setDistrictName] = useState('Latur');
  const [locationStatus, setLocationStatus] = useState({
    lat: null,
    lon: null,
    isFallback: true
  });

  const [isEmergency, setIsEmergency] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: INITIAL_WELCOME.en,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      triage: null
    }
  ]);

  const [hospitals, setHospitals] = useState([]);
  const [targetSpecialty, setTargetSpecialty] = useState(null);
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState('');

  const recognizerRef = useRef(null);

  // 1. Initial healthcheck and hospital list
  useEffect(() => {
    checkHealth()
      .then((data) => {
        if (data.district) setDistrictName(data.district);
      })
      .catch((err) => console.warn('Backend offline or healthcheck failed:', err));

    getHospitals()
      .then((data) => {
        if (data.hospitals) setHospitals(data.hospitals);
      })
      .catch((err) => console.warn('Could not fetch initial hospitals:', err));

    requestGeolocation();
  }, []);

  // 2. Request Geolocation
  const requestGeolocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationStatus({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            isFallback: false
          });
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using district fallback:', err);
          setLocationStatus((prev) => ({ ...prev, isFallback: true }));
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  };

  // 3. Setup Voice Recognizer
  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer({
      language,
      onTranscript: (text, isFinal) => {
        setInterimTranscript(text);
        if (isFinal) {
          setInputText(text);
        }
      },
      onSilenceDetected: (finalText) => {
        if (finalText.trim()) {
          handleSendMessage(finalText.trim());
          setInterimTranscript('');
        }
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      },
      onStateChange: (state) => {
        setIsListening(state);
      }
    });

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      stopSpeechPlayback();
    };
  }, [language, locationStatus]);

  // Update welcome message when language toggles if it's the only message
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (recognizerRef.current) {
      recognizerRef.current.setLanguage(newLang);
    }

    if (messages.length === 1 && messages[0].id === 'welcome-1') {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: INITIAL_WELCOME[newLang] || INITIAL_WELCOME.en,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          triage: null
        }
      ]);
    }
  };

  const handleToggleListening = () => {
    if (!recognizerRef.current) return;
    if (isListening) {
      recognizerRef.current.stop();
    } else {
      setInterimTranscript('');
      recognizerRef.current.start();
    }
  };

  // 4. Send Message to Backend Triage
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    // Reset input states
    setInputText('');
    setInterimTranscript('');
    if (isListening && recognizerRef.current) {
      recognizerRef.current.stop();
    }

    // Add user message to thread
    const userMsgId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: query,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await sendTriageMessage({
        message: query,
        language,
        lat: locationStatus.lat,
        lon: locationStatus.lon
      });

      const triage = response.triage;
      const geo = response.geo;

      // Update emergency status
      if (triage.is_emergency) {
        setIsEmergency(true);
      }

      // Update nearest hospitals
      if (geo && geo.hospitals) {
        setHospitals(geo.hospitals);
        setTargetSpecialty(triage.specialty_needed);
      }

      const assistantMsg = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: triage.response_text || triage.analysis,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triage
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically play localized response in voice
      handlePlayTTS(assistantMsg);

    } catch (err) {
      console.error('Triage request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: "I couldn't reach the triage server. Please ensure the backend is running at http://localhost:8000.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          triage: null
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Audio Playback Handlers
  const handlePlayTTS = (msg) => {
    stopSpeechPlayback();
    setActiveAudioId(msg.id);
    speakLocalizedText(
      msg.text,
      language,
      () => setActiveAudioId(msg.id),
      () => setActiveAudioId(null)
    );
  };

  const handleStopTTS = () => {
    stopSpeechPlayback();
    setActiveAudioId(null);
  };

  // Filter hospitals by specialty tag
  const filteredHospitals = selectedSpecialtyFilter
    ? hospitals.filter(h => 
        h.available_treatments?.some(t => t.toLowerCase().includes(selectedSpecialtyFilter.toLowerCase()))
      )
    : hospitals;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <Header
        currentLang={language}
        onLangChange={handleLanguageChange}
        locationStatus={locationStatus}
        districtName={districtName}
        onRefreshLocation={requestGeolocation}
      />

      {/* Emergency Banner */}
      <EmergencyBanner
        isEmergency={isEmergency}
        language={language}
        onDismiss={() => setIsEmergency(false)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Voice & Chat Interface (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Voice Controller Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col items-center">
              <VoiceController
                isListening={isListening}
                onToggleListening={handleToggleListening}
                language={language}
                interimTranscript={interimTranscript}
                disabled={isLoading}
              />
            </div>

            {/* Chat Thread */}
            <ChatWindow
              messages={messages}
              inputText={inputText}
              setInputText={setInputText}
              onSubmitMessage={() => handleSendMessage()}
              isLoading={isLoading}
              language={language}
              activeAudioId={activeAudioId}
              onPlayTTS={handlePlayTTS}
              onStopTTS={handleStopTTS}
            />
          </div>

          {/* Right Column: Nearest Specialized Facilities (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-slate-900 text-base">
                    Nearby Facilities ({districtName})
                  </h2>
                </div>
                {targetSpecialty && (
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    Target: {targetSpecialty}
                  </span>
                )}
              </div>

              {/* Specialty quick filter pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedSpecialtyFilter('')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedSpecialtyFilter === ''
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                {['Emergency', 'Cardiology', 'Orthopedics', 'Pediatrics', 'ICU'].map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialtyFilter(spec === selectedSpecialtyFilter ? '' : spec)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      selectedSpecialtyFilter === spec
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>

              {/* Hospital Cards List */}
              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {filteredHospitals.length > 0 ? (
                  filteredHospitals.map((hospital) => (
                    <HospitalCard
                      key={hospital.id}
                      hospital={hospital}
                      language={language}
                      targetSpecialty={targetSpecialty}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No hospitals found matching criteria.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer districtName={districtName} />
    </div>
  );
}

export default App;
