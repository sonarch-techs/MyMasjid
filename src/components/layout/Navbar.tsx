'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  MapPin,
  Compass,
  CalendarCheck,
  ShieldCheck,
  ShieldAlert,
  User,
  LogOut,
  Clock,
  PlusCircle,
  Users,
  BarChart3,
} from 'lucide-react';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';
import { LogoutModal } from '@/components/ui/LogoutModal';

type UserRole = 'user' | 'staff' | 'admin' | null;

interface NavLinkItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isUrdu } = useTranslation();
  const { showToast } = useToast();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function getSessionProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          setRole(profile?.role || 'user');
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('Navbar auth verification error:', err);
      } finally {
        setLoading(false);
      }
    }

    getSessionProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          setRole(profile?.role || 'user');
        } else {
          setUser(null);
          setRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const confirmSignOut = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setMobileMenuOpen(false);
      setIsLogoutModalOpen(false);
      showToast('You have been signed out safely.', 'info');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      showToast(`Error signing out: ${err.message}`, 'error');
    } finally {
      setLoggingOut(false);
    }
  };

  const getNavLinks = (): NavLinkItem[] => {
    if (!user) {
      return [
        { label: 'Find Masjids', href: '/masjids', icon: Compass },
        { label: 'Staff Portal', href: '/staff-login', icon: ShieldCheck },
        { label: 'Sign In / Tracker', href: '/login', icon: User },
      ];
    }

    if (role === 'admin') {
      return [
        { label: 'Admin Command', href: '/admin/dashboard', icon: ShieldAlert },
        { label: 'Add Masjid', href: '/admin/dashboard/masjids/new', icon: PlusCircle },
        { label: 'Staff Accounts', href: '/admin/dashboard/users', icon: Users },
        { label: 'Public Directory', href: '/masjids', icon: Compass },
      ];
    }

    if (role === 'staff') {
      return [
        { label: 'Staff Hub', href: '/staff/dashboard', icon: ShieldCheck },
        { label: 'Update Timings', href: '/staff/dashboard/timings', icon: Clock },
        { label: 'Masjid Directory', href: '/masjids', icon: Compass },
      ];
    }

    return [
      { label: 'Find Masjids', href: '/masjids', icon: Compass },
      { label: 'Salah Tracker', href: '/dashboard', icon: CalendarCheck },
      { label: 'Analytics', href: '/dashboard/stats', icon: BarChart3 },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-clay-bg/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 border-b border-white/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95 transition-transform"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center text-white shadow-clay-btn transition-transform group-hover:scale-105">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className={`text-base sm:text-lg font-black text-emerald-950 tracking-tight leading-none ${isUrdu ? 'font-urdu' : ''}`}>
                  My Masjid
                </span>
                {role && (
                  <span className="text-[10px] font-bold text-emerald-700 capitalize tracking-wider pt-0.5">
                    {role === 'admin' ? 'Super Admin' : role === 'staff' ? 'Masjid Muazzin' : 'Member'}
                  </span>
                )}
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-clay-btn'
                      : 'text-slate-700 hover:text-emerald-950 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-800'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <LanguageSwitch />

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href={role === 'admin' ? '/admin/dashboard' : role === 'staff' ? '/staff/dashboard' : '/dashboard'}
                      className="hidden sm:flex items-center gap-2 p-1.5 pr-3 rounded-full bg-clay-surface shadow-clay-pill border border-white/80 hover:bg-white transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-xs font-bold text-emerald-950 max-w-[100px] truncate">
                        {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                      </span>
                    </Link>

                    <button
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60 shadow-sm active:scale-95 transition-all"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="clay-btn-emerald hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-white text-xs font-bold rounded-xl shadow-clay-btn transition-transform active:scale-95"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Login</span>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200/70 pb-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {user && (
              <div className="p-3 mb-2 rounded-2xl bg-white/70 border border-white shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium capitalize">
                      {role ? `${role} Account` : 'Active Session'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Verified
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-clay-btn'
                        : 'bg-clay-surface text-slate-700 shadow-clay-pill border border-white/80 hover:text-emerald-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-800'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 border border-red-200/60 font-bold text-xs active:scale-95 transition-transform"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full mt-2 clay-btn-emerald flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-bold text-xs shadow-clay-btn active:scale-95 transition-transform"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login with Google</span>
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Role-Aware Cautionary Confirmation Modal */}
        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={confirmSignOut}
          loading={loggingOut}
          title={
            role === 'admin'
              ? 'Exit Admin Command Center'
              : role === 'staff'
              ? 'Exit Staff Portal'
              : 'Sign Out of Account'
          }
          description={
            role === 'admin'
              ? 'Are you sure you want to end your administrative session?'
              : role === 'staff'
              ? 'Are you sure you want to end your Muazzin/Staff session?'
              : 'Are you sure you want to sign out of your account?'
          }
          warningMessage={
            role === 'admin'
              ? 'Administrative privileges will be suspended. You will not be able to approve masjids or manage staff accounts until you sign in again.'
              : role === 'staff'
              ? "Ending this session will lock daily Azan/Jama'at timing adjustments and photo uploads until you re-authenticate."
              : 'You will need to sign in again with your Google account to log daily prayers, maintain streaks, and view saved masjids.'
          }
          confirmText="Yes, Sign Out"
        />
    </>
  );
}