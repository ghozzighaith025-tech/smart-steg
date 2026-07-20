import { useEffect, useState } from 'react';
import { api, Asset } from '../lib/api';

const statusColors: Record<string, string> = {
  online: 'text-griddna-success',
  offline: 'text-griddna-muted',
  maintenance: 'text-griddna-warning',
  error: 'text-griddna-critical',
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    api.getAssets().then(setAssets).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assets</h1>
        <p className="mt-1 text-sm text-griddna-muted">Electrical infrastructure registry</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="glass-card-hover p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{asset.name}</h3>
                <p className="text-xs capitalize text-griddna-muted">{asset.type}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-xs ${
                  asset.healthScore > 85
                    ? 'bg-griddna-success/10 text-griddna-success'
                    : asset.healthScore > 70
                      ? 'bg-griddna-warning/10 text-griddna-warning'
                      : 'bg-griddna-critical/10 text-griddna-critical'
                }`}
              >
                {asset.healthScore}%
              </span>
            </div>
            {asset.ratedPowerKw && (
              <p className="mb-3 font-mono text-sm text-griddna-primary">
                {asset.ratedPowerKw} kW rated
              </p>
            )}
            <div className="space-y-1 border-t border-white/10 pt-3">
              {asset.devices?.map((d) => (
                <div key={d.id} className="flex justify-between text-xs">
                  <span className="font-mono text-griddna-muted">{d.serial}</span>
                  <span className={`capitalize ${statusColors[d.status] ?? ''}`}>{d.status}</span>
                </div>
              )) ?? (
                <p className="text-xs text-griddna-muted">No edge devices linked</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
