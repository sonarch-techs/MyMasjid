'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Calendar,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Flame,
} from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';
import PrayerStatsLoading from './loading';

type TimeRange = 'daily' | 'weekly' | 'monthly';

interface DailyStat {
  date: string;
  dayLabel: string;
  completedCount: number;
  percentage: number;
  fajr: boolean;
  zuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

interface WeeklyStat {
  weekLabel: string;
  completionRate: number;
  totalPrayers: number;
  jumuahAttended: boolean;
}

interface MonthlyStat {
  monthLabel: string;
  completionRate: number;
  totalLoggedDays: number;
}

export default function PrayerStatsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TimeRange>('daily');
  const [loading, setLoading] = useState(true);

  const [totalPrayersLogged, setTotalPrayersLogged] = useState(0);
  const [overallConsistency, setOverallConsistency] = useState(0);
  const [jumuahAttendedCount, setJumuahAttendedCount] = useState(0);
  const [totalJumuahCount, setTotalJumuahCount] = useState(0);

  const [prayerBreakdown, setPrayerBreakdown] = useState({
    fajr: 0,
    zuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  });

  const [dailyData, setDailyData] = useState<DailyStat[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyStat[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyStat[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 180);
        const pastDateStr = pastDate.toISOString().split('T')[0];

        const { data: rawLogs, error } = await supabase
          .from('salah_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('log_date', pastDateStr)
          .order('log_date', { ascending: true });

        if (error) throw error;

        const logs = rawLogs || [];

        let totalCount = 0;
        let fajrC = 0, zuhrC = 0, asrC = 0, maghribC = 0, ishaC = 0;
        let jumuahCount = 0;
        let attendedJumuah = 0;

        logs.forEach((item) => {
          if (item.fajr) { fajrC++; totalCount++; }
          if (item.zuhr) { zuhrC++; totalCount++; }
          if (item.asr) { asrC++; totalCount++; }
          if (item.maghrib) { maghribC++; totalCount++; }
          if (item.isha) { ishaC++; totalCount++; }

          const d = new Date(item.log_date);
          if (d.getDay() === 5) {
            jumuahCount++;
            if (item.jumuah_attended) attendedJumuah++;
          }
        });

        const totalPossible = Math.max(logs.length * 5, 1);
        setTotalPrayersLogged(totalCount);
        setOverallConsistency(Math.round((totalCount / totalPossible) * 100));
        setJumuahAttendedCount(attendedJumuah);
        setTotalJumuahCount(Math.max(jumuahCount, 1));

        const loggedDaysCount = Math.max(logs.length, 1);
        setPrayerBreakdown({
          fajr: Math.round((fajrC / loggedDaysCount) * 100),
          zuhr: Math.round((zuhrC / loggedDaysCount) * 100),
          asr: Math.round((asrC / loggedDaysCount) * 100),
          maghrib: Math.round((maghribC / loggedDaysCount) * 100),
          isha: Math.round((ishaC / loggedDaysCount) * 100),
        });

        // Daily Data (Last 7 Days)
        const dailyArr: DailyStat[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

          const match = logs.find((l) => l.log_date === dateStr);
          const cCount = match
            ? [match.fajr, match.zuhr, match.asr, match.maghrib, match.isha].filter(Boolean).length
            : 0;

          dailyArr.push({
            date: dateStr,
            dayLabel: dayName,
            completedCount: cCount,
            percentage: Math.round((cCount / 5) * 100),
            fajr: Boolean(match?.fajr),
            zuhr: Boolean(match?.zuhr),
            asr: Boolean(match?.asr),
            maghrib: Boolean(match?.maghrib),
            isha: Boolean(match?.isha),
          });
        }
        setDailyData(dailyArr);

        // Weekly Data (Last 6 Weeks)
        const weeklyArr: WeeklyStat[] = [];
        for (let w = 5; w >= 0; w--) {
          const endD = new Date();
          endD.setDate(endD.getDate() - w * 7);
          const startD = new Date(endD);
          startD.setDate(startD.getDate() - 6);

          const startStr = startD.toISOString().split('T')[0];
          const endStr = endD.toISOString().split('T')[0];

          const weekLogs = logs.filter((l) => l.log_date >= startStr && l.log_date <= endStr);
          let prayersInWeek = 0;
          let hadJumuah = false;

          weekLogs.forEach((l) => {
            prayersInWeek += [l.fajr, l.zuhr, l.asr, l.maghrib, l.isha].filter(Boolean).length;
            if (l.jumuah_attended) hadJumuah = true;
          });

          weeklyArr.push({
            weekLabel: `Wk ${6 - w}`,
            totalPrayers: prayersInWeek,
            completionRate: Math.round((prayersInWeek / 35) * 100),
            jumuahAttended: hadJumuah,
          });
        }
        setWeeklyData(weeklyArr);

        // Monthly Data (Last 6 Months)
        const monthlyArr: MonthlyStat[] = [];
        for (let m = 5; m >= 0; m--) {
          const target = new Date();
          target.setMonth(target.getMonth() - m);
          const mNum = target.getMonth();
          const yNum = target.getFullYear();
          const monthLabel = target.toLocaleDateString('en-US', { month: 'short' });

          const monthLogs = logs.filter((l) => {
            const ld = new Date(l.log_date);
            return ld.getMonth() === mNum && ld.getFullYear() === yNum;
          });

          let mPrayers = 0;
          monthLogs.forEach((l) => {
            mPrayers += [l.fajr, l.zuhr, l.asr, l.maghrib, l.isha].filter(Boolean).length;
          });

          const maxPossibleInMonth = Math.max(monthLogs.length * 5, 1);
          monthlyArr.push({
            monthLabel,
            totalLoggedDays: monthLogs.length,
            completionRate: Math.round((mPrayers / maxPossibleInMonth) * 100),
          });
        }
        setMonthlyData(monthlyArr);

      } catch (err: any) {
        showToast(`Failed to load prayer statistics: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase, router, showToast]);

  // Replaced circle spinner with claymorphic skeleton
  if (loading) {
    return <PrayerStatsLoading />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950">Prayer History & Graphs</h1>
            <p className="text-xs text-slate-500 font-medium">Daily, weekly, and monthly prayer consistency analysis</p>
          </div>
        </div>

        <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 shadow-inner self-start sm:self-auto border border-white/60">
          {(['daily', 'weekly', 'monthly'] as TimeRange[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-emerald-800 text-white shadow-clay-btn'
                  : 'text-slate-600 hover:text-emerald-950'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <ClayCard className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">Total Prayers</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-950">{totalPrayersLogged}</span>
          </div>
        </ClayCard>

        <ClayCard className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">Consistency Rate</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-950">{overallConsistency}%</span>
          </div>
        </ClayCard>

        <ClayCard className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">Jumu&apos;ah Attended</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-950">{jumuahAttendedCount}</span>
          </div>
        </ClayCard>

        <ClayCard className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shadow-inner shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">Status Tier</span>
            <span className="text-base sm:text-lg font-black text-emerald-950">
              {overallConsistency >= 80 ? 'Al-Mustaqeem' : 'Sabir'}
            </span>
          </div>
        </ClayCard>
      </div>

      {/* Main Graph Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Interactive Graph Container */}
        <div className="lg:col-span-8">
          <ClayCard className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-emerald-950">
                  {activeTab === 'daily'
                    ? 'Daily Prayer Completion (Last 7 Days)'
                    : activeTab === 'weekly'
                    ? 'Weekly Performance Breakdown (Last 6 Weeks)'
                    : 'Monthly Consistency Trend (Last 6 Months)'}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeTab === 'daily'
                    ? 'Track prayers completed out of 5 each day'
                    : activeTab === 'weekly'
                    ? 'Average weekly adherence percentage out of 35 total prayers'
                    : 'Long-term spiritual habit momentum'}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                {activeTab === 'daily' ? 'Target: 5/day' : 'Target: 100%'}
              </span>
            </div>

            {/* TAB 1: DAILY CLAYMORHPIC BAR CHART */}
            {activeTab === 'daily' && (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-8 pb-2 px-2">
                  {dailyData.map((d, idx) => {
                    const heightPercent = Math.max((d.completedCount / 5) * 100, 8);
                    const isPerfect = d.completedCount === 5;

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[11px] font-bold text-emerald-900 bg-white/90 shadow-sm border border-emerald-100 px-1.5 py-0.5 rounded-md opacity-90 group-hover:scale-110 transition-transform">
                          {d.completedCount}/5
                        </span>

                        <div className="w-full max-w-[42px] h-40 bg-slate-100 shadow-inner rounded-2xl p-1 flex items-end">
                          <div
                            className={`w-full rounded-xl transition-all duration-500 shadow-md ${
                              isPerfect
                                ? 'bg-gradient-to-t from-emerald-800 to-emerald-600 shadow-clay-btn'
                                : d.completedCount >= 3
                                ? 'bg-gradient-to-t from-emerald-700 to-emerald-500'
                                : 'bg-gradient-to-t from-amber-600 to-amber-400'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>

                        <div className="text-center">
                          <span className="text-xs font-bold text-emerald-950 block">{d.dayLabel}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: WEEKLY BAR CHART */}
            {activeTab === 'weekly' && (
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-3 sm:gap-4 items-end h-56 pt-8 pb-2 px-2">
                  {weeklyData.map((w, idx) => {
                    const barHeight = Math.max(w.completionRate, 6);

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[11px] font-bold text-emerald-900 bg-white/90 shadow-sm border border-emerald-100 px-2 py-0.5 rounded-md">
                          {w.completionRate}%
                        </span>

                        <div className="w-full max-w-[48px] h-40 bg-slate-100 shadow-inner rounded-2xl p-1 flex items-end">
                          <div
                            className="w-full rounded-xl bg-gradient-to-t from-emerald-800 to-emerald-500 shadow-clay-btn transition-all duration-500"
                            style={{ height: `${barHeight}%` }}
                          />
                        </div>

                        <div className="text-center">
                          <span className="text-xs font-bold text-emerald-950 block">{w.weekLabel}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            w.jumuahAttended ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400'
                          }`}>
                            {w.jumuahAttended ? "Jumu'ah" : 'Missed'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: MONTHLY PROGRESS BARS */}
            {activeTab === 'monthly' && (
              <div className="space-y-4 py-2">
                {monthlyData.map((m, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-950">{m.monthLabel}</span>
                      <span className="text-emerald-800">{m.completionRate}% Consistency</span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 shadow-inner rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-500 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${Math.max(m.completionRate, 3)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

          </ClayCard>
        </div>

        {/* Right Column: Individual Prayer Matrix Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          <ClayCard className="p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-emerald-950">Prayer-by-Prayer Reliability</h2>
              <p className="text-xs text-slate-500">Historical performance across each of the 5 prayers</p>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { name: 'Fajr', percent: prayerBreakdown.fajr, color: 'bg-amber-500' },
                { name: 'Zuhr', percent: prayerBreakdown.zuhr, color: 'bg-amber-500' },
                { name: 'Asr', percent: prayerBreakdown.asr, color: 'bg-amber-500' },
                { name: 'Maghrib', percent: prayerBreakdown.maghrib, color: 'bg-orange-500' },
                { name: 'Isha', percent: prayerBreakdown.isha, color: 'bg-indigo-500' },
              ].map((p) => (
                <div key={p.name} className="p-3 rounded-2xl bg-white/80 border border-white shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                    <span className="text-xs font-bold text-emerald-950">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-emerald-700 rounded-full"
                        style={{ width: `${p.percent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-emerald-900 w-9 text-right">
                      {p.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Overall Recorded Days</span>
              <strong className="text-emerald-950">{totalPrayersLogged > 0 ? Math.ceil(totalPrayersLogged / 5) : 0} days</strong>
            </div>
          </ClayCard>
        </div>

      </div>

    </div>
  );
}