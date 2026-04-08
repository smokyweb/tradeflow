const BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface Strategy {
  id: number;
  name: string;
  description: string;
  status: string;
  pnl: number;
  win_rate: number;
  trade_count: number;
  risk_level: string;
}

export interface Trade {
  id: number;
  date: string;
  symbol: string;
  strategy: string;
  strategy_id: number;
  side: string;
  qty: number;
  entry_price: number;
  exit_price: number;
  pnl: number;
  duration: string;
  status: string;
}

export interface TradesResponse {
  trades: Trade[];
  total: number;
  stats: {
    total_trades: number;
    profitable: number;
    losing: number;
    net_pnl: number;
  };
}

export interface Holding {
  id: number;
  symbol: string;
  shares: number;
  avg_cost: number;
  current_price: number;
  market_value: number;
  cost_basis: number;
  pnl: number;
  pnl_percent: number;
}

export interface EquityPoint {
  date: string;
  value: number;
}

export interface Metrics {
  sharpe_ratio: number;
  max_drawdown: number;
  sortino_ratio: number;
  alpha: number;
  beta: number;
  total_value: number;
  day_pnl: number;
  total_pnl: number;
  win_rate: number;
}

export const api = {
  getStrategies: () => fetchJson<Strategy[]>('/strategies'),
  toggleStrategy: (id: number) =>
    fetchJson<Strategy>(`/strategies/${id}`, { method: 'PATCH' }),
  getTrades: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchJson<TradesResponse>(`/trades${qs}`);
  },
  getPortfolio: () => fetchJson<Holding[]>('/portfolio'),
  getMetrics: () => fetchJson<Metrics>('/metrics'),
  getEquityCurve: () => fetchJson<EquityPoint[]>('/equity-curve'),
};
