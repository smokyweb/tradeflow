# TradeFlow — Automated Trading-as-a-Service (TaaS) Demo

A professional fintech demo application showcasing automated trading strategy management, portfolio analytics, and trade execution via API.

**Live:** [tradeflow.bluesapps.com](https://tradeflow.bluesapps.com)

## Tech Stack

- **Frontend:** React + Vite + TypeScript, Tailwind CSS, Recharts, React Router
- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3)
- **Deployment:** Docker / Nixpacks (Coolify)

## Features

- **Dashboard** — Portfolio summary, equity curve chart, active strategies, recent trades
- **Strategies** — 5 automated trading strategies with toggle controls, P&L tracking, and risk levels
- **Trade History** — Filterable trade log with pagination and summary statistics
- **Portfolio** — Holdings table, asset allocation pie chart, performance metrics (Sharpe, Sortino, Alpha, Beta)
- **API Console** — Interactive TaaS API documentation with copy/try-it functionality
- **Auth** — Demo login (admin@tradeflow.demo / demo1234)

## Quick Start

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Run backend (port 3001)
cd backend && npm run dev

# Run frontend (port 5173)
cd ../frontend && npm run dev
```

Open http://localhost:5173 and log in with `admin@tradeflow.demo` / `demo1234`.

## Production Build

```bash
cd frontend && npm run build
cd ../backend && NODE_ENV=production PORT=3000 node server.js
```

## Docker

```bash
docker build -t tradeflow .
docker run -p 3000:3000 tradeflow
```

## Docker Compose (Development)

```bash
docker-compose up
```

Frontend: http://localhost:5173 | Backend: http://localhost:3001

## Deployment (Coolify / Nixpacks)

The included `nixpacks.toml` configures the build for Coolify:

```toml
[phases.build]
cmds = ['cd frontend && npm install && npm run build', 'cd backend && npm install']

[start]
cmd = 'node backend/server.js'
```

## Project Structure

```
tradeflow/
├── frontend/          # React + Vite + TypeScript
│   └── src/
│       ├── components/  # Layout, sidebar
│       ├── pages/       # Dashboard, Strategies, Trades, Portfolio, ApiConsole, Login
│       ├── api.ts       # API client
│       └── auth.ts      # Demo authentication
├── backend/           # Express + SQLite
│   ├── server.js      # Express server
│   ├── routes.js      # API routes
│   ├── database.js    # SQLite connection
│   └── seed.js        # Deterministic seed data
├── Dockerfile
├── docker-compose.yml
└── nixpacks.toml
```
