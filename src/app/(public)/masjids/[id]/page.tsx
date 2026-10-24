'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Share2,
  Navigation,
  MapPin,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Clock,
} from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export default function MasjidDetailPage() {
  const params = useParams();
  const router = useRouter();
  const masjidId = params.id as string;

  const [activeTab, setActiveTab] = useState<'timings' | 'about' | 'location'>('timings');
  const [masjid, setMasjid] = useState<any>(null);
  const [timings, setTimings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { isUrdu } = useTranslation();
  const supabase = createClient();

  useEffect(() => {
    async function loadMasjidData() {
      try {
        const { data: masjidData } = await supabase
          .from('masjids')
          .select('*')
          .eq('id', masjidId)
          .single();

        const { data: timingsData } = await supabase
          .from('prayer_timings')
          .select('*')
          .eq('masjid_id', masjidId)
          .single();

        setMasjid(masjidData);
        setTimings(timingsData);
      } catch (err) {
        console.error('Failed to load masjid details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (masjidId) loadMasjidData();
  }, [masjidId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-clay-bg flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    const [hrs, mins] = timeStr.split(':');
    let h = parseInt(hrs, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mins} ${ampm}`;
  };

  const todayFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const prayers = [
    { key: 'fajr', en: 'Fajr', ur: 'فجر', icon: Sunrise, color: 'text-amber-500' },
    { key: 'zuhr', en: 'Zuhr', ur: 'ظہر', icon: Sun, color: 'text-amber-500' },
    { key: 'asr', en: 'Asr', ur: 'عصر', icon: Sun, color: 'text-amber-500' },
    { key: 'maghrib', en: 'Maghrib', ur: 'مغرب', icon: Sunset, color: 'text-orange-500' },
    { key: 'isha', en: 'Isha', ur: 'عشاء', icon: Moon, color: 'text-indigo-400' },
  ];

  const landmarks = (masjid?.landmarks && masjid.landmarks.length > 0)
    ? masjid.landmarks
    : [
        { name: 'Borabanda Bus Stop', distance_km: 0.2 },
        { name: 'Borabanda Police Station', distance_km: 0.6 },
        { name: 'Sanjeeva Reddy Nagar', distance_km: 1.4 },
      ];

  const handleOpenGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${masjid?.name_en || 'Masjid'}, ${masjid?.address || 'Hyderabad'}`
    )}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-clay-bg text-slate-800 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-clay-bg/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 border-b border-white/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <span className="text-sm sm:text-base font-bold text-emerald-950">Masjid Timings Finder</span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: masjid?.name_en,
                    text: `Check prayer timings for ${masjid?.name_en}`,
                    url: window.location.href,
                  });
                }
              }}
              aria-label="Share"
              className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Bento Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT BENTO COLUMN (Hero, Details & Directions) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            {/* Image Banner */}
            <div className="relative h-56 sm:h-72 w-full rounded-3xl overflow-hidden shadow-clay-card border border-white/80 bg-slate-900">
              <img
                src={masjid?.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'}
                alt={masjid?.name_en}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                <span className="w-2 h-2 rounded-full bg-white/50" />
                <span className="w-2 h-2 rounded-full bg-white/50" />
              </div>
            </div>

            {/* Title & Identity Card */}
            <ClayCard className="p-5 sm:p-6 space-y-3">
              <div className="flex items-baseline justify-between">
                <h1 className="text-xl sm:text-2xl font-black text-emerald-950">{masjid?.name_en}</h1>
                {masjid?.name_ur && (
                  <span className="font-urdu text-xl font-bold text-emerald-800">{masjid.name_ur}</span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {masjid?.address || 'Borabanda, Hyderabad, Telangana - 500018'}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 pt-1">
                <MapPin className="w-4 h-4" />
                <span>0.8 km away from current location</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={handleOpenGoogleMaps}
                  className="col-span-2 clay-btn-emerald flex items-center justify-center gap-2 py-3 px-4 text-white text-xs font-bold rounded-xl shadow-clay-btn transition-transform active:scale-95"
                >
                  <Navigation className="w-4 h-4 fill-white" />
                  <span>Get Directions</span>
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: masjid?.name_en,
                        text: `Check prayer timings for ${masjid?.name_en}`,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="col-span-1 bg-clay-surface border border-white/80 shadow-clay-pill flex items-center justify-center gap-1.5 py-3 px-3 text-emerald-950 text-xs font-bold rounded-xl active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </ClayCard>

            {/* Nearest Landmarks Drawer */}
            <ClayCard className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Nearest Landmarks
              </h3>
              <div className="space-y-2">
                {landmarks.map((landmark: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-none"
                  >
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{landmark.name}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      {landmark.distance_km} km
                    </span>
                  </div>
                ))}
              </div>
            </ClayCard>
          </div>

          {/* RIGHT BENTO COLUMN (Prayer Timings & Interactive Map) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Mobile Tab Switches (Hidden on Desktop) */}
            <div className="lg:hidden flex rounded-xl bg-slate-200/60 p-1 shadow-inner text-xs font-bold">
              {(['timings', 'about', 'location'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-center rounded-lg capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-emerald-950'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Prayer Timings Bento Card */}
            <div className={activeTab === 'timings' ? 'block space-y-6' : 'hidden lg:block lg:space-y-6'}>
              <ClayCard className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-emerald-950">Namaz Timings (Today)</h2>
                    <p className="text-xs text-slate-500 font-medium">{todayFormatted}</p>
                  </div>
                  <LanguageSwitch />
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-3 text-xs font-bold text-slate-500 uppercase tracking-wider px-3">
                  <span>Prayer {isUrdu && '/ نماز'}</span>
                  <span className="text-center">Azan Time {isUrdu && '/ اذان'}</span>
                  <span className="text-right">Jamaat Time {isUrdu && '/ جماعت'}</span>
                </div>

                {/* Table Rows */}
                <div className="space-y-2.5">
                  {prayers.map((prayer) => {
                    const Icon = prayer.icon;
                    const azanTime = timings?.[`${prayer.key}_azan`];
                    const jamaatTime = timings?.[`${prayer.key}_jamaat`];

                    return (
                      <div
                        key={prayer.key}
                        className="grid grid-cols-3 items-center px-4 py-3 rounded-xl bg-white/70 shadow-sm border border-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${prayer.color}`} />
                          <span className="text-xs sm:text-sm font-bold text-emerald-950">
                            {isUrdu ? prayer.ur : prayer.en}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-600 text-center">
                          {formatTime(azanTime)}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-emerald-900 text-right">
                          {formatTime(jamaatTime)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ClayCard>

              {/* Friday / Jumu'ah Timings Bento Tile */}
              <ClayCard className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm sm:text-base">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  <h3>Friday / Jumu&apos;ah Timings</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-4 bg-white/70 rounded-xl border border-white shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Khutbah 1</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-950 mt-1">
                      {formatTime(timings?.jumuah_khutbah_1 || '12:45:00')}
                    </span>
                  </div>
                  <div className="p-4 bg-white/70 rounded-xl border border-white shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Khutbah 2</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-950 mt-1">
                      {formatTime(timings?.jumuah_khutbah_2 || '13:30:00')}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>

            {/* About Tab (Mobile only or toggled) */}
            <div className={activeTab === 'about' ? 'block' : 'hidden'}>
              <ClayCard className="p-5 space-y-3">
                <h3 className="text-sm font-bold text-emerald-950">About the Masjid</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {masjid?.description_en ||
                    'Prominent central masjid in Borabanda offering spacious prayer halls, dedicated ablution areas, and organized Friday congregations.'}
                </p>
              </ClayCard>
            </div>

            {/* Embedded Live Map Tile (Visible on desktop or when 'location' tab active on mobile) */}
            <div className={activeTab === 'location' ? 'block' : 'hidden lg:block'}>
              <ClayCard className="p-3 overflow-hidden">
                <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden">
                  <iframe
                    title="Masjid Location Map"
                    className="w-full h-full border-0 filter contrast-[1.05]"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=78.3900%2C17.4350%2C78.4200%2C17.4600&layer=mapnik&marker=17.4475%2C78.4063"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={handleOpenGoogleMaps}
                      className="px-3 py-1.5 bg-emerald-900/90 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg backdrop-blur-md shadow-md flex items-center gap-1.5 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open Maps</span>
                    </button>
                  </div>
                </div>
              </ClayCard>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}