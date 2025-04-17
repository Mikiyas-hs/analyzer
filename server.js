const express = require("express");
const fetch = require("node-fetch");  // Zorg ervoor dat je dit geïnstalleerd hebt met: npm install node-fetch
const path = require("path");

const app = express();
const API_KEY = "cvi2t3pr01qks9q7tci0cvi2t3pr01qks9q7tcig";
const FMP_API_KEY = "KKeftfb9VXSNts02zeC6qWb9yaTD9IZ3"; // Vervang met jouw echte FMP key

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Metrics endpoint
app.get("/api/metrics/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const url = `https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("✅ Metrics ontvangen van Finnhub:", data);
    res.json(data);
  } catch (err) {
    console.error("❌ Fout bij ophalen van metrics:", err);
    res.status(500).json({ error: "Fout bij ophalen van metrics" });
  }
});

// Cashflow endpoint
app.get("/api/cashflow/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const url = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${ticker}?limit=1&apikey=${FMP_API_KEY}`;

  console.log("📌 FMP URL (Cashflow):", url); // Debug logging

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("✅ Cashflow ontvangen van FMP:", data);
    res.json(data);
  } catch (err) {
    console.error("❌ Fout bij ophalen van cashflow:", err);
    res.status(500).json({ error: "Fout bij ophalen van cashflow" });
  }
});

// Zet deze code helemaal onderaan je server.js
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server draait op http://localhost:${PORT}`);
});
