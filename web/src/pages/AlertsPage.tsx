import { useEffect, useState } from 'react';
import { api, Alert } from '../lib/api';

const severityStyles = {
  info: 'border-l-griddna-primary bg-griddna-primary/5',
  warning: 'border-l-griddna-warning bg-griddna-warning/5',
  critical: 'border-l-griddna-critical bg-griddna-critical/5',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    api.getAlerts().then(setAlerts).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="mt-1 text-sm text-griddna-muted">AI-detected anomalies and system events</p>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="glass-card p-8 text-center text-griddna-muted">
            No alerts yet. Connect edge devices and enable AI anomaly detection (Week 3).
          </div>
        )}
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`glass-card border-l-4 p-4 ${severityStyles[alert.severity]}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{alert.title}</p>
                {alert.message && (
                  <p className="mt-1 text-sm text-griddna-muted">{alert.message}</p>
                )}
              </div>
              <span className="text-xs capitalize text-griddna-muted">{alert.severity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
