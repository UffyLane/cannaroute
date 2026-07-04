interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: { value: number; label: string };
  accentColor?: string;
}

export function StatCard({ label, value, icon, trend, accentColor = 'bg-brand-50 text-brand-700' }: StatCardProps) {
  return (
    <div className="stat-card flex items-start justify-between">
      <div>
        <p className="text-sm text-neutral-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-neutral-900 mt-1">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${accentColor}`}>
        {icon}
      </div>
    </div>
  );
}
