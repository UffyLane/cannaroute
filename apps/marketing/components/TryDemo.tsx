'use client';

const accounts = [
  {
    role: 'Dispensary Admin',
    email: 'dispensary@demo.canna-route.com',
    url: 'https://app.canna-route.com',
    label: 'Open dashboard',
    color: '#4ade80',
    bg: 'rgba(15,76,53,0.12)',
    border: 'rgba(15,76,53,0.4)',
    desc: 'Order management, driver dispatch, live GPS, inventory',
  },
  {
    role: 'Grower',
    email: 'grower@demo.canna-route.com',
    url: 'https://grow.canna-route.com',
    label: 'Open portal',
    color: '#4ade80',
    bg: 'rgba(15,76,53,0.08)',
    border: 'rgba(15,76,53,0.3)',
    desc: 'Inventory listing, COA uploads, dispensary order management',
  },
  {
    role: 'Platform Admin',
    email: 'admin@demo.canna-route.com',
    url: 'https://admin.canna-route.com',
    label: 'Open admin',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    desc: 'User management, compliance engine, platform oversight',
  },
  {
    role: 'Customer (mobile)',
    email: 'customer@demo.canna-route.com',
    url: '#',
    label: 'Android APK →',
    color: 'rgba(255,255,255,0.6)',
    bg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.08)',
    desc: 'Browse dispensaries, order, track delivery live',
  },
  {
    role: 'Driver (mobile)',
    email: 'driver@demo.canna-route.com',
    url: '#',
    label: 'Android APK →',
    color: 'rgba(255,255,255,0.6)',
    bg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.08)',
    desc: 'Accept jobs, pick up, navigate, confirm delivery',
  },
];

export default function TryDemo() {
  return (
    <section
      id="demo"
      className="py-28"
      style={{ background: 'rgba(15,76,53,0.04)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}
          >
            Live demo
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Try the{' '}
            <span className="gold-text">real platform.</span>
          </h2>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Every portal is live and connected to a real backend. Log in with any demo account below.
            All accounts use the same password:{' '}
            <code
              className="px-2 py-0.5 rounded text-sm font-mono"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
            >
              Demo1234!
            </code>
          </p>
        </div>

        {/* Account cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {accounts.map((a) => (
            <div
              key={a.role}
              className="rounded-2xl p-5"
              style={{ background: a.bg, border: `1px solid ${a.border}` }}
            >
              {/* Role badge */}
              <div
                className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: a.color }}
              >
                {a.role}
              </div>

              {/* Email */}
              <div
                className="font-mono text-xs px-2.5 py-1.5 rounded-lg mb-2 truncate"
                style={{ background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.7)' }}
              >
                {a.email}
              </div>

              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {a.desc}
              </p>

              {a.url !== '#' ? (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity duration-150"
                  style={{ color: a.color }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.7')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                >
                  {a.label} ↗
                </a>
              ) : (
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Coming to App Store soon
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Demo data is reset periodically. These are not real user accounts and are provided for evaluation purposes only.
        </p>
      </div>
    </section>
  );
}
