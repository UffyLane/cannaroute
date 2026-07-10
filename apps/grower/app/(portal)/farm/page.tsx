'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

function Section({ title, children }: { children: React.ReactNode; title: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-neutral-50">
        <h2 className="text-sm font-bold text-neutral-900">{title}</h2>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, value, disabled = false, onChange, type = 'text',
}: {
  label: string; value: string; disabled?: boolean; onChange?: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={e => onChange?.(e.target.value)}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all ${
          disabled ? 'border-neutral-100 bg-neutral-50 text-neutral-400 cursor-not-allowed' : 'border-neutral-200 bg-white'
        }`}
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-none"
      />
    </div>
  );
}

const certBadges = [
  { label: 'METRC Licensed',  ok: true },
  { label: 'State Approved',  ok: true },
  { label: 'Organic (pending)', ok: false },
  { label: 'Lab Tested',      ok: true },
];

const strains = [
  { name: 'Blue Dream',       type: 'Hybrid', thc: '22%', cbd: '0.8%', stock: 48 },
  { name: 'OG Kush',         type: 'Indica', thc: '24%', cbd: '0.3%', stock: 32 },
  { name: 'Sour Diesel',     type: 'Sativa', thc: '20%', cbd: '0.2%', stock: 15 },
  { name: 'Girl Scout Cookies', type: 'Hybrid', thc: '26%', cbd: '0.4%', stock: 60 },
];

export default function FarmProfilePage() {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [farm, setFarm] = useState({
    name: 'Green Valley Farms',
    licenseNumber: 'GR-00712',
    address: '2984 County Road 14, Traverse City, MI 49686',
    phone: '(231) 555-0182',
    website: 'greenvalleyfarms.mi',
    bio: 'Family-owned cannabis cultivation facility specializing in craft small-batch flower. Michigan-licensed grower supplying dispensaries across the Lower Peninsula since 2019.',
    acreage: '12',
    indoorOutdoor: 'Mixed (indoor + greenhouse)',
    yearEstablished: '2019',
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Farm profile updated');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Farm Profile</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Your public grower profile visible to connected dispensaries</p>
      </div>

      {/* Certifications */}
      <div className="flex flex-wrap gap-2">
        {certBadges.map(({ label, ok }) => (
          <span
            key={label}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              ok ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            <span>{ok ? '✓' : '○'}</span>
            {label}
          </span>
        ))}
      </div>

      {/* Basic info */}
      <Section title="Farm Information">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Farm Name"       value={farm.name}           onChange={v => setFarm(f => ({ ...f, name: v }))} />
          <Field label="License Number"  value={farm.licenseNumber}  disabled />
        </div>
        <Field label="Address"           value={farm.address}        onChange={v => setFarm(f => ({ ...f, address: v }))} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone"           value={farm.phone}          onChange={v => setFarm(f => ({ ...f, phone: v }))} />
          <Field label="Website"         value={farm.website}        onChange={v => setFarm(f => ({ ...f, website: v }))} />
        </div>
        <TextArea label="About Your Farm" value={farm.bio} onChange={v => setFarm(f => ({ ...f, bio: v }))} />
      </Section>

      {/* Operations */}
      <Section title="Operations">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Total Acreage"        value={farm.acreage}          onChange={v => setFarm(f => ({ ...f, acreage: v }))} />
          <Field label="Grow Method"          value={farm.indoorOutdoor}    onChange={v => setFarm(f => ({ ...f, indoorOutdoor: v }))} />
          <Field label="Year Established"     value={farm.yearEstablished}  onChange={v => setFarm(f => ({ ...f, yearEstablished: v }))} />
        </div>
        <Field label="Grower Email (account)" value={user?.email ?? ''} disabled />
      </Section>

      {/* Current strains */}
      <Section title="Current Strains">
        <div className="overflow-hidden rounded-xl border border-neutral-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50">
                {['Strain', 'Type', 'THC', 'CBD', 'Units Available'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {strains.map(s => (
                <tr key={s.name}>
                  <td className="px-4 py-3 font-semibold text-neutral-900">{s.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{s.type}</td>
                  <td className="px-4 py-3 text-neutral-600">{s.thc}</td>
                  <td className="px-4 py-3 text-neutral-600">{s.cbd}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${s.stock < 20 ? 'text-amber-600' : 'text-emerald-700'}`}>
                      {s.stock} lbs
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-400">Strain inventory is synced from your METRC account daily.</p>
      </Section>

      <div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#0f4c35' }}
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
