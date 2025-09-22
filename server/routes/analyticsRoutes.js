// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const analyticsService = require("../services/analyticsService");

// GET /api/analytics/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const period = req.query.period || "30d";
    const analytics = await analyticsService.getDashboard(period);

    if (!analytics) {
      return res.status(404).json({ success: false, message: "No analytics data found" });
    }

    res.json({ success: true, analytics });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ success: false, message: "Failed to compute analytics" });
  }
});

// ✅ GET /api/analytics/recent
router.get("/recent", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const orders = await analyticsService.getRecentOrders(limit);

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Recent orders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch recent orders" });
  }
});

module.exports = router;




