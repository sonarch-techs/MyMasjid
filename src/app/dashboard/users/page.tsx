'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, UserCheck, Shield, Check } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { createClient } from '@/lib/supabase/client';

export default function ManageUsersPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [masjids, setMasjids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsersAndMasjids() {
      try {
        const { data: pData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        const { data: mData } = await supabase.from('masjids').select('id, name_en, locality');

        setProfiles(pData || []);
        setMasjids(mData || []);
      } catch (err) {
        console.error('Failed to load user management data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsersAndMasjids();
  }, [supabase]);

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
    } catch (err: any) {
      alert(`Role update failed: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleAssignMasjid = async (userId: string, masjidId: string) => {
    try {
      const { error } = await supabase
        .from('masjids')
        .update({ assigned_staff_id: masjidId === 'none' ? null : userId })
        .eq('id', masjidId);

      if (error) throw error;
      alert('Masjid staff assignment updated.');
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
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
    <div className="max-w-md lg:max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <span className="text-sm font-bold text-emerald-950">Manage Users & Staff</span>
        <div className="w-9" />
      </div>

      <ClayCard className="p-6 space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-emerald-950">Staff & User Roster</h2>
          <p className="text-xs text-slate-500">Promote registered users to Masjid Staff and assign them to masjids</p>
        </div>

        <div className="divide-y divide-slate-100">
          {profiles.map((p) => (
            <div key={p.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {p.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">{p.full_name || 'Anonymous User'}</h3>
                  <p className="text-xs text-slate-500">{p.email || 'No email attached'}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Role Selector */}
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

                {/* Assigned Masjid Dropdown (Only relevant if role === staff) */}
                {p.role === 'staff' && (
                  <select
                    onChange={(e) => handleAssignMasjid(p.id, e.target.value)}
                    className="bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    <option value="none">Assign to Masjid...</option>
                    {masjids.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name_en} ({m.locality})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </ClayCard>
    </div>
  );
}