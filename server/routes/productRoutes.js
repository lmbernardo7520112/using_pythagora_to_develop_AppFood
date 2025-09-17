const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Stock = require('../models/Stock');

// GET /api/products - Get all active products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { categoryId, featured, search, limit = 50, page = 1 } = req.query;
    
    console.log('Fetching products with filters:', { categoryId, featured, search, limit, page });
    
    // Build query
    const query = { isActive: true };
    
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with population and sorting
    const products = await Product.find(query)
      .populate('categoryId', 'name description')
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    
    console.log(`Found ${products.length} products (${totalProducts} total)`);
    
    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts,
        hasNextPage: skip + products.length < totalProducts,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// GET /api/products/:id - Get single product by ID with stock info
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching product with ID: ${id}`);
    
    const product = await Product.findById(id).populate('categoryId', 'name description');
    
    if (!product) {
      console.log(`Product not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Get stock information for the product
    const stockInfo = await Stock.find({ 
      productId: id, 
      isActive: true 
    }).select('sizeId quantity reservedQuantity availableQuantity lowStockThreshold');
    
    // Map stock to sizes
    const productWithStock = {
      ...product.toObject(),
      stockInfo: stockInfo.reduce((acc, stock) => {
        const key = stock.sizeId ? stock.sizeId.toString() : 'default';
        acc[key] = {
          quantity: stock.quantity,
          reservedQuantity: stock.reservedQuantity,
          availableQuantity: stock.availableQuantity,
          inStock: stock.availableQuantity > 0,
          isLowStock: stock.isLowStock()
        };
        return acc;
      }, {})
    };
    
    console.log(`Found product: ${product.name}`);
    
    res.status(200).json({
      success: true,
      product: productWithStock
    });
  } catch (error) {
    console.error('Error fetching product:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// GET /api/products/category/:categoryId - Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 50, page = 1 } = req.query;
    
    console.log(`Fetching products for category: ${categoryId}`);
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      console.log(`Category not found with ID: ${categoryId}`);
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find({ 
      categoryId, 
      isActive: true 
    })
      .populate('categoryId', 'name description')
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const totalProducts = await Product.countDocuments({ categoryId, isActive: true });
    
    console.log(`Found ${products.length} products in category: ${category.name}`);
    
    res.status(200).json({
      success: true,
      products,
      category: {
        _id: category._id,
        name: category.name,
        description: category.description
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts,
        hasNextPage: skip + products.length < totalProducts,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products by category:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category',
      error: error.message
    });
  }
});

// POST /api/products - Create new product (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, description, images, price, sizes, categoryId, featured } = req.body;
    
    console.log('Creating new product:', { name, categoryId, price });
    
    // Validate required fields
    if (!name || !description || !images || !Array.isArray(images) || images.length === 0 || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, images, price, and categoryId are required'
      });
    }
    
    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }
    
    const product = new Product({
      name,
      description,
      images,
      price,
      sizes: sizes || [],
      categoryId,
      featured: featured || false
    });
    
    const savedProduct = await product.save();
    
    // Create default stock entry
    const defaultStock = new Stock({
      productId: savedProduct._id,
      quantity: 0,
      lowStockThreshold: 10
    });
    await defaultStock.save();
    
    console.log(`Product created successfully: ${savedProduct.name} (ID: ${savedProduct._id})`);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`Updating product with ID: ${id}`);
    
    const product = await Product.findById(id);
    
    if (!product) {
      console.log(`Product not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Verify category exists if being updated
    if (updateData.categoryId) {
      const category = await Category.findById(updateData.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
    }
    
    // Update product
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        product[key] = updateData[key];
      }
    });
    
    const updatedProduct = await product.save();
    console.log(`Product updated successfully: ${updatedProduct.name}`);
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting product with ID: ${id}`);
    
    const product = await Product.findById(id);
    
    if (!product) {
      console.log(`Product not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();
    
    console.log(`Product soft deleted: ${product.name}`);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

module.exports = router;