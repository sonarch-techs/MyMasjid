'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function LanguageSwitch() {
  const { lang, toggleLanguage } = useTranslation();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-clay-bg shadow-clay-pill border border-white/60 text-xs font-semibold text-emerald-900 transition-all hover:scale-105 active:scale-95"
      aria-label="Switch Language"
    >
      <span className={lang === 'en' ? 'text-emerald-800 font-bold' : 'text-gray-400'}>EN</span>
      <span className="text-gray-300">|</span>
      <span className={lang === 'ur' ? 'text-emerald-800 font-bold font-urdu text-sm' : 'text-gray-400 font-urdu text-sm'}>
        اردو
      </span>
    </button>
  );
}