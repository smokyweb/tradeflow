import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '../api';
import type { Holding, Metrics } from '../api';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const COLORS = ['#00D084', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#10B981'];

export default function Portfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    api.getPortfolio().then(setHoldings);
    api.getMetrics().then(setMetrics);
  }, []);

  const pieData = holdings.map((h) => ({
    name: h.symbol,
    value: h.market_value,
  }));

  const perfMetrics = metrics
    ? [
        { label: 'Sharpe Ratio', value: metrics.sharpe_ratio.toFixed(2) },
        { label: 'Max Drawdown', value: `${metrics.max_drawdown.toFixed(2)}%` },
        { label: 'Sortino Ratio', value: metrics.sortino_ratio.toFixed(2) },
        { label: 'Alpha', value: `${metrics.alpha.toFixed(2)}%` },
        { label: 'Beta', value: metrics.beta.toFixed(2) },
      ]
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Portfolio</h1>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {perfMetrics.map((m) => (
          <div key={m.label} className="bg-navy-800 border border-navy-600 rounded-xl p-4">
            <div className="text-xs text-gray-400">{m.label}</div>
            <div className="text-lg font-bold text-white mt-1">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table */}
        <div className="lg:col-span-2 bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-700">
            <h2 className="text-lg font-semibold text-white">Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-700 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">Symbol</th>
                  <th className="px-4 py-3 font-medium text-right">Shares</th>
                  <th className="px-4 py-3 font-medium text-right">Avg Cost</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium text-right">Value</th>
                  <th className="px-4 py-3 font-medium text-right">P&L</th>
                  <th className="px-4 py-3 font-medium text-right">P&L%</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.symbol} className="border-t border-navy-700 hover:bg-navy-700/50">
                    <td className="px-4 py-3 font-medium text-white">{h.symbol}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{h.shares}</td>
                    <td className="px-4 py-3 text-right text-gray-300">${h.avg_cost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">${h.current_price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-white font-medium">
                      {formatCurrency(h.market_value)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${h.pnl >= 0 ? 'text-green-brand' : 'text-red-brand'}`}
                    >
                      {formatCurrency(h.pnl)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${h.pnl_percent >= 0 ? 'text-green-brand' : 'text-red-brand'}`}
                    >
                      {h.pnl_percent >= 0 ? '+' : ''}{h.pnl_percent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocation Chart */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Asset Allocation</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1a2236',
                  border: '1px solid #243049',
                  borderRadius: 8,
                  color: '#e5e7eb',
                }}
                formatter={(v) => [formatCurrency(Number(v)), 'Value']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-gray-400">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
