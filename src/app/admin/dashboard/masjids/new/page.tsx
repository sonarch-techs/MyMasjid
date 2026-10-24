'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { NeuInput } from '@/components/ui/NeuInput';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/context/ToastContext';

export default function AddNewMasjidPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name_en: '',
    name_ur: '',
    locality: 'Borabanda',
    address: '',
    pincode: '500018',
    lat: '17.4475',
    lng: '78.4063',
    description_en: '',
  });

  const [landmarks, setLandmarks] = useState([
    { name: 'Bus Stand', distance_km: 0.2 },
  ]);

  const handleAddLandmark = () => {
    setLandmarks([...landmarks, { name: '', distance_km: 0.5 }]);
  };

  const handleRemoveLandmark = (index: number) => {
    setLandmarks(landmarks.filter((_, i) => i !== index));
  };

  const handleLandmarkChange = (index: number, field: string, value: any) => {
    const updated = [...landmarks];
    updated[index] = { ...updated[index], [field]: value };
    setLandmarks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const slug =
        formData.name_en
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

      // 1. Insert Masjid with PostGIS Point
      const { data: masjid, error: mError } = await supabase
        .from('masjids')
        .insert({
          name_en: formData.name_en,
          name_ur: formData.name_ur || null,
          slug,
          locality: formData.locality,
          address: formData.address,
          pincode: formData.pincode,
          description_en: formData.description_en,
          location: `POINT(${formData.lng} ${formData.lat})`,
          landmarks: landmarks.filter((l) => l.name.trim() !== ''),
          status: 'active',
        })
        .select()
        .single();

      if (mError) throw mError;

      // 2. Initialize default prayer timings
      const { error: ptError } = await supabase.from('prayer_timings').insert({
        masjid_id: masjid.id,
        fajr_azan: '04:45:00',
        fajr_jamaat: '05:15:00',
        zuhr_azan: '12:30:00',
        zuhr_jamaat: '13:00:00',
        asr_azan: '16:45:00',
        asr_jamaat: '17:00:00',
        maghrib_azan: '18:18:00',
        maghrib_jamaat: '18:23:00',
        isha_azan: '19:45:00',
        isha_jamaat: '20:15:00',
        jumuah_khutbah_1: '12:45:00',
        jumuah_khutbah_2: '13:30:00',
      });

      if (ptError) throw ptError;

      showToast(`"${formData.name_en}" published successfully!`, 'success');
      router.push('/admin/dashboard/masjids');
    } catch (err: any) {
      showToast(`Creation failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <span className="text-sm font-bold text-emerald-950">Add New Masjid</span>
        <div className="w-9" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ClayCard className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-emerald-950">Masjid Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Masjid Name (English)</label>
              <NeuInput
                required
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="e.g. Masjid e Quba"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Name (Urdu / اردو)</label>
              <NeuInput
                dir="rtl"
                value={formData.name_ur}
                onChange={(e) => setFormData({ ...formData, name_ur: e.target.value })}
                placeholder="مسجد قباء"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Locality</label>
              <select
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                className="w-full bg-[#EBF0ED] shadow-neu-inset text-slate-800 font-medium rounded-xl py-3 px-4 text-xs focus:outline-none"
              >
                <option value="Borabanda">Borabanda</option>
                <option value="Sanath Nagar">Sanath Nagar</option>
                <option value="Ameerpet">Ameerpet</option>
                <option value="Erragadda">Erragadda</option>
                <option value="S.R. Nagar">S.R. Nagar</option>
                <option value="Madhapur">Madhapur</option>
                <option value="Jubilee Hills">Jubilee Hills</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Pincode</label>
              <NeuInput
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="500018"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Address</label>
            <NeuInput
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Road No. 4, Borabanda, Hyderabad"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                <span>Latitude</span>
              </label>
              <NeuInput
                required
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                placeholder="17.4475"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                <span>Longitude</span>
              </label>
              <NeuInput
                required
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                placeholder="78.4063"
              />
            </div>
          </div>
        </ClayCard>

        {/* Landmarks Builder */}
        <ClayCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-emerald-950">Nearby Landmarks</h2>
              <p className="text-xs text-slate-500">Add easy-to-identify local markers</p>
            </div>
            <button
              type="button"
              onClick={handleAddLandmark}
              className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-3">
            {landmarks.map((l, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Landmark name (e.g. Metro Station)"
                  value={l.name}
                  onChange={(e) => handleLandmarkChange(idx, 'name', e.target.value)}
                  className="flex-1 bg-[#EBF0ED] shadow-neu-inset text-slate-800 text-xs rounded-xl py-2.5 px-3 focus:outline-none"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="km"
                  value={l.distance_km}
                  onChange={(e) => handleLandmarkChange(idx, 'distance_km', parseFloat(e.target.value) || 0)}
                  className="w-20 bg-[#EBF0ED] shadow-neu-inset text-slate-800 text-xs rounded-xl py-2.5 px-3 focus:outline-none text-center"
                />
                {landmarks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLandmark(idx)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </ClayCard>

        <button
          type="submit"
          disabled={saving}
          className="w-full clay-btn-emerald py-3.5 px-4 text-white text-sm font-bold rounded-xl shadow-clay-btn transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{saving ? 'Registering Masjid...' : 'Publish Masjid to Directory'}</span>
        </button>
      </form>
    </div>
  );
}