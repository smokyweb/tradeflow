const express = require('express');
const { getDatabase } = require('./database');

const router = express.Router();

// GET /api/strategies
router.get('/strategies', (req, res) => {
  const db = getDatabase();
  const strategies = db.prepare('SELECT * FROM strategies ORDER BY id').all();
  res.json(strategies);
});

// PATCH /api/strategies/:id
router.patch('/strategies/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const strategy = db.prepare('SELECT * FROM strategies WHERE id = ?').get(id);
  if (!strategy) {
    return res.status(404).json({ error: 'Strategy not found' });
  }
  const newStatus = strategy.status === 'Active' ? 'Paused' : 'Active';
  db.prepare('UPDATE strategies SET status = ? WHERE id = ?').run(newStatus, id);
  const updated = db.prepare('SELECT * FROM strategies WHERE id = ?').get(id);
  res.json(updated);
});

// GET /api/trades
router.get('/trades', (req, res) => {
  const db = getDatabase();
  const { symbol, strategy, side, startDate, endDate, limit = 50, offset = 0 } = req.query;

  let where = ['1=1'];
  let params = [];

  if (symbol) {
    where.push('symbol = ?');
    params.push(symbol);
  }
  if (strategy) {
    where.push('strategy = ?');
    params.push(strategy);
  }
  if (side) {
    where.push('side = ?');
    params.push(side);
  }
  if (startDate) {
    where.push('date >= ?');
    params.push(startDate);
  }
  if (endDate) {
    where.push('date <= ?');
    params.push(endDate);
  }

  const whereClause = where.join(' AND ');

  const total = db.prepare(`SELECT COUNT(*) as count FROM trades WHERE ${whereClause}`).get(...params);
  const trades = db
    .prepare(`SELECT * FROM trades WHERE ${whereClause} ORDER BY date DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...params, Number(limit), Number(offset));

  // Summary stats
  const stats = db
    .prepare(
      `SELECT
        COUNT(*) as total_trades,
        SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as profitable,
        SUM(CASE WHEN pnl <= 0 THEN 1 ELSE 0 END) as losing,
        ROUND(SUM(pnl), 2) as net_pnl
      FROM trades WHERE ${whereClause}`
    )
    .get(...params);

  res.json({ trades, total: total.count, stats });
});

// GET /api/portfolio
router.get('/portfolio', (req, res) => {
  const db = getDatabase();
  const holdings = db.prepare('SELECT * FROM portfolio ORDER BY symbol').all();

  const enriched = holdings.map((h) => {
    const marketValue = Math.round(h.shares * h.current_price * 100) / 100;
    const costBasis = Math.round(h.shares * h.avg_cost * 100) / 100;
    const pnl = Math.round((marketValue - costBasis) * 100) / 100;
    const pnlPercent = Math.round((pnl / costBasis) * 10000) / 100;
    return { ...h, market_value: marketValue, cost_basis: costBasis, pnl, pnl_percent: pnlPercent };
  });

  res.json(enriched);
});

// GET /api/metrics
router.get('/metrics', (req, res) => {
  const db = getDatabase();
  const rows = db.prepare('SELECT key, value FROM metrics').all();
  const metrics = {};
  for (const row of rows) {
    metrics[row.key] = row.value;
  }

  // Compute win rate from trades
  const tradeStats = db
    .prepare(
      `SELECT COUNT(*) as total, SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as wins FROM trades`
    )
    .get();
  metrics.win_rate = tradeStats.total > 0 ? Math.round((tradeStats.wins / tradeStats.total) * 10000) / 100 : 0;

  res.json(metrics);
});

// GET /api/equity-curve
router.get('/equity-curve', (req, res) => {
  const db = getDatabase();
  const curve = db.prepare('SELECT date, value FROM equity_curve ORDER BY date').all();
  res.json(curve);
});

module.exports = router;
