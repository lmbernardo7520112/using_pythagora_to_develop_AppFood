//server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { requireUser } = require('./middlewares/auth'); // 🔥 corrigido: caminho certo

// Listar produtos (com filtro opcional por categoria)
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const query = categoryId ? { categoryId, isActive: true } : { isActive: true };
    const products = await Product.find(query).populate('categoryId').lean();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Criar produto (somente admin)
router.post('/', requireUser(['admin']), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    await product.populate('categoryId');
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Atualizar produto (somente admin)
router.put('/:id', requireUser(['admin']), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('categoryId');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Deletar produto (somente admin)
router.delete('/:id', requireUser(['admin']), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Alternar status do produto (somente admin)
router.patch('/:id/toggle', requireUser(['admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    product.isActive = !product.isActive;
    await product.save();
    await product.populate('categoryId');
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
