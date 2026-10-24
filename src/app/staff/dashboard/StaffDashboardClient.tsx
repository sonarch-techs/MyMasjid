'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  Building2,
  User,
  KeyRound,
  LogOut,
  ChevronRight,
  MapPin,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';
import { LogoutModal } from '@/components/ui/LogoutModal';

export default function StaffDashboardClient() {
  const [masjid, setMasjid] = useState<any>(null);
  const [timings, setTimings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadStaffMasjid() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: masjidData } = await supabase
          .from('masjids')
          .select('*')
          .eq('assigned_staff_id', user.id)
          .maybeSingle();

        if (masjidData) {
          setMasjid(masjidData);

          const { data: timingsData } = await supabase
            .from('prayer_timings')
            .select('*')
            .eq('masjid_id', masjidData.id)
            .maybeSingle();

          setTimings(timingsData);
        } else {
          // Fallback to first masjid if staff assignment is not yet linked
          const { data: defaultMasjid } = await supabase
            .from('masjids')
            .select('*')
            .limit(1)
            .single();

          if (defaultMasjid) {
            setMasjid(defaultMasjid);
            const { data: timingsData } = await supabase
              .from('prayer_timings')
              .select('*')
              .eq('masjid_id', defaultMasjid.id)
              .maybeSingle();
            setTimings(timingsData);
          }
        }
      } catch (err: any) {
        showToast(`Failed to load staff portal data: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }

    loadStaffMasjid();
  }, [supabase, showToast]);

  const confirmSignOut = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setIsLogoutModalOpen(false);
      showToast('Staff portal session ended safely.', 'info');
      router.push('/staff-login');
      router.refresh();
    } catch (err: any) {
      showToast(`Sign out failed: ${err.message}`, 'error');
    } finally {
      setLoggingOut(false);
    }
  };

  const navMenuItems = [
    { title: 'Dashboard Overview', desc: 'Main control center', icon: LayoutDashboard, href: '/staff/dashboard', active: true },
    { title: 'Update Timings', desc: 'Manage Azan & Jama\'at times', icon: Clock, href: '/staff/dashboard/timings' },
    { title: 'Masjid Profile & Photos', desc: 'Update details and landmarks', icon: Building2, href: '/staff/dashboard/masjid-profile' },
    { title: 'Public Directory View', desc: 'Preview public listing', icon: ExternalLink, href: `/masjids/${masjid?.id || ''}` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="max-w-md lg:max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-black text-emerald-950">Staff Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Manage prayer timings and masjid public profile</p>
        </div>

        <div className="max-w-md lg:max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT COLUMN: Muazzin Identity & Navigation Menu */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Muazzin Greeting Card (Light Clay theme) */}
              <ClayCard className="p-5 flex items-center gap-4 bg-gradient-to-br from-white via-clay-surface to-[#E3EFE9]">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner shrink-0">
                  <User className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    Assalamu Alaikum
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-emerald-950 truncate">
                    {masjid?.name_en || 'Masjid e Bilal'}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{masjid?.locality || 'Borabanda'}, Hyderabad</span>
                  </p>
                </div>
              </ClayCard>

              {/* Menu List */}
              <div className="space-y-2.5">
                {navMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className={`block rounded-2xl p-3.5 border transition-all duration-150 active:scale-[0.98] ${
                        item.active
                          ? 'bg-emerald-800 text-white shadow-clay-btn border-emerald-900'
                          : 'bg-clay-surface shadow-clay-card border-white/80 text-emerald-950 hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0 ${
                              item.active ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className={`text-sm font-bold ${item.active ? 'text-white' : 'text-emerald-950'}`}>
                              {item.title}
                            </h3>
                            <p className={`text-[11px] font-medium ${item.active ? 'text-emerald-100' : 'text-slate-500'}`}>
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 rtl:rotate-180 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                    </Link>
                  );
                })}

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full rounded-2xl p-3.5 bg-clay-surface shadow-clay-card border border-red-200/60 text-red-700 transition-transform duration-150 active:scale-[0.98] text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner shrink-0">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-red-800">Logout</h3>
                        <p className="text-[11px] text-red-500 font-medium">Exit staff portal</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400 rtl:rotate-180" />
                  </div>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Desktop Bento Workspace */}
            <div className="hidden lg:flex lg:col-span-7 flex-col space-y-6">
              
              {/* Bento Card 1: Currently Published Prayer Timings */}
              <ClayCard className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-emerald-950">Currently Published Timings</h2>
                    <p className="text-xs text-slate-500">Live timings currently shown to users and worshippers</p>
                  </div>
                  <Link
                    href="/staff/dashboard/timings"
                    className="clay-btn-emerald px-4 py-2 text-xs font-bold text-white rounded-xl shadow-clay-btn transition-transform active:scale-95 inline-flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Update Timings</span>
                  </Link>
                </div>

                {/* 5 Prayers Grid */}
                <div className="grid grid-cols-5 gap-3 pt-1">
                  {[
                    { name: 'Fajr', azan: timings?.fajr_azan, jamaat: timings?.fajr_jamaat },
                    { name: 'Zuhr', azan: timings?.zuhr_azan, jamaat: timings?.zuhr_jamaat },
                    { name: 'Asr', azan: timings?.asr_azan, jamaat: timings?.asr_jamaat },
                    { name: 'Maghrib', azan: timings?.maghrib_azan, jamaat: timings?.maghrib_jamaat },
                    { name: 'Isha', azan: timings?.isha_azan, jamaat: timings?.isha_jamaat },
                  ].map((p) => (
                    <div key={p.name} className="p-3 rounded-xl bg-white/80 border border-white shadow-sm text-center">
                      <span className="text-xs font-bold text-emerald-950 block mb-1">{p.name}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Azan: {p.azan?.slice(0, 5) || '--:--'}
                      </span>
                      <span className="text-xs font-bold text-emerald-900 block mt-0.5">
                        {p.jamaat?.slice(0, 5) || '--:--'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Friday Jumu'ah Summary */}
                <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-amber-950">Friday / Jumu&apos;ah Khutbah</span>
                  </div>
                  <div className="flex items-center gap-3 font-semibold text-slate-600">
                    <span>Khutbah 1: <strong className="text-emerald-950 font-bold">{timings?.jumuah_khutbah_1?.slice(0, 5) || '12:45'}</strong></span>
                    <span>Khutbah 2: <strong className="text-emerald-950 font-bold">{timings?.jumuah_khutbah_2?.slice(0, 5) || '13:30'}</strong></span>
                  </div>
                </div>
              </ClayCard>

              {/* Bento Card 2: Quick Links */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                <ClayCard className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner mb-3">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-emerald-950">Masjid Photos & Landmarks</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload exterior/interior photos and provide local reference points.
                    </p>
                  </div>
                  <Link
                    href="/staff/dashboard/masjid-profile"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                  >
                    <span>Edit Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </ClayCard>

                <ClayCard className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner mb-3">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-emerald-950">Public Directory Preview</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Check how your congregation view your daily schedule on mobile.
                    </p>
                  </div>
                  <Link
                    href={`/masjids/${masjid?.id || ''}`}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-800 hover:text-blue-950"
                  >
                    <span>View Public Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </ClayCard>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Cautionary Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmSignOut}
        loading={loggingOut}
        title="Exit Staff Portal"
        description="Are you sure you want to end your Muazzin/Staff session?"
        warningMessage="Ending this session will lock daily Azan/Jama'at timing adjustments and photo uploads until you re-authenticate."
        confirmText="Yes, Log Out"
      />
    </>
  );
}