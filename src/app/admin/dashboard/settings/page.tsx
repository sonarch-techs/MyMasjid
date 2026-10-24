'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Sliders, Globe, Shield } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { NeuInput } from '@/components/ui/NeuInput';
import { useToast } from '@/lib/context/ToastContext';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    defaultRadiusKm: '25',
    calculationMethod: 'Karachi',
    enableUrduSupport: true,
    jamaatBufferMins: '15',
    contactEmail: 'admin@masjidfinder.com',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('System configuration preferences saved.', 'success');
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="p-2 rounded-xl bg-clay-surface shadow-clay-pill border border-white/80 text-emerald-950 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <span className="text-sm font-bold text-emerald-950">App Settings</span>
        <div className="w-9" />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <ClayCard className="p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-emerald-800" />
            <h2 className="text-sm font-bold text-emerald-950">Geospatial & Search Parameters</h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Default Proximity Radius (Kilometers)</label>
            <NeuInput
              type="number"
              value={settings.defaultRadiusKm}
              onChange={(e) => setSettings({ ...settings, defaultRadiusKm: e.target.value })}
            />
            <p className="text-[11px] text-slate-400">
              The maximum distance evaluated during GPS-based prayer searches.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Prayer Calculation Method</label>
            <select
              value={settings.calculationMethod}
              onChange={(e) => setSettings({ ...settings, calculationMethod: e.target.value })}
              className="w-full bg-[#EBF0ED] shadow-neu-inset text-slate-800 font-medium rounded-xl py-3 px-4 text-xs focus:outline-none"
            >
              <option value="Karachi">University of Islamic Sciences, Karachi (Hanafi Default)</option>
              <option value="MWL">Muslim World League (MWL)</option>
              <option value="ISNA">Islamic Society of North America (ISNA)</option>
              <option value="Makkah">Umm al-Qura University, Makkah</option>
            </select>
          </div>
        </ClayCard>

        <ClayCard className="p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Globe className="w-5 h-5 text-emerald-800" />
            <h2 className="text-sm font-bold text-emerald-950">Localization & Support</h2>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-xs font-bold text-emerald-950 block">Enable Bilingual Urdu Typography</span>
              <span className="text-[11px] text-slate-400">
                Display Nastaliq font renderings for prayer names and descriptions
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.enableUrduSupport}
              onChange={(e) => setSettings({ ...settings, enableUrduSupport: e.target.checked })}
              className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 w-4 h-4"
            />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-600">Staff Support Contact Email</label>
            <NeuInput
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            />
          </div>
        </ClayCard>

        <button
          type="submit"
          disabled={saving}
          className="w-full clay-btn-emerald py-3.5 px-4 text-white text-sm font-bold rounded-xl shadow-clay-btn transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Updating Settings...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
}