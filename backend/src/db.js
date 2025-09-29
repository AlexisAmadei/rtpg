const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "db.sqlite"));

// Pragmas for stability/perf (safe defaults)
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---- schema (create-if-not-exists) ----
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// ---- matches and moves ----
db.exec(`
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  opponent_id INTEGER,
  board TEXT NOT NULL DEFAULT '_________',
  turn TEXT NOT NULL DEFAULT 'X',
  status TEXT NOT NULL DEFAULT 'waiting',
  winner TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id),
  FOREIGN KEY (opponent_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS moves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  index_pos INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (player_id) REFERENCES users(id)
);
`);


module.exports = db;
