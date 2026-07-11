'use client';

import { useState } from 'react';

const roles = [
  { value: 'dispensary', label: 'Dispensary operator' },
  { value: 'grower',     label: 'Licensed grower / cultivator' },
  { value: 'customer',   label: 'Customer / patient' },
  { value: 'driver',     label: 'Delivery driver' },
  { value: 'investor',   label: 'Investor / press' },
];

export default function WaitlistForm() {
  const [form, setForm] = useState({ email: '', role: '', business: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const url = process.env.NEXT_PUBLIC_WAITLIST_FORM_URL;
    if (!url) {
      // No form backend yet — just show success for demo
      setTimeout(() => setStatus('done'), 800);
      return;
    }

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="waitlist" className="py-28">
      <div className="max-w-xl mx-auto px-6">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}
          >
            Early access
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Join the{' '}
            <span className="gold-text">waitlist.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)' }}>
            We're onboarding dispensaries, growers, and drivers in Michigan first.
            Drop your info and we'll reach out when your spot is ready.
          </p>
        </div>

        {status === 'done' ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: 'rgba(15,76,53,0.12)', border: '1px solid rgba(15,76,53,0.4)' }}
          >
            <div className="text-4xl mb-4">✓</div>
            <h3 className="font-bold text-xl mb-2" style={{ color: '#4ade80' }}>You're on the list.</h3>
            <p style={{ color: 'rgba(255,255,255,0.55)' }}>We'll reach out to {form.email} when your spot opens up.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-7 space-y-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Email address *
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                I am a… *
              </label>
              <select
                required
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: form.role ? 'white' : 'rgba(255,255,255,0.35)',
                }}
              >
                <option value="" disabled>Select your role</option>
                {roles.map(r => (
                  <option key={r.value} value={r.value} style={{ background: '#0a1a0f', color: 'white' }}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Business name (optional) */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Business name <span style={{ color: 'rgba(255,255,255,0.35)' }}>(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Green Leaf Dispensary"
                value={form.business}
                onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-150"
              style={{ background: '#f59e0b', color: '#060f08', opacity: status === 'submitting' ? 0.7 : 1 }}
            >
              {status === 'submitting' ? 'Joining…' : 'Join the waitlist →'}
            </button>

            {status === 'error' && (
              <p className="text-xs text-center" style={{ color: '#f87171' }}>
                Something went wrong. Email us at stuartgregoryclarkjr@gmail.com instead.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
