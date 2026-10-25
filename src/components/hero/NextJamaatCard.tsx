'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Navigation,
  Compass,
  RefreshCw,
  LocateFixed,
  LocateOff,
  AlertTriangle,
} from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { useUserLocation } from '@/lib/hooks/useUserLocation';
import {
  calculatePrayerStatus,
  PrayerStatusResult,
} from '@/lib/utils/prayerTimes';
import {
  findKNearestMasjids,
  getDefaultMasjids,
  buildMasjidDirectionsUrl,
  buildLiveNearbyMasjidsUrl,
  ExternalMasjid,
} from '@/lib/services/osmMasjidService';
import { GpsPermissionModal } from '@/components/ui/GpsPermissionModal';

export function NextJamaatCard() {
  const {
    coords,
    loading: locLoading,
    isGpsEnabled,
    requestPermission,
  } = useUserLocation();

  const [mounted, setMounted] = useState(false);
  const [masjidList, setMasjidList] = useState<ExternalMasjid[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searching, setSearching] = useState(true);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);

  const [status, setStatus] = useState<PrayerStatusResult>({
    currentPrayer: '--',
    nextPrayer: 'Loading...',
    nextTimeFormatted: '--:--',
    timeRemainingText: '',
    isTomorrow: false,
    isJumuah: false,
  });

  // 1. Fetch live nearby masjids when GPS is enabled; otherwise load verified defaults
  useEffect(() => {
    let active = true;

    async function resolveMasjids() {
      if (locLoading) return;
      setSearching(true);

      if (isGpsEnabled && coords) {
        const nearest = await findKNearestMasjids(
          coords.latitude,
          coords.longitude,
          4500,
          3
        );

        if (active) {
          setMasjidList(nearest.length > 0 ? nearest : getDefaultMasjids());
          setSelectedIndex(0);
          setSearching(false);
        }
      } else {
        if (active) {
          setMasjidList(getDefaultMasjids());
          setSelectedIndex(0);
          setSearching(false);
        }
      }
    }

    resolveMasjids();

    return () => {
      active = false;
    };
  }, [coords, isGpsEnabled, locLoading]);

  // 2. Sync prayer session countdown with device clock
  useEffect(() => {
    setMounted(true);
    const updateStatus = () => {
      setStatus(calculatePrayerStatus(null, new Date()));
    };
    updateStatus();
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeMasjid = masjidList[selectedIndex] || masjidList[0] || null;

  // Handle GPS prompt button click
  const handleGpsEnableClick = () => {
    requestPermission();
    // If browser previously blocked permission, open the instruction popup
    if (!isGpsEnabled) {
      setIsGpsModalOpen(true);
    }
  };

  const handleDirectRoute = () => {
    const url = buildMasjidDirectionsUrl(
      isGpsEnabled ? coords : null,
      activeMasjid
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenRadarSearch = () => {
    const url = buildLiveNearbyMasjidsUrl(isGpsEnabled ? coords : null);
    window.open(url, '_blank', 'noopener,noreferrer');
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
        <div className="h-10 w-full bg-slate-200 rounded-xl" />
      </ClayCard>
    );
  }

  return (
    <>
      <ClayCard className="p-5 sm:p-6 flex flex-col justify-between bg-gradient-to-br from-white via-clay-surface to-[#F0FDF4] border border-white/80 shadow-clay-card relative overflow-hidden h-full">
        {/* Top Session & Countdown */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase block">
              Current: {status.currentPrayer}
            </span>
            <h2 className="text-xs font-semibold text-slate-500 mt-0.5">
              Next Jama&apos;at
            </h2>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60 shadow-sm flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3 text-emerald-700" />
            <span>{status.timeRemainingText}</span>
          </span>
        </div>

        {/* Prayer Name & Time */}
        <div className="my-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-950">
              {status.nextPrayer} Jama&apos;at
            </span>
            {status.isTomorrow && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                Tomorrow
              </span>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
            {status.nextTimeFormatted}
          </p>
        </div>

        {/* GPS ALERT BAR (Visible ONLY when user GPS is disabled/denied) */}
        {!isGpsEnabled && (
          <button
            type="button"
            onClick={handleGpsEnableClick}
            className="w-full mb-3 p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-between text-left transition-all active:scale-[0.98] group shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-amber-200/80 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-800" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-black block leading-tight">
                  GPS Disabled • Tap to Turn On
                </span>
                <span className="text-[10px] text-amber-700 font-medium block truncate">
                  Enable for real nearest masjids & accurate walking routes
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-md shrink-0 shadow-inner group-hover:bg-amber-300">
              Enable
            </span>
          </button>
        )}

        {/* Closest Masjid Selector & Navigation Controls */}
        <div className="pt-3 border-t border-slate-200/70 space-y-2.5">
          {/* Header Row */}
          <div className="flex items-center justify-between text-xs gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate font-bold text-emerald-950">
                {searching
                  ? 'Searching nearby masjids...'
                  : activeMasjid?.name || 'Masjid Nearby'}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {!searching && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isGpsEnabled && !activeMasjid?.isDefault
                      ? 'text-emerald-800 bg-emerald-100/80'
                      : 'text-amber-800 bg-amber-100/80'
                  }`}
                >
                  {isGpsEnabled && !activeMasjid?.isDefault ? (
                    <>
                      <LocateFixed className="w-2.5 h-2.5" />
                      <span>{activeMasjid?.formattedBadge}</span>
                    </>
                  ) : (
                    <>
                      <LocateOff className="w-2.5 h-2.5" />
                      <span>Default • {activeMasjid?.formattedBadge}</span>
                    </>
                  )}
                </span>
              )}

              <button
                type="button"
                onClick={handleGpsEnableClick}
                title={
                  isGpsEnabled
                    ? 'Refresh live GPS location'
                    : 'Click to enable GPS location'
                }
                className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-emerald-800 transition-colors"
              >
                <RefreshCw
                  className={`w-3 h-3 ${searching ? 'animate-spin text-emerald-700' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Quick Switcher for Top Masjids */}
          {masjidList.length > 0 && !searching && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
              {masjidList.map((m, idx) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg truncate max-w-[130px] transition-all shrink-0 cursor-pointer ${
                    selectedIndex === idx
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200/60'
                  }`}
                >
                  #{idx + 1} {m.name.replace(/^Masjid[- ]?(e[- ]?)?/i, '')} (
                  {m.formattedBadge})
                </button>
              ))}
            </div>
          )}

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-5 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={handleDirectRoute}
              className="col-span-3 clay-btn-emerald py-2 px-2.5 text-white rounded-xl shadow-clay-btn text-[11px] font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Navigation className="w-3 h-3 fill-white shrink-0" />
              <span className="truncate">
                {isGpsEnabled && !activeMasjid?.isDefault
                  ? selectedIndex === 0
                    ? 'Route to Closest'
                    : `Route to #${selectedIndex + 1}`
                  : 'Route to Masjid'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleOpenRadarSearch}
              title="Show all nearby masjids on Google Maps"
              className="col-span-2 py-2 px-2 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl shadow-sm text-[11px] font-bold flex items-center justify-center gap-1 transition-transform active:scale-95 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">All Nearby</span>
            </button>
          </div>
        </div>
      </ClayCard>

      {/* GPS Permission Guidance Modal */}
      <GpsPermissionModal
        isOpen={isGpsModalOpen}
        onClose={() => setIsGpsModalOpen(false)}
        onRetry={requestPermission}
      />
    </>
  );
}