import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  alert?: boolean;
}

export default function KpiCard({ icon: Icon, label, value, trend, trendUp, alert }: KpiCardProps) {
  return (
    <div className="glass-card-hover p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-griddna-muted">
          {label}
        </span>
        <Icon
          className={`h-4 w-4 ${alert ? 'text-griddna-critical' : 'text-griddna-primary'}`}
        />
      </div>
      <p className="kpi-value">{value}</p>
      {trend && (
        <p
          className={`mt-1 text-xs ${
            alert ? 'text-griddna-critical' : trendUp ? 'text-griddna-success' : 'text-griddna-muted'
          }`}
        >
          {trend}
        </p>
      )}
    </div>
  );
}
