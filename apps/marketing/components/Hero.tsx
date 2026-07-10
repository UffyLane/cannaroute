'use client';

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={{ background: 'linear-gradient(180deg, #060f08 0%, #0a1a0f 60%, #060f08 100%)' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(15,76,53,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(15,76,53,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(15,76,53,0.15) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-5xl mx-auto px-6 text-center">

        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-8"
          style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.25)',
            color: '#f59e0b',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Now live in Michigan
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
          Cannabis delivery,{' '}
          <br className="hidden md:block" />
          <span className="gold-text">built for compliance.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          The complete platform for dispensaries, growers, and customers.
          Real-time delivery logistics, multi-state compliance engine, and
          grower transparency — all in one place.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#waitlist"
            className="px-8 py-4 rounded-xl font-bold text-base transition-all duration-150 w-full sm:w-auto"
            style={{ background: '#f59e0b', color: '#060f08' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#fbbf24')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#f59e0b')}
          >
            Join the waitlist →
          </a>
          <a
            href="#demo"
            className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-150 w-full sm:w-auto"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)')}
          >
            Try the live demo
          </a>
        </div>

        {/* Platform badges */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 mt-16 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          {[
            { label: 'Dispensary Dashboard', url: 'app.canna-route.com' },
            { label: 'Grower Portal', url: 'grow.canna-route.com' },
            { label: 'Admin Panel', url: 'admin.canna-route.com' },
            { label: 'Android App', url: 'EAS Build' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#0f4c35', boxShadow: '0 0 6px #0f4c35' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #060f08)' }}
      />
    </section>
  );
}
