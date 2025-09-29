const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const api = require("./routes/api.js");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "api", ts: Date.now() }));
app.use("/api", api);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`> API listening on http://localhost:${PORT}`));
