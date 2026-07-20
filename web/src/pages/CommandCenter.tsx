import { useEffect, useState } from 'react';
import { Zap, AlertTriangle, Cpu, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { api, Asset, Alert } from '../lib/api';
import KpiCard from '../components/KpiCard';

const demoPowerData = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  power: 1800 + Math.sin(i / 3) * 400 + Math.random() * 200,
}));

export default function CommandCenter() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    api.getAssets().then(setAssets).catch(console.error);
    api.getAlerts().then(setAlerts).catch(console.error);
  }, []);

  const avgHealth = assets.length
    ? (assets.reduce((s, a) => s + a.healthScore, 0) / assets.length).toFixed(1)
    : '—';

  const totalPower = assets.reduce((s, a) => s + (a.ratedPowerKw ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Command Center</h1>
        <p className="mt-1 text-sm text-griddna-muted">
          Real-time energy intelligence overview
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Zap}
          label="Total Capacity"
          value={`${totalPower} kW`}
          trend="+2.4%"
          trendUp
        />
        <KpiCard
          icon={TrendingUp}
          label="Avg Health Score"
          value={`${avgHealth}%`}
          trend="Stable"
        />
        <KpiCard
          icon={Cpu}
          label="Active Assets"
          value={String(assets.length)}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Open Alerts"
          value={String(alerts.filter((a) => !a.acknowledged).length)}
          alert={alerts.some((a) => a.severity === 'critical')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="glass-card xl:col-span-2 p-6">
          <h2 className="mb-4 text-sm font-semibold text-griddna-muted uppercase tracking-wider">
            Power Consumption — 24h
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={demoPowerData}>
              <defs>
                <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" W" />
              <Tooltip
                contentStyle={{
                  background: '#0A0E17',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="power"
                stroke="#00D4FF"
                fill="url(#powerGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h2 className="mb-4 text-sm font-semibold text-griddna-muted uppercase tracking-wider">
            Asset Health
          </h2>
          <div className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{asset.name}</p>
                  <p className="text-xs capitalize text-griddna-muted">{asset.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${asset.healthScore}%`,
                        backgroundColor:
                          asset.healthScore > 85
                            ? '#00E676'
                            : asset.healthScore > 70
                              ? '#FFB300'
                              : '#FF3D57',
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm">{asset.healthScore}%</span>
                </div>
              </div>
            ))}
            {assets.length === 0 && (
              <p className="text-sm text-griddna-muted">No assets loaded. Start backend + DB.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
