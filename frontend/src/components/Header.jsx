import React from 'react';
import { Activity, MapPin, Globe, RefreshCw } from 'lucide-react';

const Header = ({ 
  currentLang, 
  onLangChange, 
  locationStatus, 
  districtName = "Latur", 
  onRefreshLocation 
}) => {
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* App Title & District Indicator */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Activity className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Arogya<span className="text-emerald-600">Setu</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                {districtName} District
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Multilingual Voice-First Triage & Hospital Locator
            </p>
          </div>
        </div>

        {/* Right Section: Location Status & Language Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Location Badge */}
          <div 
            onClick={onRefreshLocation}
            title="Click to re-request GPS location"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 transition-colors text-slate-700 cursor-pointer border border-slate-200"
          >
            <MapPin className={`w-3.5 h-3.5 ${locationStatus.isFallback ? 'text-amber-500' : 'text-emerald-600'}`} />
            <span>
              {locationStatus.isFallback ? `Fallback: ${districtName} Central` : 'Using Current Location'}
            </span>
            <RefreshCw className="w-3 h-3 text-slate-400 hover:text-slate-600 ml-1" />
          </div>

          {/* Language Switcher Buttons */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
            {languages.map((lang) => {
              const isActive = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onLangChange(lang.code)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    isActive
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
