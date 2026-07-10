'use client';

const dispensaryPlans = [
  {
    name: 'Starter',
    price: '$199',
    period: '/mo',
    desc: 'For single-location dispensaries getting started with delivery.',
    features: [
      'Up to 50 deliveries/month',
      'Up to 3 drivers',
      'Order management dashboard',
      'Metrc auto-sync',
      'Customer push notifications',
      'Email support',
    ],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$499',
    period: '/mo',
    desc: 'For growing operations that need scale and advanced compliance.',
    features: [
      'Up to 500 deliveries/month',
      'Unlimited drivers',
      'Live GPS fleet tracking',
      'Multi-state compliance engine',
      'CanPay ACH payments',
      'Grower catalog access',
      'Priority support',
    ],
    cta: 'Get early access',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For multi-location groups, MSOs, and high-volume operations.',
    features: [
      'Unlimited deliveries',
      'Multi-location management',
      'Dedicated account manager',
      'Custom Metrc integration',
      'SLA uptime guarantee',
      'White-label option',
    ],
    cta: 'Contact us',
    highlight: false,
  },
];

const growerTiers = [
  { name: 'Free listing', price: '$0', desc: 'List your catalog. Receive orders from dispensaries on the platform.' },
  { name: 'Verified grower', price: '$99/mo', desc: 'Priority placement, COA badge, direct dispensary messaging.' },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-28">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(15,76,53,0.15)', border: '1px solid rgba(15,76,53,0.4)', color: '#4ade80' }}
          >
            Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Simple pricing.{' '}
            <span className="gold-text">No surprises.</span>
          </h2>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>
            All plans include Metrc auto-sync, push notifications, and the CanPay payment integration.
            No per-delivery fees on Growth and above.
          </p>
        </div>

        {/* Dispensary plans */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {dispensaryPlans.map((plan) => (
            <div
              key={plan.name}
              className="card-lift rounded-2xl p-7 flex flex-col relative"
              style={{
                background: plan.highlight ? 'rgba(15,76,53,0.12)' : 'rgba(255,255,255,0.03)',
                border: plan.highlight ? '1px solid rgba(15,76,53,0.5)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: '#0f4c35', color: 'white' }}
                >
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{plan.period}</span>}
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: '#4ade80' }}>
                      <path d="M13.5 4.5L6.5 11.5L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className="block text-center py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-150"
                style={
                  plan.highlight
                    ? { background: '#0f4c35', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }
                }
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              >
                {plan.cta} →
              </a>
            </div>
          ))}
        </div>

        {/* Grower section */}
        <div
          className="rounded-2xl p-7"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(15,76,53,0.15)', color: '#4ade80' }}
            >
              Grower pricing
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {growerTiers.map((t) => (
              <div
                key={t.name}
                className="p-5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="text-xl font-bold mb-1">{t.price}</div>
                <div className="font-semibold text-sm mb-2">{t.name}</div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Customers always browse and order for free. No customer subscription, no delivery markup charged to the platform.
          </p>
        </div>
      </div>
    </section>
  );
}
