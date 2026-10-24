'use client';

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Navigation, ExternalLink, RefreshCw } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { useUserLocation } from '@/lib/hooks/useUserLocation';
import {
  calculatePrayerStatus,
  PrayerStatusResult,
} from '@/lib/utils/prayerTimes';
import {
  fetchNearestMosquesWithoutDb,
  ExternalMasjid,
} from '@/lib/services/osmMasjidService';

export function NextJamaatCard() {
  const { coords, loading: locLoading, requestPermission } = useUserLocation();

  const [mounted, setMounted] = useState(false);
  const [nearestMasjid, setNearestMasjid] = useState<ExternalMasjid | null>(null);
  const [searching, setSearching] = useState(true);

  const [status, setStatus] = useState<PrayerStatusResult>({
    currentPrayer: '--',
    nextPrayer: 'Loading...',
    nextTimeFormatted: '--:--',
    timeRemainingText: '',
    isTomorrow: false,
    isJumuah: false,
  });

  // 1. Fetch nearest mosque directly via OSM without touching Supabase DB
  useEffect(() => {
    let isSubscribed = true;

    async function loadNearest() {
      // Default to user's location, or Hyderabad CCX4+HV Borabanda coordinates
      const lat = coords?.latitude ?? 17.4488;
      const lng = coords?.longitude ?? 78.4071;

      setSearching(true);
      const results = await fetchNearestMosquesWithoutDb(lat, lng, 3000);

      if (isSubscribed && results.length > 0) {
        setNearestMasjid(results[0]);
      }
      if (isSubscribed) setSearching(false);
    }

    loadNearest();

    return () => {
      isSubscribed = false;
    };
  }, [coords]);

  // 2. Real-time prayer countdown according to device clock
  useEffect(() => {
    setMounted(true);

    const updateStatus = () => {
      // Standard local prayer window calculations
      const result = calculatePrayerStatus(null, new Date());
      setStatus(result);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Open turn-by-turn directions directly in Google Maps
  const handleNavigateToMasjid = () => {
    if (nearestMasjid) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${nearestMasjid.latitude},${nearestMasjid.longitude}&destination_place_id=${encodeURIComponent(
        nearestMasjid.name
      )}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const lat = coords?.latitude ?? 17.4488;
      const lng = coords?.longitude ?? 78.4071;
      const url = `https://www.google.com/maps/search/masjid/@${lat},${lng},16z`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!mounted || locLoading) {
    return (
      <ClayCard className="p-6 flex flex-col justify-between bg-white border border-white/80 shadow-clay-card animate-pulse min-h-[260px]">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-6 w-44 bg-slate-200 rounded" />
        </div>
        <div className="my-4 space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-10 w-32 bg-slate-200 rounded" />
        </div>
        <div className="h-4 w-40 bg-slate-200 rounded" />
      </ClayCard>
    );
  }

  return (
    <ClayCard className="p-6 flex flex-col justify-between bg-gradient-to-br from-white via-clay-surface to-[#F0FDF4] border border-white/80 shadow-clay-card relative overflow-hidden group min-h-[260px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Labels */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase block">
            Current Session: {status.currentPrayer}
          </span>
          <h2 className="text-sm font-semibold text-slate-500 mt-0.5">
            Next Jama&apos;at
          </h2>
        </div>

        {/* Live Countdown Badge */}
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60 shadow-sm flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3 text-emerald-700" />
          <span>{status.timeRemainingText}</span>
        </span>
      </div>

      {/* Main Prayer & Time Display */}
      <div className="my-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-emerald-950">
            {status.nextPrayer} Jama&apos;at
          </span>
          {status.isTomorrow && (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
              Tomorrow
            </span>
          )}
        </div>
        <p className="text-3xl sm:text-4xl font-black text-emerald-800 tracking-tight mt-1">
          {status.nextTimeFormatted}
        </p>
      </div>

      {/* Nearest Mosque Card & 1-Tap Google Maps Navigation */}
      <div className="pt-3 border-t border-slate-200/70 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 truncate max-w-[210px]">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate font-semibold text-slate-700">
              {searching ? (
                'Detecting nearest masjid...'
              ) : (
                <>
                  <strong className="text-emerald-950">{nearestMasjid?.name}</strong>
                  {nearestMasjid && ` (${nearestMasjid.distanceKm} km)`}
                </>
              )}
            </span>
          </div>

          <button
            onClick={requestPermission}
            title="Refresh GPS location"
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-800 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${searching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Direct Action Button to Google Maps */}
        <button
          onClick={handleNavigateToMasjid}
          className="w-full clay-btn-emerald py-2.5 px-3 text-white rounded-xl shadow-clay-btn text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 fill-white" />
          <span>Direct to Nearest Masjid (Maps)</span>
          <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
        </button>
      </div>
    </ClayCard>
  );
}