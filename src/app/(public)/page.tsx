'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, MapPin, SearchCode, Languages, Compass } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { NeuInput } from '@/components/ui/NeuInput';
import { Navbar } from '@/components/layout/Navbar';
import { ClayMasjidHero } from '@/components/three/ClayMasjidHero';
import { NextJamaatCard } from '@/components/hero/NextJamaatCard';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { t, isUrdu } = useTranslation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/masjids?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/masjids');
    }
  };

  return (
    <div className="min-h-screen bg-clay-bg text-slate-800 pb-16">
      <Navbar />

      {/* Main Grid: 1 column on mobile (stacked), 4 columns in Bento configuration on desktop */}
      <main className="max-w-md lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">

          {/* 1. HERO BANNER: Full width on mobile, 3 columns on desktop */}
          <section className="col-span-1 lg:col-span-3 relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-950 via-emerald-900 to-[#08281F] text-white p-6 sm:p-10 shadow-2xl min-h-[360px] sm:min-h-[420px] flex flex-col justify-between">
            <div className="relative z-10 text-center lg:text-left space-y-2 mt-2">
              <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200 mb-2">
                <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Geospatial Jama&apos;at Timings</span>
              </div>
              <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight text-white ${isUrdu ? 'font-urdu text-3xl sm:text-5xl' : ''}`}>
                {t.appTitle}
              </h1>
              <p className={`text-xs sm:text-base text-emerald-100/90 max-w-sm lg:max-w-xl mx-auto lg:mx-0 leading-relaxed ${isUrdu ? 'font-urdu text-sm sm:text-lg' : ''}`}>
                {t.tagline}
              </p>
            </div>

            {/* 3D Dome of the Rock Model (Anchored in bottom-right corner) */}
            <ClayMasjidHero />

            {/* Floating Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative z-10 mt-6 lg:mt-8 max-w-xl">
              <div className="relative flex items-center">
                <NeuInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="bg-white/95 text-slate-900 shadow-xl pr-12 lg:pr-14 py-3 sm:py-3.5 text-xs sm:text-sm placeholder-slate-400 border border-white"
                  icon={<Search className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-800" />}
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-2 top-1.5 bottom-1.5 px-3.5 lg:px-4 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-md"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          </section>

          {/* 2. CURRENT SESSION CARD: Sits between Hero & Feature Grid on mobile, 4th column spotlight on desktop */}
          <div className="col-span-1 lg:col-span-1 flex flex-col ">
            <NextJamaatCard />
          </div>

          {/* 3. 2x2 FEATURE GRID ON MOBILE -> 4-COLUMN ROW IN BENTO ON LARGE SCREENS */}
          <div className="col-span-1 lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Card 1: Prayer Timings */}
            <div onClick={() => router.push('/masjids')} className="cursor-pointer pressable-clay">
              <ClayCard className="flex flex-col items-center text-center p-5 sm:p-6 h-full justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-inner mb-3">
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="font-bold text-xs sm:text-base text-emerald-950 mb-1">{t.prayerTimings}</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight sm:leading-relaxed">
                  {t.prayerTimingsDesc}
                </p>
              </ClayCard>
            </div>

            {/* Card 2: Masjid Locations */}
            <div onClick={() => router.push('/masjids')} className="cursor-pointer pressable-clay">
              <ClayCard className="flex flex-col items-center text-center p-5 sm:p-6 h-full justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-inner mb-3">
                  <MapPin className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="font-bold text-xs sm:text-base text-emerald-950 mb-1">{t.masjidLocations}</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight sm:leading-relaxed">
                  {t.masjidLocationsDesc}
                </p>
              </ClayCard>
            </div>

            {/* Card 3: Easy Search */}
            <div onClick={() => router.push('/masjids')} className="cursor-pointer pressable-clay">
              <ClayCard className="flex flex-col items-center text-center p-5 sm:p-6 h-full justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-inner mb-3">
                  <SearchCode className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="font-bold text-xs sm:text-base text-emerald-950 mb-1">{t.easySearch}</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight sm:leading-relaxed">
                  {t.easySearchDesc}
                </p>
              </ClayCard>
            </div>

            {/* Card 4: Bilingual */}
            <div className="pressable-clay">
              <ClayCard className="flex flex-col items-center text-center p-5 sm:p-6 h-full justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-inner mb-3">
                  <Languages className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="font-bold text-xs sm:text-base text-emerald-950 mb-1">{t.bilingual}</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight sm:leading-relaxed">
                  {t.bilingualDesc}
                </p>
              </ClayCard>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}