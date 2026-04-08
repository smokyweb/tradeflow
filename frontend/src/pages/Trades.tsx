import { useEffect, useState } from 'react';
import { api } from '../api';
import type { TradesResponse } from '../api';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const symbols = ['', 'AAPL', 'MSFT', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'AMZN', 'GOOG'];
const strategyNames = [
  '',
  'RSI Mean Reversion',
  'MACD Momentum',
  'Moving Average Crossover',
  'Bollinger Band Squeeze',
  'Volume Weighted Momentum',
];
const sides = ['', 'Buy', 'Sell'];

export default function Trades() {
  const [data, setData] = useState<TradesResponse | null>(null);
  const [filters, setFilters] = useState({ symbol: '', strategy: '', side: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    const params: Record<string, string> = { limit: String(limit), offset: String(page * limit) };
    if (filters.symbol) params.symbol = filters.symbol;
    if (filters.strategy) params.strategy = filters.strategy;
    if (filters.side) params.side = filters.side;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    api.getTrades(params).then(setData);
  }, [filters, page]);

  const updateFilter = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(0);
  };

  const selectClass =
    'bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-brand';
  const inputClass =
    'bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-brand';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Trade History</h1>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Trades" value={String(data.stats.total_trades)} />
          <StatCard label="Profitable" value={String(data.stats.profitable)} color="text-green-brand" />
          <StatCard label="Losing" value={String(data.stats.losing)} color="text-red-brand" />
          <StatCard
            label="Net P&L"
            value={formatCurrency(data.stats.net_pnl)}
            color={data.stats.net_pnl >= 0 ? 'text-green-brand' : 'text-red-brand'}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filters.symbol} onChange={(e) => updateFilter('symbol', e.target.value)} className={selectClass}>
          <option value="">All Symbols</option>
          {symbols.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filters.strategy} onChange={(e) => updateFilter('strategy', e.target.value)} className={selectClass}>
          <option value="">All Strategies</option>
          {strategyNames.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filters.side} onChange={(e) => updateFilter('side', e.target.value)} className={selectClass}>
          <option value="">All Sides</option>
          {sides.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => updateFilter('startDate', e.target.value)}
          className={inputClass}
          placeholder="Start Date"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => updateFilter('endDate', e.target.value)}
          className={inputClass}
          placeholder="End Date"
        />
      </div>

      {/* Table */}
      <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy-700 text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="px-4 py-3 font-medium">Strategy</th>
                <th className="px-4 py-3 font-medium">Side</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium text-right">Entry</th>
                <th className="px-4 py-3 font-medium text-right">Exit</th>
                <th className="px-4 py-3 font-medium text-right">P&L</th>
                <th className="px-4 py-3 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {data?.trades.map((t) => (
                <tr key={t.id} className="border-t border-navy-700 hover:bg-navy-700/50">
                  <td className="px-4 py-3 text-gray-300">{t.date}</td>
                  <td className="px-4 py-3 font-medium text-white">{t.symbol}</td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{t.strategy}</td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3 text-right text-gray-300">{t.qty}</td>
                  <td className="px-4 py-3 text-right text-gray-300">${t.entry_price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-gray-300">${t.exit_price.toFixed(2)}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${t.pnl >= 0 ? 'text-green-brand' : 'text-red-brand'}`}
                  >
                    {formatCurrency(t.pnl)}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{t.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {data && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-navy-700">
            <span className="text-sm text-gray-400">
              Showing {page * limit + 1}–{Math.min((page + 1) * limit, data.total)} of {data.total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm bg-navy-700 text-gray-300 rounded-lg disabled:opacity-40 hover:bg-navy-600 cursor-pointer disabled:cursor-default"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * limit >= data.total}
                className="px-3 py-1.5 text-sm bg-navy-700 text-gray-300 rounded-lg disabled:opacity-40 hover:bg-navy-600 cursor-pointer disabled:cursor-default"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl p-4">
      <div className="text-sm text-gray-400">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
