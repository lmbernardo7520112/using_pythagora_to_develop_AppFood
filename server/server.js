//server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/database");

// Rotas
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

// Verifica variável de ambiente do banco
if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL variable in .env missing.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Pretty-print JSON responses
app.enable("json spaces");
app.enable("strict routing");

// CORS configurado para frontend Vite
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com banco de dados
connectDB();

// Log de erros do servidor
app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// ✅ ROTAS API
app.use(basicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/inventory", inventoryRoutes);

// 404 handler para APIs
app.use("/api/*", (req, res) => {
  console.log(`❌ API endpoint not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    endpoint: req.originalUrl,
  });
});

// Servir build do frontend
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "There was an error serving your request.",
  });
});

// Inicia servidor
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

