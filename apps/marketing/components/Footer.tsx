'use client';

const nav = [
  {
    heading: 'Platform',
    links: [
      { label: 'Dispensaries', href: '#dispensaries' },
      { label: 'Growers', href: '#growers' },
      { label: 'Customers', href: '#customers' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    heading: 'Portals',
    links: [
      { label: 'Dispensary Dashboard', href: 'https://app.canna-route.com' },
      { label: 'Grower Portal', href: 'https://grow.canna-route.com' },
      { label: 'Admin Panel', href: 'https://admin.canna-route.com' },
      { label: 'Try the demo', href: '#demo' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Join the waitlist', href: '#waitlist' },
      { label: 'Contact', href: 'mailto:stuartgregoryclarkjr@gmail.com' },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{ background: '#060f08', borderTop: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 flex-shrink-0">
                <svg viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M20,38 C18,34 -2,22 -2,8 C-2,-6 10,-10 20,0 C30,-10 42,-6 42,8 C42,22 22,34 20,38Z"
                    fill="#1e3a28" transform="translate(0,2)"/>
                  <line x1="20" y1="5" x2="20" y2="37" stroke="#4a7c5a" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20,18 C13,12 4,11 2,16" fill="none" stroke="#4a7c5a" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M20,26 C13,20 6,20 4,24" fill="none" stroke="#4a7c5a" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M20,18 C27,12 36,11 38,16" fill="none" stroke="#4a7c5a" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M20,26 C27,20 34,20 36,24" fill="none" stroke="#4a7c5a" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="20" cy="5" r="4" fill="#f59e0b"/>
                  <circle cx="20" cy="39" r="3" fill="#f59e0b"/>
                </svg>
              </div>
              <span className="font-bold text-base">
                Canna<span style={{ color: '#f59e0b' }}>Route</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              The compliant cannabis delivery platform for dispensaries, growers, and customers.
            </p>
            <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Currently available in Michigan.
            </p>
          </div>

          {/* Nav columns */}
          {nav.map((col) => (
            <div key={col.heading}>
              <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {col.heading}
              </div>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.href.startsWith('http') ? '_blank' : undefined}
                      rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm transition-colors duration-150"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} CannaRoute. For use only in jurisdictions where cannabis delivery is legal.
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Built in Michigan 🌿
          </p>
        </div>
      </div>
    </footer>
  );
}
