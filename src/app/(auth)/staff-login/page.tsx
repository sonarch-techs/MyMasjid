'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, PhoneCall } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { NeuInput } from '@/components/ui/NeuInput';
import { createClient } from '@/lib/supabase/client';

export default function StaffLoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'otp'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'staff' || profile?.role === 'admin') {
          router.push(profile.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard');
        } else {
          setErrorMessage('This account is not designated as Masjid Staff.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: identifier.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/staff/dashboard`,
        },
      });
      if (error) throw error;
      alert('Verification link/code sent to your registered email.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clay-bg text-slate-800 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Graphic & Header */}
      <div className="max-w-md w-full mx-auto space-y-3 text-center pt-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center mx-auto shadow-clay-btn">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-emerald-950">Masjid Timings Finder</h1>
          <h2 className="text-sm font-bold text-emerald-800 mt-1">Masjid Staff Login</h2>
          <p className="text-xs text-slate-500">Update your masjid timings securely</p>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto space-y-4 pt-3">
        {/* Toggle Tabs */}
        <div className="flex rounded-xl bg-slate-200/70 p-1 shadow-inner text-xs font-bold">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              activeTab === 'login' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-500'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('otp')}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              activeTab === 'otp' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-500'
            }`}
          >
            Login with OTP
          </button>
        </div>

        <ClayCard className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Email or Mobile Number</label>
                <NeuInput
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@masjid.com"
                  icon={<Mail className="w-4 h-4 text-emerald-800" />}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Password</label>
                <div className="relative flex items-center">
                  <NeuInput
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    icon={<Lock className="w-4 h-4 text-emerald-800" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 w-3.5 h-3.5"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="font-semibold text-emerald-800 hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full clay-btn-emerald py-3 px-4 text-white text-xs font-bold rounded-xl shadow-clay-btn transition-transform active:scale-95"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Registered Email</label>
                <NeuInput
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="muazzin@masjid.com"
                  icon={<Mail className="w-4 h-4 text-emerald-800" />}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full clay-btn-emerald py-3 px-4 text-white text-xs font-bold rounded-xl shadow-clay-btn transition-transform active:scale-95"
              >
                {loading ? 'Sending OTP...' : 'Continue with OTP'}
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Don&apos;t have an account?{' '}
              <a href="mailto:admin@masjidfinder.com" className="font-bold text-emerald-800 hover:underline inline-flex items-center gap-1">
                <PhoneCall className="w-3 h-3" /> Contact admin
              </a>
            </p>
          </div>
        </ClayCard>
      </div>

      <div className="text-center text-xs text-slate-400 py-3">
        <Link href="/" className="hover:text-emerald-900 font-semibold transition-colors">
          &larr; Back to Public Directory
        </Link>
      </div>
    </div>
  );
}