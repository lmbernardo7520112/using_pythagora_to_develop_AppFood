const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventoryService');

router.get('/', async (req, res) => {
  try {
    const q = req.query.q || null;
    const result = await inventoryService.getInventory({ q });
    res.json(result);
  } catch (err) {
    console.error('Inventory GET error:', err);
    res.status(err.status || 500).json({ message: err.message || 'Failed to fetch inventory' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const body = req.body;
    const updated = await inventoryService.updateStock(productId, body);
    res.json(updated);
  } catch (err) {
    console.error('Inventory PUT error:', err);
    res.status(err.status || 500).json({ message: err.message || 'Failed to update inventory' });
  }
});

module.exports = router;
