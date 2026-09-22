import React from 'react';
import { Heart, ShieldCheck } from 'lucide-react';

const Footer = ({ districtName = 'Latur' }) => {
  return (
    <footer className="mt-12 py-6 border-t border-slate-200/80 bg-white/50 text-slate-500 text-xs">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <p className="font-medium text-slate-700">
            ArogyaSetu • {districtName} Healthcare & Emergency Locator
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Designed for district-level triage and fast medical access
          </p>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
          <span>v1.0.0</span>
          <span>•</span>
          <span>Open Healthcare Initiative</span>
          <span>•</span>
          <span>Authored by Aaryan Patwardhan</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
