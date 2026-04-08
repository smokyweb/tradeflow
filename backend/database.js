const Database = require('better-sqlite3');
const path = require('path');
const { seedDatabase } = require('./seed');

const DB_PATH = path.join(__dirname, 'tradeflow.db');

let db;

function getDatabase() {
  if (db) return db;

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  // Check if tables exist
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='strategies'").get();

  if (!tableExists) {
    seedDatabase(db);
  }

  return db;
}

module.exports = { getDatabase };
