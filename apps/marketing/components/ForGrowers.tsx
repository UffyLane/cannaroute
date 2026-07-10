const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
    ),
    title: 'Live inventory dashboard',
    desc: 'See your full catalog in real time. Available quantities, reserved stock, and pending orders — always current, no spreadsheets required.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
    title: 'COA document management',
    desc: 'Upload and attach Certificates of Analysis to every batch. Customers see lab results before they order. COA expiry alerts keep you ahead of compliance.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    title: 'Direct dispensary orders',
    desc: 'Dispensaries browse your catalog and send purchase orders directly through the platform. No phone calls, no email chains.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    title: 'Transparent wholesale pricing',
    desc: 'Set tiered prices by volume. Dispensaries see your rates before they order. No haggling, no surprises — just clean B2B transactions.',
  },
];

export default function ForGrowers() {
  return (
    <section
      id="growers"
      className="py-28"
      style={{ background: 'rgba(15,76,53,0.04)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
              style={{ background: 'rgba(15,76,53,0.15)', border: '1px solid rgba(15,76,53,0.4)', color: '#4ade80' }}
            >
              For growers
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              Your crop, your catalog,{' '}
              <span className="gold-text">your customers.</span>
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Stop managing wholesale relationships over text messages. CannaRoute gives you a
              professional storefront, built-in compliance docs, and a direct line to every
              licensed dispensary on the platform.
            </p>
            <a
              href="#waitlist"
              className="inline-flex px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150"
              style={{ background: '#0f4c35', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#1a6b4a')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#0f4c35')}
            >
              Get early access →
            </a>
          </div>

          {/* Right: features */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-lift p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: 'rgba(15,76,53,0.2)', color: '#4ade80' }}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
