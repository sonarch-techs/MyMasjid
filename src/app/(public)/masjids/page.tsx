'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ChevronRight, MapPin, Compass } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { NeuInput } from '@/components/ui/NeuInput';
import { useGeolocation } from '@/lib/geo/useGeolocation';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/i18n/LanguageContext';

const LOCALITIES = ['All', 'Borabanda', 'Sanath Nagar', 'Ameerpet', 'Erragadda', 'S.R. Nagar'];

interface MasjidItem {
  id: string;
  name_en: string;
  name_ur: string;
  locality: string;
  address: string;
  distance_km: number;
  images: string[];
  fajr_jamaat?: string;
  zuhr_jamaat?: string;
  asr_jamaat?: string;
  maghrib_jamaat?: string;
  isha_jamaat?: string;
  jumuah_khutbah_1?: string;
}

export default function MasjidsDirectoryPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedLocality, setSelectedLocality] = useState('All');
  const [masjids, setMasjids] = useState<MasjidItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { lat, lng } = useGeolocation();
  const { isUrdu } = useTranslation();
  const supabase = createClient();

  useEffect(() => {
    async function fetchNearbyMasjids() {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_nearby_masjids', {
          user_lat: lat,
          user_lng: lng,
          radius_meters: 25000,
          locality_filter: selectedLocality === 'All' ? null : selectedLocality,
        });

        if (error) throw error;

        let filtered = (data as MasjidItem[]) || [];
        if (query.trim()) {
          filtered = filtered.filter(
            (m) =>
              m.name_en.toLowerCase().includes(query.toLowerCase()) ||
              m.locality.toLowerCase().includes(query.toLowerCase())
          );
        }
        setMasjids(filtered);
      } catch (err) {
        console.error('Error querying masjids:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchNearbyMasjids();
  }, [lat, lng, selectedLocality, query, supabase]);

  const formatShortTime = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    const [hrs, mins] = timeStr.split(':');
    let h = parseInt(hrs, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mins} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-clay-bg text-slate-800 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Top Control Bento Bar */}
        <div className="bg-clay-surface rounded-2xl p-4 sm:p-5 shadow-clay-card border border-white/80 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-96">
            <NeuInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search masjid name or locality..."
              icon={<Search className="w-4 h-4 text-emerald-800" />}
            />
            <button
              aria-label="Filter"
              className="p-3 bg-clay-surface shadow-clay-pill border border-white/80 rounded-xl text-emerald-900 active:scale-95 transition-transform shrink-0"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Locality Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
            {LOCALITIES.map((loc) => {
              const isSelected = selectedLocality === loc;
              return (
                <button
                  key={loc}
                  onClick={() => setSelectedLocality(loc)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-clay-pill border ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-900 scale-105'
                      : 'bg-clay-surface text-slate-600 border-white/80 hover:text-emerald-900'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter & Status */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <p>
            Showing {masjids.length} masjids {selectedLocality !== 'All' ? `near ${selectedLocality}` : 'nearby'}
          </p>
          <div className="flex items-center gap-1.5 text-emerald-800">
            <Compass className="w-4 h-4" />
            <span>GPS Active (Hyderabad)</span>
          </div>
        </div>

        {/* Responsive Bento Grid of Masjid Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-200/60 animate-pulse shadow-inner" />
            ))}
          </div>
        ) : masjids.length === 0 ? (
          <div className="text-center py-16 bg-clay-surface rounded-3xl border border-white/80 shadow-clay-card max-w-lg mx-auto">
            <MapPin className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h2 className="text-base font-bold text-slate-700">No masjids found in this area</h2>
            <p className="text-xs text-slate-400 mt-1">Try selecting another locality or clearing your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {masjids.map((masjid) => (
              <Link key={masjid.id} href={`/masjids/${masjid.id}`} className="block group h-full">
                <div className="rounded-2xl p-4 sm:p-5 bg-clay-surface shadow-clay-card border border-white/80 flex flex-col justify-between h-full transition-transform duration-150 group-hover:-translate-y-1 active:scale-[0.98]">
                  {/* Top: Identity & Thumbnail */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-emerald-900/10 border border-emerald-900/20 overflow-hidden shrink-0">
                      {masjid.images?.[0] ? (
                        <img
                          src={masjid.images[0]}
                          alt={masjid.name_en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-emerald-900 to-emerald-700 flex items-center justify-center text-white text-base font-bold">
                          {masjid.name_en.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h2 className="font-bold text-sm sm:text-base text-emerald-950 truncate group-hover:text-emerald-700 transition-colors">
                          {masjid.name_en}
                        </h2>
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-800 shrink-0">
                          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                        </div>
                      </div>
                      {isUrdu && masjid.name_ur && (
                        <p className="font-urdu text-xs text-emerald-800">{masjid.name_ur}</p>
                      )}
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {masjid.locality}, Hyderabad
                      </p>
                      <div className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3" />
                        <span>{masjid.distance_km ?? 0.8} km away</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Fast Jumu'ah & Prayer Tag on Bento Card */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span className="text-emerald-900">Friday Khutbah:</span>
                    <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                      {formatShortTime(masjid.jumuah_khutbah_1) || '12:45 PM'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}