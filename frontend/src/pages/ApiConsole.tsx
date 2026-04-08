import { useState } from 'react';
import { Copy, Check, Play } from 'lucide-react';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  curl: string;
  mockResponse: string;
}

const endpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/strategies',
    description: 'List all trading strategies with their current status and performance metrics.',
    curl: `curl -X GET https://api.tradeflow.com/api/v1/strategies \\
  -H "Authorization: Bearer tf_live_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json"`,
    mockResponse: JSON.stringify(
      {
        data: [
          {
            id: 1,
            name: 'RSI Mean Reversion',
            status: 'Active',
            pnl: 12847.53,
            win_rate: 64.2,
            trade_count: 147,
            risk_level: 'Medium',
          },
          {
            id: 2,
            name: 'MACD Momentum',
            status: 'Active',
            pnl: 28341.12,
            win_rate: 58.7,
            trade_count: 89,
            risk_level: 'High',
          },
        ],
        meta: { total: 5, page: 1 },
      },
      null,
      2
    ),
  },
  {
    method: 'POST',
    path: '/api/v1/strategies/:id/execute',
    description: 'Execute a specific strategy immediately with custom parameters.',
    curl: `curl -X POST https://api.tradeflow.com/api/v1/strategies/1/execute \\
  -H "Authorization: Bearer tf_live_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "symbol": "AAPL",
    "qty": 100,
    "max_risk": 0.02
  }'`,
    mockResponse: JSON.stringify(
      {
        data: {
          execution_id: 'exec_8f3a2b1c',
          strategy_id: 1,
          symbol: 'AAPL',
          side: 'Buy',
          qty: 100,
          entry_price: 178.42,
          stop_loss: 174.85,
          take_profit: 185.50,
          status: 'Executed',
          timestamp: '2026-03-08T14:32:15Z',
        },
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/v1/portfolio',
    description: 'Retrieve current portfolio holdings, values, and performance.',
    curl: `curl -X GET https://api.tradeflow.com/api/v1/portfolio \\
  -H "Authorization: Bearer tf_live_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json"`,
    mockResponse: JSON.stringify(
      {
        data: {
          total_value: 1048372.55,
          day_pnl: 3847.22,
          holdings: [
            { symbol: 'AAPL', shares: 150, avg_cost: 171.25, current_price: 178.42, pnl: 1075.5 },
            { symbol: 'MSFT', shares: 80, avg_cost: 402.30, current_price: 415.88, pnl: 1086.4 },
          ],
        },
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/v1/trades',
    description: 'Query trade history with filtering by symbol, strategy, and date range.',
    curl: `curl -X GET "https://api.tradeflow.com/api/v1/trades?symbol=AAPL&limit=10" \\
  -H "Authorization: Bearer tf_live_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json"`,
    mockResponse: JSON.stringify(
      {
        data: [
          {
            id: 501,
            date: '2026-03-08',
            symbol: 'AAPL',
            strategy: 'RSI Mean Reversion',
            side: 'Buy',
            qty: 100,
            entry_price: 176.30,
            exit_price: 178.42,
            pnl: 212.0,
            duration: '2h',
          },
        ],
        meta: { total: 342, page: 1, limit: 10 },
      },
      null,
      2
    ),
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  POST: 'bg-green-brand/10 text-green-brand border-green-brand/20',
};

export default function ApiConsole() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [responseIdx, setResponseIdx] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">API Console</h1>
        <p className="text-sm text-gray-400 mt-1">
          Explore the TradeFlow TaaS API. Integrate automated trading into your applications.
        </p>
      </div>

      {/* API Key section */}
      <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-2">API Key</h2>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-navy-700 px-4 py-2.5 rounded-lg text-sm text-gray-300 font-mono">
            tf_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
          </code>
          <span className="text-xs text-gray-500">Demo key — read-only</span>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        {endpoints.map((ep, i) => (
          <div key={i} className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-700">
              <div className="flex items-center gap-3 mb-1">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border ${methodColors[ep.method]}`}
                >
                  {ep.method}
                </span>
                <code className="text-sm text-white font-mono">{ep.path}</code>
              </div>
              <p className="text-sm text-gray-400">{ep.description}</p>
            </div>
            <div className="relative">
              <pre className="bg-navy-900 px-5 py-4 text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
                {ep.curl}
              </pre>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => copyToClipboard(ep.curl, i)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-navy-700 text-gray-300 rounded-lg text-xs hover:bg-navy-600 transition-colors cursor-pointer"
                >
                  {copiedIdx === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedIdx === i ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => setResponseIdx(responseIdx === i ? null : i)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-green-brand/10 text-green-brand rounded-lg text-xs hover:bg-green-brand/20 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  Try it
                </button>
              </div>
            </div>
            {responseIdx === i && (
              <div className="border-t border-navy-700">
                <div className="px-5 py-2 bg-navy-700/50 flex items-center gap-2">
                  <span className="text-xs font-semibold text-green-brand">200 OK</span>
                  <span className="text-xs text-gray-500">application/json</span>
                </div>
                <pre className="bg-navy-900 px-5 py-4 text-sm text-green-brand/80 overflow-x-auto font-mono leading-relaxed">
                  {ep.mockResponse}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
