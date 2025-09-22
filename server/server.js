// server.js
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
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

// Configuração CORS
app.use(
  cors({
    origin: "http://localhost:5173", // frontend Vite
    credentials: true,
  })
);

// Parse JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "appfood-secret-key",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
      collectionName: "sessions",
    }),
    cookie: {
      secure: false, // true em produção com HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
    },
  })
);

// Conexão com banco de dados
connectDB();

// Log de erros do servidor
app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Rotas API
app.use(basicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/inventory", inventoryRoutes);

// Servir arquivos estáticos do frontend (build do Vite)
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback: qualquer rota não-API retorna index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// 404 handler para APIs que não bateram nas rotas
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

// Inicia servidor
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
