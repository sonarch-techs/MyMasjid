'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, X, Clock, MapPin, AlertCircle } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';

export default function PendingRequestsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [pendingMasjids, setPendingMasjids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('masjids')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingMasjids(data || []);
    } catch (err: any) {
      showToast(`Error fetching pending items: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('masjids')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setPendingMasjids((prev) => prev.filter((m) => m.id !== id));
      showToast(`Approved "${name}"! It is now live in the directory.`, 'success');
    } catch (err: any) {
      showToast(`Approval failed: ${err.message}`, 'error');
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to reject and remove "${name}"?`)) return;

    try {
      const { error } = await supabase.from('masjids').delete().eq('id', id);
      if (error) throw error;
      setPendingMasjids((prev) => prev.filter((m) => m.id !== id));
      showToast(`Rejected and removed "${name}".`, 'info');
    } catch (err: any) {
      showToast(`Rejection failed: ${err.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <span className="text-sm font-bold text-emerald-950">Pending Approvals</span>
        <div className="w-9" />
      </div>

      <ClayCard className="p-6 space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-emerald-950">Verification Queue</h2>
          <p className="text-xs text-slate-500">Submissions awaiting admin review before going live</p>
        </div>

        {pendingMasjids.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Check className="w-10 h-10 text-emerald-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">Queue is clear!</h3>
            <p className="text-xs text-slate-400">There are no pending submissions or unverified requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingMasjids.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-950">{m.name_en}</span>
                    {m.name_ur && (
                      <span className="font-urdu text-xs text-amber-800">{m.name_ur}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>{m.locality}, {m.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(m.id, m.name_en)}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(m.id, m.name_en)}
                    className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ClayCard>
    </div>
  );
}