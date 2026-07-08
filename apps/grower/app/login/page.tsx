'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

const features = [
  'Certify your organic & pesticide-free growing practices',
  'Upload COA lab results for full product transparency',
  'Track pesticide applications & EPA compliance',
  'Sync data directly to dispensary product listings',
];

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
      <svg
        width={size * 0.46}
        height={size * 0.46}
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22V12" />
        <path d="M12 12C12 12 8 10 8 6a4 4 0 0 1 8 0c0 4-4 6-4 6Z" />
        <path d="M12 12C12 12 16 10 16 6" />
      </svg>
    </div>
  );
}

export default function GrowerLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/dashboard');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
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
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.36)' }}>Grower Portal</p>
          </div>
        </div>

        {/* Tagline + features */}
        <div>
          <h1 className="text-[2rem] font-bold text-white leading-tight mb-4">
            Grow with<br />full transparency
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.48)' }}>
            The farm transparency platform that connects your growing practices directly to dispensary shelves — building consumer trust through verified data.
          </p>

          <div className="space-y-3.5">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'rgba(34,197,94,0.14)',
                    border: '1px solid rgba(34,197,94,0.28)',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline
                      points="2 6 5 9 10 3"
                      stroke="#4ade80"
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

        {/* Bottom trust indicators */}
        <div className="flex gap-8">
          {[
            { value: 'USDA',   label: 'Organic Ready', gold: false },
            { value: 'COA',    label: 'Lab Verified',  gold: true },
            { value: 'Metrc',  label: 'Compatible',    gold: false },
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
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-3">
              <LogoMark size={52} />
            </div>
            <p className="font-bold text-white text-xl">Grower Portal</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>CannaRoute Farm Transparency</p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-neutral-900 mb-1">Welcome back</h2>
            <p className="text-sm text-neutral-500 mb-6">Sign in to your grower account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="grower@farm.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white text-sm font-bold py-3.5 rounded-xl transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#0f4c35' }}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
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
