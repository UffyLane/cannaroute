'use client';

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    title: 'Real-time order management',
    desc: 'Live order queue, one-click status updates, and WebSocket push to your team the moment a customer places an order.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
      </svg>
    ),
    title: 'Multi-state compliance engine',
    desc: 'Purchase limits, delivery hours, and tax rates adapt automatically per state. Adding a new state is a database insert, not a code change.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
    title: 'Driver dispatch + GPS tracking',
    desc: 'Assign drivers with one click. Track every delivery live on the map. Customers see real-time driver position from pickup to door.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
    ),
    title: 'Metrc seed-to-sale sync',
    desc: 'Native Metrc API v2 integration. Every delivery creates a manifest automatically. Stay compliant with zero manual data entry.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
    title: 'CanPay ACH payments',
    desc: 'The only federally compliant cannabis payment network. No cash handling, no chargebacks. Point of Banking and cash fallbacks included.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
      </svg>
    ),
    title: 'Push notifications built in',
    desc: 'Customers get notified at every order stage — confirmed, picked up, on the way, delivered. Zero configuration required.',
  },
];

export default function ForDispensaries() {
  return (
    <section id="dispensaries" className="py-28">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(15,76,53,0.15)', border: '1px solid rgba(15,76,53,0.4)', color: '#4ade80' }}
          >
            For dispensaries
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Everything your operation{' '}
            <span className="gold-text">needs to deliver.</span>
          </h2>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>
            A single platform that handles your orders, drivers, compliance, and payments —
            so you can focus on your customers, not your software stack.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-lift p-6 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(15,76,53,0.2)', color: '#4ade80' }}
              >
                {f.icon}
              </div>
              <h3 className="font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <a
            href="#waitlist"
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150"
            style={{ background: '#0f4c35', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#1a6b4a')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#0f4c35')}
          >
            Get early access →
          </a>
          <a
            href="https://app.canna-route.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Or try the live demo ↗
          </a>
        </div>
      </div>
    </section>
  );
}
