const perks = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
    title: 'Real-time driver tracking',
    desc: 'Watch your driver on a live map from the moment they pick up your order until it arrives at your door.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    title: 'Grower transparency',
    desc: 'Every product links to its grower profile and lab COA. Know exactly who grew it, where, and what the lab results say.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
    title: 'Cashless payments',
    desc: 'Pay with CanPay ACH directly from your bank. No cash, no card fees. One tap at checkout.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
      </svg>
    ),
    title: 'Order status notifications',
    desc: 'Push notifications at every step — confirmed, preparing, picked up, nearby, delivered. No guessing, no waiting.',
  },
];

export default function ForCustomers() {
  return (
    <section id="customers" className="py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Right: perks (visually right, but DOM order left) */}
          <div className="order-2 lg:order-1 grid sm:grid-cols-2 gap-4">
            {perks.map((p) => (
              <div
                key={p.title}
                className="card-lift p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}
                >
                  {p.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{p.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Left: copy */}
          <div className="order-1 lg:order-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}
            >
              For customers
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              Delivery you can{' '}
              <span className="gold-text">actually trust.</span>
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
              From a licensed dispensary to your door. Age verified. Lab tested. Fully tracked.
              CannaRoute is the only delivery experience that shows you the full picture —
              who grew it, who's delivering it, and exactly where it is.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#waitlist"
                className="inline-flex px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150"
                style={{ background: '#f59e0b', color: '#060f08' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#fbbf24')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#f59e0b')}
              >
                Join the waitlist →
              </a>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Android app available now</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
