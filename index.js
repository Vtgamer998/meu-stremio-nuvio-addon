require("dotenv").config();
const express = require("express");
const cors = require("cors");
const manifest = require("./manifest");
const catalogRouter = require("./src/routes/catalog");
const metaRouter = require("./src/routes/meta");
const streamRouter = require("./src/routes/stream");

const app = express();
const PORT = process.env.PORT || 7000;

// ─── Middlewares ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Log de Requisições ───────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Manifest ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.redirect("/manifest.json");
});

app.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(manifest);
});

// ─── Rotas Principais ─────────────────────────────────────
app.use("/catalog", catalogRouter);
app.use("/meta", metaRouter);
app.use("/stream", streamRouter);

// ─── Health Check ─────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "✅ Online",
    version: manifest.version,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║       🎬 Nuvio Addon v2.0.0          ║
  ╠═══════════════════════════════════════╣
  ║  Status  : ✅ Online                 ║
  ║  Porta   : ${PORT}                      ║
  ║  Manifest: /manifest.json            ║
  ║  Health  : /health                   ║
  ╚═══════════════════════════════════════╝
  `);
});
