'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { createClient } from '@/lib/supabase/client';

export default function UserLoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google Sign-In failed:', err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clay-bg text-slate-800 flex flex-col justify-between p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <span className="text-sm font-bold text-emerald-950">User Access</span>
        <div className="w-9" />
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-emerald-950">Welcome to Salah Tracker</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Log in with your Gmail account to unlock daily prayer tracking, streaks, and saved masjids.
          </p>
        </div>

        <ClayCard className="p-6 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 shadow-clay-pill rounded-xl flex items-center justify-center gap-3 text-slate-700 text-sm font-bold active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <span className="h-[1px] w-full bg-slate-200" />
            <span className="absolute bg-clay-surface px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Masjid Staff?
            </span>
          </div>

          <Link
            href="/staff-login"
            className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60 rounded-xl flex items-center justify-center gap-2 text-emerald-900 text-xs font-bold transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Go to Masjid Staff Portal</span>
          </Link>
        </ClayCard>
      </div>

      <div className="text-center text-[11px] text-slate-400 py-2">
        By continuing, you agree to our Terms and Privacy Guidelines.
      </div>
    </div>
  );
}