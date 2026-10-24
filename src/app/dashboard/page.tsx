'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Flame,
  Award,
  Calendar,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Clock,
  MapPin,
  ArrowRight,
  Save,
  RotateCcw,
  BarChart3,
} from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';
import { getJumuahLifecycle } from '@/lib/utils/jummahDates';
import UserDashboardLoading from './loading';

interface SalahLog {
  id?: string;
  fajr: boolean;
  zuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  jumuah_attended: boolean;
}

export default function UserDashboardPage() {
  const supabase = createClient();
  const { showToast } = useToast();
  const jumuahInfo = getJumuahLifecycle();
  const todayDate = jumuahInfo.todayDateStr;

  const [user, setUser] = useState<any>(null);
  const [log, setLog] = useState<SalahLog>({
    fajr: false,
    zuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    jumuah_attended: false,
  });

  const [originalLog, setOriginalLog] = useState<SalahLog>({
    fajr: false,
    zuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    jumuah_attended: false,
  });

  const [lastJumuahAttended, setLastJumuahAttended] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    async function loadUserDataAndLogs() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // 1. Fetch today's prayer log
          const { data: todayLog } = await supabase
            .from('salah_logs')
            .select('*')
            .eq('user_id', user.id)
            .eq('log_date', todayDate)
            .maybeSingle();

          if (todayLog) {
            const loaded: SalahLog = {
              id: todayLog.id,
              fajr: Boolean(todayLog.fajr),
              zuhr: Boolean(todayLog.zuhr),
              asr: Boolean(todayLog.asr),
              maghrib: Boolean(todayLog.maghrib),
              isha: Boolean(todayLog.isha),
              jumuah_attended: Boolean(todayLog.jumuah_attended),
            };
            setLog(loaded);
            setOriginalLog(loaded);
          }

          // 2. Fetch previous completed Jumu'ah attendance
          const { data: pastJumuahRecord } = await supabase
            .from('salah_logs')
            .select('jumuah_attended')
            .eq('user_id', user.id)
            .eq('log_date', jumuahInfo.lastFridayDateStr)
            .maybeSingle();

          setLastJumuahAttended(pastJumuahRecord ? Boolean(pastJumuahRecord.jumuah_attended) : false);

          // 3. Compute active streak
          const { data: pastLogs } = await supabase
            .from('salah_logs')
            .select('log_date, fajr, zuhr, asr, maghrib, isha')
            .eq('user_id', user.id)
            .order('log_date', { ascending: false })
            .limit(30);

          if (pastLogs && pastLogs.length > 0) {
            let streak = 0;
            for (const item of pastLogs) {
              const allDone = item.fajr && item.zuhr && item.asr && item.maghrib && item.isha;
              if (allDone) {
                streak += 1;
              } else if (item.log_date !== todayDate) {
                break;
              }
            }
            setStreakDays(streak);
          }
        }
      } catch (err: any) {
        showToast(`Failed to fetch prayer log: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }

    loadUserDataAndLogs();
  }, [supabase, todayDate, showToast, jumuahInfo.lastFridayDateStr]);

  const togglePrayerSelection = (prayer: keyof Omit<SalahLog, 'id'>) => {
    setLog((prev) => ({ ...prev, [prayer]: !prev[prayer] }));
  };

  const hasUnsavedChanges =
    log.fajr !== originalLog.fajr ||
    log.zuhr !== originalLog.zuhr ||
    log.asr !== originalLog.asr ||
    log.maghrib !== originalLog.maghrib ||
    log.isha !== originalLog.isha ||
    log.jumuah_attended !== originalLog.jumuah_attended;

  const handleSavePrayers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('You must be signed in to submit prayer records.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('salah_logs').upsert(
        {
          user_id: user.id,
          log_date: todayDate,
          fajr: log.fajr,
          zuhr: log.zuhr,
          asr: log.asr,
          maghrib: log.maghrib,
          isha: log.isha,
          jumuah_attended: log.jumuah_attended,
        },
        { onConflict: 'user_id,log_date' }
      );

      if (error) throw error;

      setOriginalLog(log);
      showToast('Alhamdulillah! Your prayer records have been saved.', 'success');

      const allFiveDone = log.fajr && log.zuhr && log.asr && log.maghrib && log.isha;
      if (allFiveDone && streakDays === 0) {
        setStreakDays(1);
      }
    } catch (err: any) {
      showToast(`Error saving prayers: ${err?.message || 'Database rejected entry'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    setLog(originalLog);
    showToast('Reverted unsubmitted selections.', 'info');
  };

  // Replaced circle spinner with claymorphic skeleton
  if (loading) {
    return <UserDashboardLoading />;
  }

  const completedCount = [log.fajr, log.zuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 5) * 100);

  const prayerItems = [
    { key: 'fajr', label: 'Fajr', time: '05:15 AM', icon: Sunrise, color: 'text-amber-500' },
    { key: 'zuhr', label: 'Zuhr', time: '01:00 PM', icon: Sun, color: 'text-amber-500' },
    { key: 'asr', label: 'Asr', time: '05:00 PM', icon: Sun, color: 'text-amber-500' },
    { key: 'maghrib', label: 'Maghrib', time: '06:23 PM', icon: Sunset, color: 'text-orange-500' },
    { key: 'isha', label: 'Isha', time: '08:15 PM', icon: Moon, color: 'text-indigo-400' },
  ];

  return (
    <form onSubmit={handleSavePrayers} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Bento Tile 1: User Overview & Daily Progress */}
        <ClayCard className="md:col-span-2 p-6 flex flex-col justify-between bg-gradient-to-br from-white via-clay-surface to-[#E3EFE9]">
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase">
              Assalamu Alaikum
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Brother'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              You have marked {completedCount} of 5 daily prayers performed today.
            </p>
          </div>

          <div className="my-5">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-950 mb-1.5">
              <span>Daily Completion</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden shadow-inner">
              <div
                className="h-full bg-emerald-700 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 font-bold">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{streakDays} Day Streak</span>
            </div>
          </div>
        </ClayCard>

        {/* Bento Tile 2: Consistency Badge & Stats Shortcut */}
        <ClayCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-emerald-950">Consistency Status</h2>
            <p className="text-xs text-slate-500 mt-1">
              {streakDays >= 7
                ? 'Maintained 5 daily prayers on time over the past week.'
                : streakDays > 0
                ? `${streakDays} day streak active. Keep performing daily prayers on time.`
                : 'Complete all 5 prayers today to start your consistency streak.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {streakDays >= 7 ? 'Al-Mustaqeem' : 'Sabir'}
            </span>
            <Link
              href="/dashboard/stats"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-950 flex items-center gap-1 group"
            >
              <span>View Stats</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </ClayCard>

        {/* Bento Tile 3: Jumu'ah Lifecycle */}
        <ClayCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-emerald-950">Friday / Jumu&apos;ah</h2>
            <p className="text-xs text-slate-500 mt-1">
              {jumuahInfo.isTodayFriday
                ? "Today is Friday! Record your Jumu'ah congregation attendance below."
                : 'Track your last completed Friday congregation & upcoming prayer.'}
            </p>
          </div>

          <div className="my-3 space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Last Fri ({new Date(jumuahInfo.lastFridayDateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}):
              </span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  lastJumuahAttended
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {lastJumuahAttended ? 'Attended' : 'Not Recorded'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Next Friday:</span>
              <span className="font-bold text-emerald-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full text-[10px]">
                {jumuahInfo.isTodayFriday
                  ? 'Today'
                  : `in ${jumuahInfo.daysUntilNextFriday} day${jumuahInfo.daysUntilNextFriday === 1 ? '' : 's'}`}
              </span>
            </div>
          </div>

          {jumuahInfo.isTodayFriday ? (
            <button
              type="button"
              onClick={() => togglePrayerSelection('jumuah_attended')}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                log.jumuah_attended
                  ? 'bg-emerald-800 text-white shadow-clay-btn'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {log.jumuah_attended ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              <span>{log.jumuah_attended ? 'Congregation Marked' : 'Mark Jumu\'ah Attended'}</span>
            </button>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-[11px] font-semibold text-slate-500">
              Attendance opens on Friday
            </div>
          )}
        </ClayCard>

        {/* Bento Tile 4: Daily 5-Prayer Checklist with Submit Controls */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <ClayCard className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
              <div>
                <h2 className="text-base font-bold text-emerald-950">Daily Salah Checklist</h2>
                <p className="text-xs text-slate-500">
                  Select the prayers you completed, then tap &quot;Save Daily Prayers&quot; to update the database
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full animate-pulse">
                    Unsaved Changes
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                  {completedCount}/5 Selected
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {prayerItems.map((prayer) => {
                const Icon = prayer.icon;
                const isChecked = log[prayer.key as keyof Omit<SalahLog, 'id'>];

                return (
                  <div
                    key={prayer.key}
                    onClick={() => togglePrayerSelection(prayer.key as keyof Omit<SalahLog, 'id'>)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between min-h-[110px] select-none ${
                      isChecked
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-clay-btn'
                        : 'bg-white/80 hover:bg-white text-slate-800 border-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 ${isChecked ? 'text-amber-300' : prayer.color}`} />
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold block">{prayer.label}</span>
                      <span className={`text-[11px] font-medium ${isChecked ? 'text-emerald-200' : 'text-slate-400'}`}>
                        Approx {prayer.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  disabled={saving}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revert</span>
                </button>
              )}

              <button
                type="submit"
                disabled={saving || !hasUnsavedChanges}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  hasUnsavedChanges
                    ? 'clay-btn-emerald text-white shadow-clay-btn cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Updating Database...' : 'Save Daily Prayers'}</span>
              </button>
            </div>
          </ClayCard>
        </div>

        {/* Bento Tile 5: Direct Shortcut to Prayer Analytics Page */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <ClayCard className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 to-[#0A3327] text-white">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-emerald-200 shrink-0 shadow-inner">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Track Your Spiritual Growth</h3>
                <p className="text-xs text-emerald-200/90">
                  View daily, weekly, and monthly completion graphs along with Jumu&apos;ah consistency rates.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/stats"
              className="w-full sm:w-auto px-5 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 shrink-0"
            >
              <span>Open Analytics</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </ClayCard>
        </div>

      </div>
    </form>
  );
}