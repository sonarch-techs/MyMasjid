'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut, ArrowLeft, Building2, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';
import { LogoutModal } from '@/components/ui/LogoutModal';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  useEffect(() => {
    async function verifyAdminAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    }

    verifyAdminAccess();
  }, [router, supabase]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-clay-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clay-bg text-slate-800 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-clay-bg/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 border-b border-white/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95 transition-transform"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-clay-btn">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-emerald-950 block leading-tight">
                  Admin Dashboard
                </span>
                <span className="text-[10px] font-semibold text-emerald-700">Central Control</span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-900 hover:bg-white/60 transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-800" />
              <span>Masjids</span>
            </Link>
            <Link
              href="/admin/dashboard/users"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-900 hover:bg-white/60 transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-emerald-800" />
              <span>Staff Accounts</span>
            </Link>
          </nav>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/60 text-xs font-bold transition-all active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Admin Logout Confirmation Modal */}
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
    </div>
  );
}