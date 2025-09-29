const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { i18nMiddleware, i18n } = require("./i18n");
const v1 = require("./routes/v1");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(i18nMiddleware);

// health (unversioned)
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, msg: i18n.t("HEALTH_OK"), ts: Date.now() })
);

// versioned API
app.use("/api/v1", v1);

// 404 (localized)
app.use((req, res) => {
  res.status(404).json({ error: i18n.t("NOT_FOUND"), path: req.path });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`> API on http://localhost:${PORT}`));
