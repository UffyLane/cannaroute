interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: { value: number; label: string };
  accentColor?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  accentColor = 'bg-emerald-50 text-emerald-700',
}: StatCardProps) {
  const isPositive = !trend || trend.value >= 0;

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2 tabular-nums">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 font-semibold flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ml-4 ${accentColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
