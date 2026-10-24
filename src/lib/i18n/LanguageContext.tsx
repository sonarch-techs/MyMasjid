'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationSchema } from './translations';

interface LanguageContextType {
  lang: Language;
  t: TranslationSchema;
  toggleLanguage: () => void;
  isUrdu: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved && (saved === 'en' || saved === 'ur')) {
      setLang(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang: Language = lang === 'en' ? 'ur' : 'en';
    setLang(nextLang);
    localStorage.setItem('app_lang', nextLang);
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        t: translations[lang],
        toggleLanguage,
        isUrdu: lang === 'ur',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}