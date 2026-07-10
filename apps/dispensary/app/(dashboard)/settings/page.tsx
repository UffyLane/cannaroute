'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-neutral-50">
        <h2 className="text-sm font-bold text-neutral-900">{title}</h2>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, type = 'text', disabled = false, onChange }: {
  label: string;
  value: string;
  type?: string;
  disabled?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={e => onChange?.(e.target.value)}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all ${
          disabled
            ? 'border-neutral-100 bg-neutral-50 text-neutral-400 cursor-not-allowed'
            : 'border-neutral-200 bg-white'
        }`}
      />
    </div>
  );
}

function Toggle({ label, description, value, onChange }: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-semibold text-neutral-800">{label}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4"
        style={{ backgroundColor: value ? '#0f4c35' : '#e5e7eb' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName,  setLastName]  = useState(user?.lastName  ?? '');
  const [phone,     setPhone]     = useState('');
  const [saving,    setSaving]    = useState(false);

  const [notifications, setNotifications] = useState({
    newOrder:      true,
    lowStock:      true,
    driverStatus:  false,
    dailyReport:   true,
    compliance:    true,
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Profile updated');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Manage your account and notification preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" value={firstName} onChange={setFirstName} />
          <Field label="Last Name"  value={lastName}  onChange={setLastName} />
        </div>
        <Field label="Email Address" value={user?.email ?? ''} disabled />
        <Field label="Phone Number"  value={phone} type="tel" onChange={setPhone} />
        <div className="pt-1">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#0f4c35' }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <div className="space-y-4">
          <Toggle
            label="New Order Alerts"
            description="Get notified when a new order is placed"
            value={notifications.newOrder}
            onChange={v => setNotifications(n => ({ ...n, newOrder: v }))}
          />
          <Toggle
            label="Low Stock Warnings"
            description="Alert when a product falls below minimum stock"
            value={notifications.lowStock}
            onChange={v => setNotifications(n => ({ ...n, lowStock: v }))}
          />
          <Toggle
            label="Driver Status Updates"
            description="Real-time driver pickup and delivery notifications"
            value={notifications.driverStatus}
            onChange={v => setNotifications(n => ({ ...n, driverStatus: v }))}
          />
          <Toggle
            label="Daily Summary Report"
            description="Receive an end-of-day sales and operations summary"
            value={notifications.dailyReport}
            onChange={v => setNotifications(n => ({ ...n, dailyReport: v }))}
          />
          <Toggle
            label="Compliance Alerts"
            description="Notify on upcoming license expirations or violations"
            value={notifications.compliance}
            onChange={v => setNotifications(n => ({ ...n, compliance: v }))}
          />
        </div>
      </Section>

      {/* Dispensary Info */}
      <Section title="Dispensary Information">
        <Field label="Dispensary Name"    value="Demo Dispensary"      disabled />
        <Field label="License Number"     value="DR-0042"              disabled />
        <Field label="State"              value="Michigan (MI)"        disabled />
        <Field label="METRC API Key"      value="••••••••••••••••"     disabled type="password" />
        <p className="text-xs text-neutral-400">
          To update your dispensary details or METRC credentials, contact{' '}
          <a href="mailto:support@canna-route.com" className="text-emerald-700 font-medium hover:underline">
            support@canna-route.com
          </a>
        </p>
      </Section>

      {/* Danger Zone */}
      <Section title="Account">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-800">Sign out of all devices</p>
            <p className="text-xs text-neutral-400 mt-0.5">Invalidates all active sessions</p>
          </div>
          <button
            onClick={() => toast('Contact support to sign out all devices', { icon: 'ℹ️' })}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-700 border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            Sign Out All
          </button>
        </div>
      </Section>
    </div>
  );
}
