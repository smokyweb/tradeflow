import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Strategy } from '../api';
import { Activity, Pause, AlertTriangle, Shield, Zap } from 'lucide-react';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const riskIcons: Record<string, typeof Shield> = {
  Low: Shield,
  Medium: AlertTriangle,
  High: Zap,
};

const riskColors: Record<string, string> = {
  Low: 'text-blue-400',
  Medium: 'text-yellow-400',
  High: 'text-red-brand',
};

export default function Strategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  useEffect(() => {
    api.getStrategies().then(setStrategies);
  }, []);

  const toggle = async (id: number) => {
    const updated = await api.toggleStrategy(id);
    setStrategies((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Strategies</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {strategies.map((s) => {
          const RiskIcon = riskIcons[s.risk_level] || AlertTriangle;
          return (
            <div
              key={s.id}
              className="bg-navy-800 border border-navy-600 rounded-xl p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-white">{s.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${
                        s.status === 'Active' ? 'text-green-brand' : 'text-gray-400'
                      }`}
                    >
                      {s.status === 'Active' ? (
                        <Activity className="w-3 h-3" />
                      ) : (
                        <Pause className="w-3 h-3" />
                      )}
                      {s.status}
                    </span>
                    <span className={`flex items-center gap-1 text-xs ${riskColors[s.risk_level]}`}>
                      <RiskIcon className="w-3 h-3" />
                      {s.risk_level} Risk
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggle(s.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    s.status === 'Active' ? 'bg-green-brand' : 'bg-navy-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                      s.status === 'Active' ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4 flex-1">{s.description}</p>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-navy-700">
                <div>
                  <div className="text-xs text-gray-500">P&L</div>
                  <div
                    className={`text-sm font-semibold ${s.pnl >= 0 ? 'text-green-brand' : 'text-red-brand'}`}
                  >
                    {formatCurrency(s.pnl)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Win Rate</div>
                  <div className="text-sm font-semibold text-white">{s.win_rate}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Trades</div>
                  <div className="text-sm font-semibold text-white">{s.trade_count}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
