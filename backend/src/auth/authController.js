const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// prepared statements
const stmtFindByEmail = db.prepare("SELECT id, email, password_hash FROM users WHERE email = ?");
const stmtInsertUser = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");

async function register(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    // already exists?
    const existing = stmtFindByEmail.get(email);
    if (existing) return res.status(409).json({ error: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const info = stmtInsertUser.run(email, hash);

    return res.status(201).json({ message: "User created", id: info.lastInsertRowid });
}

async function login(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = stmtFindByEmail.get(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "dev-secret",
        { expiresIn: "2h" }
    );
    return res.json({ token });
}

function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

module.exports = { register, login, requireAuth };
