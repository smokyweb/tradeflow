import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { api } from '../api';
import type { Metrics, EquityPoint, Strategy, Trade } from '../api';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [curve, setCurve] = useState<EquityPoint[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    api.getMetrics().then(setMetrics);
    api.getEquityCurve().then(setCurve);
    api.getStrategies().then(setStrategies);
    api.getTrades({ limit: '10' }).then((r) => setTrades(r.trades));
  }, []);

  if (!metrics) return <div className="text-gray-400">Loading...</div>;

  const cards = [
    {
      label: 'Total Value',
      value: formatCurrency(metrics.total_value),
      icon: DollarSign,
      color: 'text-green-brand',
    },
    {
      label: 'Day P&L',
      value: formatCurrency(metrics.day_pnl),
      icon: metrics.day_pnl >= 0 ? TrendingUp : TrendingDown,
      color: metrics.day_pnl >= 0 ? 'text-green-brand' : 'text-red-brand',
    },
    {
      label: 'Total P&L',
      value: formatCurrency(metrics.total_pnl),
      icon: metrics.total_pnl >= 0 ? TrendingUp : TrendingDown,
      color: metrics.total_pnl >= 0 ? 'text-green-brand' : 'text-red-brand',
    },
    {
      label: 'Win Rate',
      value: `${metrics.win_rate}%`,
      icon: Target,
      color: 'text-blue-400',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-navy-800 border border-navy-600 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{c.label}</span>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Equity Curve */}
      <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Equity Curve (90 Days)</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={curve}>
            <CartesianGrid strokeDasharray="3 3" stroke="#243049" />
            <XAxis
              dataKey="date"
              stroke="#374766"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(d: string) => d.slice(5)}
            />
            <YAxis
              stroke="#374766"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: '#1a2236',
                border: '1px solid #243049',
                borderRadius: 8,
                color: '#e5e7eb',
              }}
              formatter={(v) => [formatCurrency(Number(v)), 'Value']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00D084"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Strategies */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Active Strategies</h2>
          <div className="space-y-3">
            {strategies
              .filter((s) => s.status === 'Active')
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-2 border-b border-navy-700 last:border-0"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.trade_count} trades</div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${s.pnl >= 0 ? 'text-green-brand' : 'text-red-brand'}`}
                    >
                      {formatCurrency(s.pnl)}
                    </div>
                    <div className="text-xs text-gray-400">Win {s.win_rate}%</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Trades</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Symbol</th>
                  <th className="pb-2 font-medium">Side</th>
                  <th className="pb-2 font-medium text-right">P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-t border-navy-700">
                    <td className="py-2 text-gray-300">{t.date}</td>
                    <td className="py-2 font-medium text-white">{t.symbol}</td>
                    <td className="py-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          t.side === 'Buy'
                            ? 'bg-green-brand/10 text-green-brand'
                            : 'bg-red-brand/10 text-red-brand'
                        }`}
                      >
                        {t.side}
                      </span>
                    </td>
                    <td
                      className={`py-2 text-right font-medium ${t.pnl >= 0 ? 'text-green-brand' : 'text-red-brand'}`}
                    >
                      {formatCurrency(t.pnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
