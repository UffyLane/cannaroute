'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';

const features = [
  'Real-time order management & status updates',
  'Inventory tracking with automatic low-stock alerts',
  'Driver dispatch & live GPS tracking',
  'Compliance reporting & audit logs',
];

// ── Logo Mark ────────────────────────────────────────────────────────────────

function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #0f4c35, #0c3324)',
        border: '1px solid rgba(15,76,53,0.85)',
      }}
    >
      <svg width={size * 0.44} height={size * 0.52} viewBox="0 0 16 22" fill="none">
        <path
          d="M8 1 C8 1 14 5 14 11.5 C14 15.5 11.5 18.5 8 19.5 C4.5 18.5 2 15.5 2 11.5 C2 5 8 1 8 1Z"
          fill="rgba(255,255,255,0.92)"
        />
        <circle cx="8" cy="20.5" r="1.6" fill="#f59e0b" />
      </svg>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/dashboard');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#060f08' }}>
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 shrink-0"
        style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <LogoMark size={44} />
          <div>
            <p className="font-bold text-white text-base leading-tight">CannaRoute</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.36)' }}>Dispensary Portal</p>
          </div>
        </div>

        {/* Tagline + feature list */}
        <div>
          <h1 className="text-[2rem] font-bold text-white leading-tight mb-4">
            Manage your dispensary<br />from one dashboard
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.48)' }}>
            Real-time order tracking, inventory management, driver dispatch, and compliance tools — built for cannabis retailers.
          </p>

          <div className="space-y-3.5">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'rgba(245,158,11,0.14)',
                    border: '1px solid rgba(245,158,11,0.28)',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline
                      points="2 6 5 9 10 3"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.62)' }}>
                  {f}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex gap-8">
          {[
            { value: '99.9%', label: 'Uptime', gold: false },
            { value: '24/7',  label: 'Support', gold: true },
            { value: 'SOC2',  label: 'Compliant', gold: false },
          ].map(({ value, label, gold }) => (
            <div key={label}>
              <p
                className="text-2xl font-bold"
                style={{ color: gold ? '#f59e0b' : 'rgba(255,255,255,0.90)' }}
              >
                {value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.36)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo (only visible on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-3">
              <LogoMark size={52} />
            </div>
            <p className="font-bold text-white text-xl">CannaRoute</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Dispensary Portal</p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-neutral-900 mb-1">Welcome back</h2>
            <p className="text-sm text-neutral-500 mb-6">Sign in to your dispensary account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@dispensary.com"
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                />
              </div>

              <div className="pt-1">
                <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
                  Sign In
                </Button>
              </div>
            </form>
          </div>

          <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.26)' }}>
            CannaRoute — Cannabis Delivery Platform
          </p>
        </div>
      </div>
    </div>
  );
}
