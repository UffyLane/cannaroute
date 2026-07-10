const stats = [
  { value: '$3B+',  label: 'Michigan cannabis market annually' },
  { value: '500+',  label: 'Dispensaries in Michigan' },
  { value: '17',    label: 'States using Metrc — same integration' },
  { value: '8',     label: 'Backend microservices, fully deployed' },
];

export default function Stats() {
  return (
    <section
      className="py-16"
      style={{ background: 'rgba(15,76,53,0.06)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.value} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 gold-text">{s.value}</div>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
