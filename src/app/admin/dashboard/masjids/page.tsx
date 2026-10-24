'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  PlusCircle,
  Search,
  SlidersHorizontal,
  MapPin,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { NeuInput } from '@/components/ui/NeuInput';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';

export default function AdminMasjidListPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [masjids, setMasjids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');

  useEffect(() => {
    fetchMasjids();
  }, []);

  const fetchMasjids = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('masjids')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMasjids(data || []);
    } catch (err: any) {
      showToast(`Error fetching masjids: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase
        .from('masjids')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setMasjids((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: nextStatus } : m))
      );
      showToast(`Masjid status updated to ${nextStatus}.`, 'success');
    } catch (err: any) {
      showToast(`Status update failed: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const { error } = await supabase.from('masjids').delete().eq('id', id);
      if (error) throw error;
      setMasjids((prev) => prev.filter((m) => m.id !== id));
      showToast(`"${name}" was deleted successfully.`, 'success');
    } catch (err: any) {
      showToast(`Deletion failed: ${err.message}`, 'error');
    }
  };

  const filteredMasjids = masjids.filter((m) => {
    const matchesSearch =
      m.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.name_ur && m.name_ur.includes(searchQuery));
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950">Masjid Directory</h1>
            <p className="text-xs text-slate-500 font-medium">View, filter, and modify registered masjids</p>
          </div>
        </div>

        <Link
          href="/admin/dashboard/masjids/new"
          className="clay-btn-emerald py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-clay-btn flex items-center justify-center gap-2 active:scale-95 transition-transform self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Masjid</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <ClayCard className="p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <NeuInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, Urdu, or locality..."
            icon={<Search className="w-4 h-4 text-emerald-800" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
          {(['all', 'active', 'pending', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all border ${
                statusFilter === status
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                  : 'bg-clay-surface text-slate-600 border-white/80 hover:text-emerald-950'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </ClayCard>

      {/* Directory Table / Grid */}
      <ClayCard className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : filteredMasjids.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No masjids match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Masjid Details</th>
                  <th className="pb-3 font-bold">Locality</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMasjids.map((m) => (
                  <tr key={m.id} className="hover:bg-white/40 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-900/10 border border-emerald-900/20 overflow-hidden shrink-0">
                          {m.images?.[0] ? (
                            <img src={m.images[0]} alt={m.name_en} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-emerald-800">
                              {m.name_en.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-emerald-950 flex items-center gap-2">
                            <span>{m.name_en}</span>
                            {m.name_ur && (
                              <span className="font-urdu text-xs text-emerald-800">{m.name_ur}</span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                            {m.address}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        <span>{m.locality}</span>
                      </span>
                    </td>
                    <td className="py-3.5">
                      <button
                        onClick={() => handleToggleStatus(m.id, m.status)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize transition-all ${
                          m.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : m.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {m.status === 'active' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : m.status === 'pending' ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{m.status}</span>
                      </button>
                    </td>
                    <td className="py-3.5 text-right space-x-1.5">
                      <Link
                        href={`/masjids/${m.id}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 inline-block transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(m.id, m.name_en)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 inline-block transition-colors active:scale-95"
                        title="Delete Masjid"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ClayCard>
    </div>
  );
}