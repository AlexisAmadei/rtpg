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

module.exports = db;
