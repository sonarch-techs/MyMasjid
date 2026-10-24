'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, LogOut, ArrowLeft, Clock, Building2, User, Compass } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';
import { LogoutModal } from '@/components/ui/LogoutModal';

export default function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { showToast } = useToast();

  useEffect(() => {
    async function verifyStaffAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/staff-login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'staff' && profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    }

    verifyStaffAccess();
  }, [router, supabase]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-clay-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navLinks = [
    { label: 'Overview', href: '/staff/dashboard', icon: ShieldCheck },
    { label: 'Update Timings', href: '/staff/dashboard/timings', icon: Clock },
    { label: 'Masjid Profile', href: '/staff/dashboard/masjid-profile', icon: Building2 },
    { label: 'Public View', href: '/masjids', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-clay-bg text-slate-800 flex flex-col">
      {/* Light Theme Header matching Admin Dashboard */}
      <header className="sticky top-0 z-40 bg-clay-bg/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 border-b border-white/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95 transition-transform"
              title="Return to Public Home"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-clay-btn">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-emerald-950 block leading-tight">
                  Staff Portal
                </span>
                <span className="text-[10px] font-semibold text-emerald-700">Masjid Muazzin Hub</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-clay-btn'
                      : 'text-slate-700 hover:text-emerald-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-800'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
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
    </div>
  );
}