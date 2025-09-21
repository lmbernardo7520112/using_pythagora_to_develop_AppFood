// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const analyticsService = require("../services/analyticsService");

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

module.exports = router;



