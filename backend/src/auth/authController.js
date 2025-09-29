const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// In-memory store (replace with DB later)
const users = [];

// register
async function register(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ error: "Email and password required" });

    if (users.find(u => u.email === email))
        return res.status(409).json({ error: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = { id: Date.now(), email, hash };
    users.push(user);

    res.status(201).json({ message: "User created", id: user.id });
}

// login
async function login(req, res) {
    const { email, password } = req.body || {};
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "dev-secret",
        { expiresIn: "2h" }
    );
    res.json({ token });
}

// middleware to protect routes
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
