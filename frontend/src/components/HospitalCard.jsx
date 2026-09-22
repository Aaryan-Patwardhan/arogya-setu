import React from 'react';
import { MapPin, Phone, Navigation, Clock, ShieldCheck, DollarSign } from 'lucide-react';

const HospitalCard = ({ hospital, language = 'en', targetSpecialty = null }) => {
  // Select localized hospital name if available
  const displayName = 
    (language === 'mr' && hospital.name_mr) ? hospital.name_mr :
    (language === 'hi' && hospital.name_hi) ? hospital.name_hi :
    hospital.name;

  const costTierColors = {
    'Low/Govt': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Medium': 'bg-blue-50 text-blue-700 border-blue-200',
    'High': 'bg-purple-50 text-purple-700 border-purple-200'
  };

  const navUrl = hospital.navigation_url || `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between">
      <div>
        {/* Top Header: Name, Emergency Badge, Cost Tier */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
            {displayName}
          </h3>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {hospital.emergency_24x7 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                <Clock className="w-3 h-3 mr-1" />
                24x7 Emergency
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${costTierColors[hospital.estimated_cost_tier] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <DollarSign className="w-2.5 h-2.5 -mr-0.5" />
              {hospital.estimated_cost_tier}
            </span>
          </div>
        </div>

        {/* Distance & Address */}
        <div className="flex items-center text-xs font-semibold text-emerald-700 mb-1.5">
          <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
          <span>{hospital.distance_km} km away</span>
        </div>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">
          {hospital.address}
        </p>

        {/* Department / Treatment Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {hospital.available_treatments?.slice(0, 5).map((treatment, idx) => {
            const isMatch = targetSpecialty && treatment.toLowerCase().includes(targetSpecialty.toLowerCase());
            return (
              <span
                key={idx}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                  isMatch
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {treatment}
              </span>
            );
          })}
          {hospital.available_treatments?.length > 5 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{hospital.available_treatments.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons: Call & Navigate */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 mt-1">
        <a
          href={`tel:${hospital.phone?.replace(/[^0-9+]/g, '') || ''}`}
          className="flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 text-slate-800 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Call Hospital</span>
        </a>
        <a
          href={navUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm hover:shadow transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Navigate</span>
        </a>
      </div>
    </div>
  );
};

export default HospitalCard;
