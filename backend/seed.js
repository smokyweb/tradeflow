// Deterministic seeded random number generator (Mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function randBetween(min, max) {
  return min + rand() * (max - min);
}

function randInt(min, max) {
  return Math.floor(randBetween(min, max + 1));
}

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function seedDatabase(db) {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS strategies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      pnl REAL NOT NULL DEFAULT 0,
      win_rate REAL NOT NULL DEFAULT 0,
      trade_count INTEGER NOT NULL DEFAULT 0,
      risk_level TEXT NOT NULL DEFAULT 'Medium',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      symbol TEXT NOT NULL,
      strategy TEXT NOT NULL,
      strategy_id INTEGER NOT NULL,
      side TEXT NOT NULL,
      qty INTEGER NOT NULL,
      entry_price REAL NOT NULL,
      exit_price REAL,
      pnl REAL,
      duration TEXT,
      status TEXT NOT NULL DEFAULT 'Closed',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS portfolio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL UNIQUE,
      shares INTEGER NOT NULL,
      avg_cost REAL NOT NULL,
      current_price REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS equity_curve (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      value REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value REAL NOT NULL
    );
  `);

  // Seed strategies
  const strategies = [
    {
      name: 'RSI Mean Reversion',
      description: 'Identifies overbought/oversold conditions using RSI indicator and trades mean reversion setups with dynamic position sizing.',
      status: 'Active',
      risk_level: 'Medium',
    },
    {
      name: 'MACD Momentum',
      description: 'Captures momentum shifts using MACD crossover signals combined with volume confirmation for high-probability entries.',
      status: 'Active',
      risk_level: 'High',
    },
    {
      name: 'Moving Average Crossover',
      description: 'Classic trend-following strategy using 50/200 EMA crossovers with ATR-based stop losses and trailing profit targets.',
      status: 'Active',
      risk_level: 'Low',
    },
    {
      name: 'Bollinger Band Squeeze',
      description: 'Detects low-volatility squeeze patterns using Bollinger Bands and enters breakout trades with momentum confirmation.',
      status: 'Paused',
      risk_level: 'Medium',
    },
    {
      name: 'Volume Weighted Momentum',
      description: 'Combines VWAP analysis with momentum indicators to identify institutional-grade entry and exit points.',
      status: 'Active',
      risk_level: 'High',
    },
  ];

  const insertStrategy = db.prepare(
    'INSERT INTO strategies (name, description, status, pnl, win_rate, trade_count, risk_level) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const strategyData = [];
  for (const s of strategies) {
    const tradeCount = randInt(40, 200);
    const winRate = randBetween(0.48, 0.72);
    const pnl = randBetween(-5000, 45000);
    insertStrategy.run(s.name, s.description, s.status, Math.round(pnl * 100) / 100, Math.round(winRate * 10000) / 100, tradeCount, s.risk_level);
    strategyData.push({ ...s, tradeCount, winRate, pnl });
  }

  // Seed trades
  const symbols = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'AMZN', 'GOOG'];
  const basePrices = {
    AAPL: 178,
    MSFT: 415,
    TSLA: 245,
    NVDA: 880,
    SPY: 520,
    QQQ: 445,
    AMZN: 185,
    GOOG: 155,
  };
  const durations = ['2m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '2d', '3d'];

  const insertTrade = db.prepare(
    'INSERT INTO trades (date, symbol, strategy, strategy_id, side, qty, entry_price, exit_price, pnl, duration, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const insertMany = db.transaction(() => {
    for (let i = 0; i < 500; i++) {
      const daysAgo = randInt(0, 89);
      const date = new Date(2026, 2, 8); // March 8, 2026
      date.setDate(date.getDate() - daysAgo);
      const dateStr = date.toISOString().split('T')[0];

      const symbol = pick(symbols);
      const stratIdx = randInt(0, strategies.length - 1);
      const strategy = strategies[stratIdx];
      const side = rand() > 0.5 ? 'Buy' : 'Sell';
      const qty = pick([10, 25, 50, 100, 150, 200, 500]);
      const basePrice = basePrices[symbol];
      const entryPrice = Math.round((basePrice + randBetween(-basePrice * 0.05, basePrice * 0.05)) * 100) / 100;
      const priceChange = randBetween(-0.03, 0.04) * entryPrice;
      const exitPrice = Math.round((entryPrice + (side === 'Buy' ? priceChange : -priceChange)) * 100) / 100;
      const pnl = Math.round((exitPrice - entryPrice) * qty * (side === 'Buy' ? 1 : -1) * 100) / 100;
      const duration = pick(durations);

      insertTrade.run(dateStr, symbol, strategy.name, stratIdx + 1, side, qty, entryPrice, exitPrice, pnl, duration, 'Closed');
    }
  });
  insertMany();

  // Seed portfolio holdings
  const insertHolding = db.prepare(
    'INSERT INTO portfolio (symbol, shares, avg_cost, current_price) VALUES (?, ?, ?, ?)'
  );

  const holdings = [
    { symbol: 'AAPL', shares: 150, avg_cost: 171.25, current_price: 178.42 },
    { symbol: 'MSFT', shares: 80, avg_cost: 402.30, current_price: 415.88 },
    { symbol: 'TSLA', shares: 60, avg_cost: 238.50, current_price: 245.12 },
    { symbol: 'NVDA', shares: 45, avg_cost: 845.00, current_price: 882.65 },
    { symbol: 'SPY', shares: 200, avg_cost: 512.40, current_price: 521.30 },
    { symbol: 'QQQ', shares: 100, avg_cost: 438.75, current_price: 446.20 },
    { symbol: 'AMZN', shares: 120, avg_cost: 179.60, current_price: 186.45 },
    { symbol: 'GOOG', shares: 90, avg_cost: 149.80, current_price: 155.32 },
  ];

  for (const h of holdings) {
    insertHolding.run(h.symbol, h.shares, h.avg_cost, h.current_price);
  }

  // Seed equity curve (90 days)
  const insertEquity = db.prepare('INSERT INTO equity_curve (date, value) VALUES (?, ?)');
  let equity = 1000000;
  const equityTransaction = db.transaction(() => {
    for (let i = 89; i >= 0; i--) {
      const date = new Date(2026, 2, 8);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dailyReturn = randBetween(-0.015, 0.02);
      equity *= 1 + dailyReturn;
      insertEquity.run(dateStr, Math.round(equity * 100) / 100);
    }
  });
  equityTransaction();

  // Seed metrics
  const insertMetric = db.prepare('INSERT INTO metrics (key, value) VALUES (?, ?)');
  const metricsTransaction = db.transaction(() => {
    insertMetric.run('sharpe_ratio', 1.84);
    insertMetric.run('max_drawdown', -8.42);
    insertMetric.run('sortino_ratio', 2.31);
    insertMetric.run('alpha', 4.56);
    insertMetric.run('beta', 0.87);
    insertMetric.run('total_value', Math.round(equity * 100) / 100);
    insertMetric.run('day_pnl', 3847.22);
    insertMetric.run('total_pnl', Math.round((equity - 1000000) * 100) / 100);
  });
  metricsTransaction();
}

module.exports = { seedDatabase };
