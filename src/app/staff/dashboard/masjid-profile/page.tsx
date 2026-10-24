'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, Check, Image as ImageIcon } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';

export default function MasjidProfileEditorPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [masjid, setMasjid] = useState<any>(null);
  const [descEn, setDescEn] = useState('');
  const [descUr, setDescUr] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchStaffMasjid() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('masjids')
          .select('*')
          .eq('assigned_staff_id', user.id)
          .maybeSingle();

        const current = data || (await supabase.from('masjids').select('*').limit(1).single()).data;
        if (current) {
          setMasjid(current);
          setDescEn(current.description_en || '');
          setDescUr(current.description_ur || '');
        }
      } catch (err: any) {
        showToast(`Failed to load masjid: ${err.message}`, 'error');
      }
    }

    fetchStaffMasjid();
  }, [supabase, showToast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !masjid) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${masjid.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('masjid-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('masjid-images')
        .getPublicUrl(filePath);

      const updatedImages = [publicUrl, ...(masjid.images || [])];

      const { error: updateError } = await supabase
        .from('masjids')
        .update({ images: updatedImages, updated_at: new Date().toISOString() })
        .eq('id', masjid.id);

      if (updateError) throw updateError;

      setMasjid((prev: any) => ({ ...prev, images: updatedImages }));
      showToast('Photo uploaded and added to masjid gallery.', 'success');
    } catch (err: any) {
      showToast(`Image upload failed: ${err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masjid) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('masjids')
        .update({
          description_en: descEn,
          description_ur: descUr,
          updated_at: new Date().toISOString(),
        })
        .eq('id', masjid.id);

      if (error) throw error;
      showToast('Masjid profile descriptions updated successfully!', 'success');
    } catch (err: any) {
      showToast(`Update failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md lg:max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <span className="text-sm font-bold text-emerald-950">Edit Masjid Profile</span>
        <div className="w-9" />
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Photo Gallery & Upload Section */}
        <ClayCard className="p-5 sm:p-6 space-y-3">
          <label className="text-xs font-bold text-slate-700 block">Masjid Gallery Photos</label>
          
          <div className="grid grid-cols-3 gap-3">
            {masjid?.images?.map((imgUrl: string, idx: number) => (
              <div key={idx} className="relative h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={imgUrl} alt={`Masjid ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}

            <label className="h-24 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-white/70 flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm">
              <Upload className="w-5 h-5 text-emerald-800 mb-1" />
              <span className="text-[10px] font-bold text-emerald-900">
                {uploading ? 'Uploading...' : 'Add Photo'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </ClayCard>

        {/* Descriptions (English and Urdu) */}
        <ClayCard className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Description (English)</label>
            <textarea
              rows={4}
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              className="w-full bg-[#EBF0ED] shadow-neu-inset text-slate-800 text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              placeholder="Describe prayer hall capacity, wudu facilities, parking, etc."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Description (Urdu / اردو)</label>
            <textarea
              rows={3}
              dir="rtl"
              value={descUr}
              onChange={(e) => setDescUr(e.target.value)}
              className="w-full bg-[#EBF0ED] shadow-neu-inset text-slate-800 text-xs font-urdu rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              placeholder="مسجد کے بارے میں ضروری تفصیلات درج کریں..."
            />
          </div>
        </ClayCard>

        <button
          type="submit"
          disabled={saving}
          className="w-full clay-btn-emerald py-3.5 px-4 text-white text-sm font-bold rounded-xl shadow-clay-btn transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 text-white" />
          <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
        </button>
      </form>
    </div>
  );
}