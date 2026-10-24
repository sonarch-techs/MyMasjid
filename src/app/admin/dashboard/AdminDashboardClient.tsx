'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  Clock,
  Users,
  PlusCircle,
  FileQuestion,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  Trash2,
  Check,
  ArrowRight,
} from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';
import { LogoutModal } from '@/components/ui/LogoutModal';

interface DashboardMetrics {
  totalMasjids: number;
  activeMasjids: number;
  pendingMasjids: number;
  totalUsers: number;
}

export default function AdminDashboardClient() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalMasjids: 0,
    activeMasjids: 0,
    pendingMasjids: 0,
    totalUsers: 0,
  });
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadMetricsAndData();
  }, []);

  const loadMetricsAndData = async () => {
    try {
      // 1. Fetch masjids inventory
      const { data: masjids, error: mError } = await supabase
        .from('masjids')
        .select('*')
        .order('created_at', { ascending: false });

      if (mError) throw mError;

      // 2. Fetch users count
      const { count: userCount, error: uError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (uError) throw uError;

      const total = masjids?.length || 0;
      const active = masjids?.filter((m) => m.status === 'active').length || 0;
      const pendingItems = masjids?.filter((m) => m.status === 'pending') || [];

      setMetrics({
        totalMasjids: total,
        activeMasjids: active,
        pendingMasjids: pendingItems.length,
        totalUsers: userCount || 0,
      });

      // Show top 5 masjids in dashboard preview
      setMasjidList((masjids || []).slice(0, 5));
      setPendingQueue(pendingItems.slice(0, 3));
    } catch (err: any) {
      showToast(`Failed to load admin metrics: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePending = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('masjids')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      showToast(`Approved "${name}"! It is now live in the directory.`, 'success');
      // Refresh dashboard state
      loadMetricsAndData();
    } catch (err: any) {
      showToast(`Approval failed: ${err.message}`, 'error');
    }
  };

  const handleDeleteMasjid = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the directory?`)) return;

    try {
      const { error } = await supabase.from('masjids').delete().eq('id', id);
      if (error) throw error;

      setMasjidList((prev) => prev.filter((m) => m.id !== id));
      setMetrics((prev) => ({
        ...prev,
        totalMasjids: Math.max(0, prev.totalMasjids - 1),
      }));
      showToast(`Removed "${name}" from directory.`, 'success');
    } catch (err: any) {
      showToast(`Deletion failed: ${err.message}`, 'error');
    }
  };

  const confirmSignOut = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setIsLogoutModalOpen(false);
      showToast('Admin session terminated safely.', 'info');
      router.push('/login');
      router.refresh();
    } catch (err: any) {
      showToast(`Logout failed: ${err.message}`, 'error');
    } finally {
      setLoggingOut(false);
    }
  };

  const adminMenuOptions = [
    {
      title: 'Masjid List',
      desc: 'View and manage directory',
      icon: Building2,
      href: '/admin/dashboard/masjids',
      color: 'text-emerald-800 bg-emerald-100',
    },
    {
      title: 'Add New Masjid',
      desc: 'Register location and GPS coordinates',
      icon: PlusCircle,
      href: '/admin/dashboard/masjids/new',
      color: 'text-emerald-800 bg-emerald-100',
    },
    {
      title: 'Manage Users',
      desc: 'Add, promote, or assign staff accounts',
      icon: Users,
      href: '/admin/dashboard/users',
      color: 'text-emerald-800 bg-emerald-100',
    },
    {
      title: 'Pending Requests',
      desc: 'Review submissions queue',
      icon: FileQuestion,
      href: '/admin/dashboard/pending',
      color: 'text-amber-800 bg-amber-100',
    },
    {
      title: 'Settings',
      desc: 'Radius and system configuration',
      icon: Settings,
      href: '/admin/dashboard/settings',
      color: 'text-slate-700 bg-slate-200',
    },
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
        <div className="max-w-md lg:max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-black text-emerald-950">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Manage masjids, staff, and system records</p>
        </div>

        <div className="max-w-md lg:max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT SECTION: 2x2 KPI Grid & Admin Navigation Menu */}
            <div className="lg:col-span-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <ClayCard className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block leading-tight">Total Masjids</span>
                    <span className="text-xl font-black text-emerald-950">{metrics.totalMasjids}</span>
                  </div>
                </ClayCard>

                <ClayCard className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block leading-tight">Active</span>
                    <span className="text-xl font-black text-emerald-950">{metrics.activeMasjids}</span>
                  </div>
                </ClayCard>

                <ClayCard className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block leading-tight">Pending</span>
                    <span className="text-xl font-black text-emerald-950">{metrics.pendingMasjids}</span>
                  </div>
                </ClayCard>

                <ClayCard className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block leading-tight">Total Users</span>
                    <span className="text-xl font-black text-emerald-950">{metrics.totalUsers}</span>
                  </div>
                </ClayCard>
              </div>

              <div className="space-y-2.5">
                {adminMenuOptions.map((opt, i) => {
                  const Icon = opt.icon;
                  return (
                    <Link
                      key={i}
                      href={opt.href}
                      className="block rounded-2xl p-3.5 bg-clay-surface shadow-clay-card border border-white/80 transition-transform duration-150 active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0 ${opt.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h2 className="text-sm font-bold text-emerald-950">{opt.title}</h2>
                            <p className="text-[11px] text-slate-500 font-medium">{opt.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 rtl:rotate-180" />
                      </div>
                    </Link>
                  );
                })}

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
                        <h2 className="text-sm font-bold text-red-800">Logout</h2>
                        <p className="text-[11px] text-red-500 font-medium">Exit admin control</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400 rtl:rotate-180" />
                  </div>
                </button>
              </div>
            </div>

            {/* RIGHT SECTION: Desktop Bento Workspace */}
            <div className="hidden lg:flex lg:col-span-7 flex-col space-y-6">
              
              {/* Bento Card 1: Master Masjid Directory Table */}
              <ClayCard className="p-6 space-y-4 flex-1">
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-emerald-950">Master Masjid Directory</h2>
                    <p className="text-xs text-slate-500">Recently registered and active masjids</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/admin/dashboard/masjids"
                      className="px-3 py-1.5 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-xs font-bold text-emerald-950 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </Link>
                    <Link
                      href="/admin/dashboard/masjids/new"
                      className="clay-btn-emerald px-3.5 py-1.5 text-xs font-bold text-white rounded-xl shadow-clay-btn transition-transform active:scale-95 inline-flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                        <th className="pb-2.5 font-bold">Masjid</th>
                        <th className="pb-2.5 font-bold">Locality</th>
                        <th className="pb-2.5 font-bold">Status</th>
                        <th className="pb-2.5 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {masjidList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400">
                            No masjids registered yet.
                          </td>
                        </tr>
                      ) : (
                        masjidList.map((m) => (
                          <tr key={m.id} className="hover:bg-white/50 transition-colors">
                            <td className="py-3 font-bold text-emerald-950 flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${m.status === 'active' ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                              <span>{m.name_en}</span>
                            </td>
                            <td className="py-3 text-slate-600 font-medium">{m.locality}</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                  m.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {m.status}
                              </span>
                            </td>
                            <td className="py-3 text-right space-x-2">
                              <Link
                                href={`/masjids/${m.id}`}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 inline-block transition-colors"
                                title="View Public Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => handleDeleteMasjid(m.id, m.name_en)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 inline-block active:scale-95 transition-transform"
                                title="Remove Masjid"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </ClayCard>

              {/* Bento Card 2: Live Pending Queue */}
              <ClayCard className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="w-5 h-5 text-amber-600" />
                    <h3 className="text-sm font-bold text-emerald-950">Pending Approvals Queue</h3>
                  </div>
                  <Link
                    href="/admin/dashboard/pending"
                    className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
                  >
                    <span>Open Queue ({metrics.pendingMasjids})</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                </div>
                <p className="text-xs text-slate-500">
                  New submissions awaiting admin verification before appearing on public maps.
                </p>

                {pendingQueue.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500 font-medium">
                    No pending items in queue. All submissions are up to date!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pendingQueue.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-amber-950 block">{m.name_en}</span>
                          <span className="text-[11px] text-amber-700">{m.locality}, {m.address}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprovePending(m.id, m.name_en)}
                            className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors active:scale-95 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <Link
                            href="/admin/dashboard/pending"
                            className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            Review
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ClayCard>
            </div>

          </div>
        </div>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmSignOut}
        loading={loggingOut}
        title="Exit Admin Command Center"
        description="Are you sure you want to end your administrative session?"
        warningMessage="Administrative privileges will be suspended. You will not be able to approve masjids, manage staff accounts, or modify coordinates until you sign in again."
        confirmText="Yes, End Session"
      />
    </>
  );
}