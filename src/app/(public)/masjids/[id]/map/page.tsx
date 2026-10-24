'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Navigation, MapPin } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { createClient } from '@/lib/supabase/client';

export default function MasjidLocationPage() {
  const params = useParams();
  const router = useRouter();
  const masjidId = params.id as string;

  const [masjid, setMasjid] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMasjid() {
      try {
        const { data } = await supabase
          .from('masjids')
          .select('*')
          .eq('id', masjidId)
          .single();
        setMasjid(data);
      } catch (err) {
        console.error('Failed to load masjid coordinates:', err);
      } finally {
        setLoading(false);
      }
    }
    if (masjidId) fetchMasjid();
  }, [masjidId, supabase]);

  const defaultLandmarks = [
    { name: 'Borabanda Bus Stop', distance_km: 0.2 },
    { name: 'Borabanda Police Station', distance_km: 0.6 },
    { name: 'Sanjeeva Reddy Nagar', distance_km: 1.4 },
  ];

  const landmarks = (masjid?.landmarks && masjid.landmarks.length > 0)
    ? masjid.landmarks
    : defaultLandmarks;

  const handleOpenGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${masjid?.name_en || 'Masjid'}, ${masjid?.address || 'Hyderabad'}`
    )}`;
    window.open(mapsUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-clay-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clay-bg text-slate-800 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-clay-bg/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/60 max-w-md mx-auto w-full">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <span className="text-sm font-bold text-emerald-950">Location</span>
        <div className="w-9" />
      </header>

      {/* Map View Canvas Container */}
      <div className="relative flex-1 w-full max-w-md mx-auto min-h-[300px] bg-slate-200 overflow-hidden">
        {/* OpenStreetMap Tile Embed */}
        <iframe
          title="Masjid Location Map"
          className="w-full h-full border-0 filter contrast-[1.05]"
          src="https://www.openstreetmap.org/export/embed.html?bbox=78.3900%2C17.4350%2C78.4200%2C17.4600&layer=mapnik&marker=17.4475%2C78.4063"
        />

        {/* Central Tactical Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none flex flex-col items-center">
          <div className="px-2.5 py-1 rounded-md bg-emerald-900 text-white text-[10px] font-bold shadow-lg mb-1 whitespace-nowrap">
            {masjid?.name_en || 'Masjid e Bilal'}
          </div>
          <div className="w-7 h-7 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white shadow-md animate-bounce">
            <MapPin className="w-4 h-4 fill-white" />
          </div>
        </div>
      </div>

      {/* Bottom Sheet Details & Landmarks */}
      <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-clay-bg rounded-t-3xl shadow-2xl border-t border-white/80">
        <ClayCard className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0">
              <img
                src={masjid?.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'}
                alt={masjid?.name_en}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-950">{masjid?.name_en}</h2>
              {masjid?.name_ur && (
                <p className="font-urdu text-xs text-emerald-800">{masjid?.name_ur}</p>
              )}
              <p className="text-[11px] text-slate-500 font-medium">
                {masjid?.address || 'Borabanda, Hyderabad, Telangana - 500018'}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenGoogleMaps}
            className="w-full clay-btn-emerald flex items-center justify-center gap-2 py-3 px-4 text-white text-xs font-bold rounded-xl shadow-clay-btn transition-transform active:scale-95"
          >
            <Navigation className="w-4 h-4 fill-white" />
            <span>Get Directions in Google Maps</span>
          </button>
        </ClayCard>

        {/* Nearest Landmarks Card */}
        <ClayCard className="p-4 space-y-3">
          <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
            Nearest Landmarks
          </h3>
          <div className="space-y-2">
            {landmarks.map((landmark: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-none"
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
    </div>
  );
}