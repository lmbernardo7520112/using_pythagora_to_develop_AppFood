const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

router.get('/dashboard', async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const result = await analyticsService.getDashboard(period);
    res.json(result);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Failed to compute analytics' });
  }
});

module.exports = router;


