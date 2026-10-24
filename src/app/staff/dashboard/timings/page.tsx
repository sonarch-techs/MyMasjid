'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Calendar,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Clock,
  Check,
  Building2,
} from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';

export default function UpdateTimingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [masjid, setMasjid] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Date selection state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Timings state
  const [timings, setTimings] = useState({
    fajr_azan: '04:45',
    fajr_jamaat: '05:15',
    zuhr_azan: '12:30',
    zuhr_jamaat: '13:00',
    asr_azan: '16:45',
    asr_jamaat: '17:00',
    maghrib_azan: '18:18',
    maghrib_jamaat: '18:23',
    isha_azan: '19:45',
    isha_jamaat: '20:15',
    jumuah_khutbah_1: '12:45',
    jumuah_khutbah_2: '13:30',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Retrieve assigned masjid
        const { data: masjidData } = await supabase
          .from('masjids')
          .select('*')
          .eq('assigned_staff_id', user.id)
          .maybeSingle();

        const currentMasjid =
          masjidData || (await supabase.from('masjids').select('*').limit(1).single()).data;
        setMasjid(currentMasjid);

        if (currentMasjid) {
          const { data: pt } = await supabase
            .from('prayer_timings')
            .select('*')
            .eq('masjid_id', currentMasjid.id)
            .maybeSingle();

          if (pt) {
            setTimings({
              fajr_azan: pt.fajr_azan?.slice(0, 5) || '04:45',
              fajr_jamaat: pt.fajr_jamaat?.slice(0, 5) || '05:15',
              zuhr_azan: pt.zuhr_azan?.slice(0, 5) || '12:30',
              zuhr_jamaat: pt.zuhr_jamaat?.slice(0, 5) || '13:00',
              asr_azan: pt.asr_azan?.slice(0, 5) || '16:45',
              asr_jamaat: pt.asr_jamaat?.slice(0, 5) || '17:00',
              maghrib_azan: pt.maghrib_azan?.slice(0, 5) || '18:18',
              maghrib_jamaat: pt.maghrib_jamaat?.slice(0, 5) || '18:23',
              isha_azan: pt.isha_azan?.slice(0, 5) || '19:45',
              isha_jamaat: pt.isha_jamaat?.slice(0, 5) || '20:15',
              jumuah_khutbah_1: pt.jumuah_khutbah_1?.slice(0, 5) || '12:45',
              jumuah_khutbah_2: pt.jumuah_khutbah_2?.slice(0, 5) || '13:30',
            });
          }
        }
      } catch (err: any) {
        showToast(`Failed to load prayer timings: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase, showToast]);

  const handleUseToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleInputChange = (field: string, value: string) => {
    setTimings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masjid) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('prayer_timings').upsert(
        {
          masjid_id: masjid.id,
          effective_date: selectedDate,
          fajr_azan: timings.fajr_azan,
          fajr_jamaat: timings.fajr_jamaat,
          zuhr_azan: timings.zuhr_azan,
          zuhr_jamaat: timings.zuhr_jamaat,
          asr_azan: timings.asr_azan,
          asr_jamaat: timings.asr_jamaat,
          maghrib_azan: timings.maghrib_azan,
          maghrib_jamaat: timings.maghrib_jamaat,
          isha_azan: timings.isha_azan,
          isha_jamaat: timings.isha_jamaat,
          jumuah_khutbah_1: timings.jumuah_khutbah_1,
          jumuah_khutbah_2: timings.jumuah_khutbah_2 || null,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'masjid_id' }
      );

      if (error) throw error;
      showToast('Prayer timings updated and published successfully!', 'success');
    } catch (err: any) {
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const prayers = [
    { key: 'fajr', label: 'Fajr', icon: Sunrise, color: 'text-amber-500' },
    { key: 'zuhr', label: 'Zuhr', icon: Sun, color: 'text-amber-500' },
    { key: 'asr', label: 'Asr', icon: Sun, color: 'text-amber-500' },
    { key: 'maghrib', label: 'Maghrib', icon: Sunset, color: 'text-orange-500' },
    { key: 'isha', label: 'Isha', icon: Moon, color: 'text-indigo-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Top Header */}
      <div className="max-w-md lg:max-w-4xl mx-auto flex items-center justify-between pb-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <span className="text-sm sm:text-base font-bold text-emerald-950">Update Timings</span>
        <div className="w-9" />
      </div>

      <form onSubmit={handleSaveChanges} className="max-w-md lg:max-w-4xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Masjid Identity Card */}
        <ClayCard className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-900/10 border border-emerald-900/20 overflow-hidden shrink-0">
            {masjid?.images?.[0] ? (
              <img src={masjid.images[0]} alt={masjid?.name_en} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-emerald-800">
                <Building2 className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-emerald-950">{masjid?.name_en || 'Masjid e Bilal'}</h2>
            <p className="text-xs text-slate-500 font-medium">{masjid?.address || 'Borabanda, Hyderabad'}</p>
          </div>
        </ClayCard>

        {/* Date Selection Bar */}
        <ClayCard className="p-4 sm:p-5 space-y-2">
          <label className="text-xs font-bold text-slate-600 block">Select Effective Date</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#EBF0ED] shadow-neu-inset text-slate-800 text-xs font-semibold rounded-xl px-4 py-2.5 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleUseToday}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold active:scale-95 transition-transform shrink-0 shadow-sm"
            >
              Use Today
            </button>
          </div>
        </ClayCard>

        {/* Daily Prayers Form Table */}
        <ClayCard className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-3 text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
            <span>Prayer</span>
            <span className="text-center">Azan Time</span>
            <span className="text-right">Jamaat Time</span>
          </div>

          <div className="space-y-3">
            {prayers.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.key}
                  className="grid grid-cols-3 items-center gap-2 p-3 rounded-xl bg-white/80 border border-white shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${p.color}`} />
                    <span className="text-xs sm:text-sm font-bold text-emerald-950">{p.label}</span>
                  </div>

                  <div className="flex justify-center">
                    <input
                      type="time"
                      value={timings[`${p.key}_azan` as keyof typeof timings]}
                      onChange={(e) => handleInputChange(`${p.key}_azan`, e.target.value)}
                      className="bg-[#EBF0ED] shadow-neu-inset text-slate-800 text-xs font-bold text-center rounded-lg px-2.5 py-1.5 focus:outline-none w-24"
                    />
                  </div>

                  <div className="flex justify-end">
                    <input
                      type="time"
                      value={timings[`${p.key}_jamaat` as keyof typeof timings]}
                      onChange={(e) => handleInputChange(`${p.key}_jamaat`, e.target.value)}
                      className="bg-[#EBF0ED] shadow-neu-inset text-emerald-900 text-xs font-bold text-center rounded-lg px-2.5 py-1.5 focus:outline-none w-24"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ClayCard>

        {/* Friday / Jumu'ah Timings Section */}
        <ClayCard className="p-4 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>Friday / Jumu&apos;ah Timings (Optional)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white/80 border border-white shadow-sm flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Khutbah 1</span>
              <input
                type="time"
                value={timings.jumuah_khutbah_1}
                onChange={(e) => handleInputChange('jumuah_khutbah_1', e.target.value)}
                className="bg-[#EBF0ED] shadow-neu-inset text-slate-800 text-xs font-bold text-center rounded-lg px-2.5 py-1.5 focus:outline-none w-28"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 border border-white shadow-sm flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Khutbah 2</span>
              <input
                type="time"
                value={timings.jumuah_khutbah_2}
                onChange={(e) => handleInputChange('jumuah_khutbah_2', e.target.value)}
                className="bg-[#EBF0ED] shadow-neu-inset text-slate-800 text-xs font-bold text-center rounded-lg px-2.5 py-1.5 focus:outline-none w-28"
              />
            </div>
          </div>
        </ClayCard>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full clay-btn-emerald py-3.5 px-4 text-white text-sm font-bold rounded-xl shadow-clay-btn transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span>{saving ? 'Saving changes...' : 'Save & Publish Timings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}