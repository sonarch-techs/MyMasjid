'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Compass, CalendarCheck, BarChart3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';
import { LogoutModal } from '@/components/ui/LogoutModal';

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { showToast } = useToast();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const confirmSignOut = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setIsLogoutModalOpen(false);
      showToast('Signed out safely. May Allah accept your prayers.', 'info');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      showToast(`Error signing out: ${err.message}`, 'error');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-clay-bg text-slate-800 flex flex-col">
      {/* Authenticated Dashboard Top Bar */}
      <header className="sticky top-0 z-40 bg-clay-bg/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 border-b border-white/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center text-white shadow-clay-btn">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-emerald-950 block leading-tight">
                Salah Tracker
              </span>
              <span className="text-[10px] font-semibold text-emerald-700">User Dashboard</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/stats"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                pathname === '/dashboard/stats'
                  ? 'bg-emerald-800 text-white shadow-clay-btn'
                  : 'bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 hover:text-emerald-700'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </Link>

            <Link
              href="/masjids"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-xs font-bold text-emerald-950 hover:text-emerald-700 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Masjid Directory</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/60 text-xs font-bold transition-colors active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Cautionary Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmSignOut}
        loading={loggingOut}
        title="Exit Salah Tracker"
        description="Are you sure you want to end your session?"
        warningMessage="You will need to sign in again with your Google account to log daily prayers, maintain streaks, and view saved masjids."
        confirmText="Yes, Sign Out"
      />
    </div>
  );
}