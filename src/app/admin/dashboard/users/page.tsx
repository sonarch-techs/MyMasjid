'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, UserCheck, Shield, UserX } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';

export default function ManageUsersPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [masjids, setMasjids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsersAndMasjids();
  }, []);

  const fetchUsersAndMasjids = async () => {
    try {
      const { data: pData, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (pError) throw pError;

      const { data: mData, error: mError } = await supabase
        .from('masjids')
        .select('id, name_en, locality, assigned_staff_id');

      if (mError) throw mError;

      setProfiles(pData || []);
      setMasjids(mData || []);
    } catch (err: any) {
      showToast(`Failed to load users: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSavingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
      );
      showToast(`User role updated to ${newRole}.`, 'success');
    } catch (err: any) {
      showToast(`Role update failed: ${err.message}`, 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleAssignMasjid = async (userId: string, masjidId: string) => {
    try {
      // Unbind previous masjid assignments for this user if reassigned
      await supabase
        .from('masjids')
        .update({ assigned_staff_id: null })
        .eq('assigned_staff_id', userId);

      if (masjidId !== 'none') {
        const { error } = await supabase
          .from('masjids')
          .update({ assigned_staff_id: userId })
          .eq('id', masjidId);

        if (error) throw error;
      }

      showToast('Staff assignment updated successfully.', 'success');
      fetchUsersAndMasjids();
    } catch (err: any) {
      showToast(`Assignment failed: ${err.message}`, 'error');
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
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <span className="text-sm font-bold text-emerald-950">Staff & Account Management</span>
        <div className="w-9" />
      </div>

      <ClayCard className="p-6 space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-emerald-950">Registered Accounts</h2>
          <p className="text-xs text-slate-500">Promote users to Staff/Muazzin and bind them to specific masjids</p>
        </div>

        <div className="divide-y divide-slate-100">
          {profiles.map((p) => {
            const assignedMasjid = masjids.find((m) => m.assigned_staff_id === p.id);

            return (
              <div key={p.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                    {p.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                      <span>{p.full_name || 'Anonymous User'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        p.role === 'admin' ? 'bg-red-100 text-red-800' : p.role === 'staff' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.role}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">{p.email}</p>
                    {assignedMasjid && (
                      <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                        Assigned to: {assignedMasjid.name_en} ({assignedMasjid.locality})
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <select
                    value={p.role}
                    disabled={savingId === p.id}
                    onChange={(e) => handleRoleChange(p.id, e.target.value)}
                    className="bg-[#EBF0ED] shadow-neu-inset text-slate-800 font-semibold rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    <option value="user">Common User</option>
                    <option value="staff">Masjid Staff (Muazzin)</option>
                    <option value="admin">Administrator</option>
                  </select>

                  {p.role === 'staff' && (
                    <select
                      value={assignedMasjid?.id || 'none'}
                      onChange={(e) => handleAssignMasjid(p.id, e.target.value)}
                      className="bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold rounded-xl py-2 px-3 text-xs focus:outline-none"
                    >
                      <option value="none">No Masjid Assigned</option>
                      {masjids.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name_en} ({m.locality})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ClayCard>
    </div>
  );
}