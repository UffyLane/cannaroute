const steps = [
  {
    num: '01',
    actor: 'Customer',
    title: 'Browse & order',
    desc: 'Customer opens the app, verifies age, selects products from a licensed dispensary, and pays with CanPay or cash.',
  },
  {
    num: '02',
    actor: 'Dispensary',
    title: 'Confirm & prepare',
    desc: 'Dispensary receives the order in real time, confirms it, and prepares the package. Metrc manifest is created automatically.',
  },
  {
    num: '03',
    actor: 'Driver',
    title: 'Pick up & deliver',
    desc: 'A licensed driver accepts the job, picks up the sealed package, and drives it directly to the customer. GPS updates every 5 seconds.',
  },
  {
    num: '04',
    actor: 'Customer',
    title: 'Receive & confirm',
    desc: 'Customer meets the driver, confirms delivery. Both sides get a push notification. Order is complete and logged in Metrc.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-28"
      style={{ background: 'rgba(15,76,53,0.04)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(15,76,53,0.15)', border: '1px solid rgba(15,76,53,0.4)', color: '#4ade80' }}
          >
            How it works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            One order.{' '}
            <span className="gold-text">Four steps.</span>{' '}
            Full compliance.
          </h2>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Every delivery on CannaRoute follows the same compliant, tracked flow — from the
            moment a customer taps "order" to the moment their package arrives.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div
            className="absolute left-8 top-10 bottom-10 w-px hidden md:block"
            style={{ background: 'linear-gradient(to bottom, rgba(15,76,53,0.6), rgba(245,158,11,0.4), rgba(15,76,53,0.6), rgba(15,76,53,0.2))' }}
          />

          <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-4 md:gap-8 relative">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                {/* Step number circle */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0"
                  style={{
                    background: i === 1 ? 'rgba(245,158,11,0.12)' : 'rgba(15,76,53,0.15)',
                    border: `1px solid ${i === 1 ? 'rgba(245,158,11,0.3)' : 'rgba(15,76,53,0.4)'}`,
                  }}
                >
                  <span
                    className="text-xl font-bold"
                    style={{ color: i === 1 ? '#f59e0b' : '#4ade80' }}
                  >
                    {s.num}
                  </span>
                </div>

                {/* Actor badge */}
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{
                    background: i === 1 ? 'rgba(245,158,11,0.08)' : 'rgba(15,76,53,0.1)',
                    color: i === 1 ? '#f59e0b' : '#4ade80',
                  }}
                >
                  {s.actor}
                </div>

                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div
          className="mt-14 p-5 rounded-2xl flex items-start gap-4"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
        >
          <div className="flex-shrink-0 w-5 h-5 mt-0.5" style={{ color: '#f59e0b' }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Metrc compliance is automatic.</strong>{' '}
            Every delivery generates a transfer manifest, logs the sale, and updates inventory — all without any manual data entry by the dispensary.
          </p>
        </div>
      </div>
    </section>
  );
}
