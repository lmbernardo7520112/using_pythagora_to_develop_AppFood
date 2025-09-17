const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Stock = require('../models/Stock');

// Middleware to get or create session ID
const getSessionId = (req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  
  if (!req.session.cartId) {
    req.session.cartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  req.sessionId = req.session.cartId;
  next();
};

// GET /api/cart - Get current cart
router.get('/', getSessionId, async (req, res) => {
  try {
    console.log(`Fetching cart for session: ${req.sessionId}`);
    
    const cart = await Cart.findBySession(req.sessionId)
      .populate('items.productId', 'name images price isActive');
    
    if (!cart || cart.isEmpty()) {
      console.log('Cart is empty or not found');
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          totalQuantity: 0,
          totalAmount: 0
        }
      });
    }
    
    // Filter out inactive products
    const activeItems = cart.items.filter(item => item.productId && item.productId.isActive);
    
    if (activeItems.length !== cart.items.length) {
      cart.items = activeItems;
      cart.calculateTotals();
      await cart.save();
      console.log('Removed inactive products from cart');
    }
    
    console.log(`Found cart with ${cart.items.length} items, total: R$ ${cart.totalAmount}`);
    
    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        totalQuantity: cart.totalQuantity,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
});

// POST /api/cart/items - Add item to cart
router.post('/items', getSessionId, async (req, res) => {
  try {
    const { productId, sizeId, quantity = 1 } = req.body;
    
    console.log(`Adding item to cart:`, { productId, sizeId, quantity, sessionId: req.sessionId });
    
    // Validate required fields
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and valid quantity are required'
      });
    }
    
    // Get product details
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }
    
    // Determine price and size info
    let unitPrice = product.price;
    let sizeName = null;
    
    if (sizeId && product.sizes && product.sizes.length > 0) {
      const size = product.sizes.id(sizeId);
      if (!size) {
        return res.status(400).json({
          success: false,
          message: 'Invalid size selected'
        });
      }
      unitPrice = size.price;
      sizeName = size.name;
    }
    
    // Check stock availability
    const stockQuery = { productId, isActive: true };
    if (sizeId) {
      stockQuery.sizeId = sizeId;
    }
    
    const stock = await Stock.findOne(stockQuery);
    if (!stock || stock.availableQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }
    
    // Find or create cart
    let cart = await Cart.findBySession(req.sessionId);
    if (!cart) {
      cart = new Cart({
        sessionId: req.sessionId,
        items: []
      });
    }
    
    // Add item to cart
    const itemData = {
      productId,
      productName: product.name,
      productImage: product.images[0],
      sizeId,
      sizeName,
      quantity: parseInt(quantity),
      unitPrice
    };
    
    cart.addItem(itemData);
    await cart.save();
    
    console.log(`Item added to cart successfully. Cart total: ${cart.totalQuantity} items, R$ ${cart.totalAmount}`);
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        _id: cart._id,
        items: cart.items,
        totalQuantity: cart.totalQuantity,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Error adding item to cart:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
});

// PUT /api/cart/items/:itemId - Update cart item quantity
router.put('/items/:itemId', getSessionId, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    console.log(`Updating cart item ${itemId} to quantity: ${quantity}`);
    
    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }
    
    const cart = await Cart.findBySession(req.sessionId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }
    
    // Check stock if increasing quantity
    if (quantity > item.quantity) {
      const additionalQuantity = quantity - item.quantity;
      const stockQuery = { productId: item.productId, isActive: true };
      if (item.sizeId) {
        stockQuery.sizeId = item.sizeId;
      }
      
      const stock = await Stock.findOne(stockQuery);
      if (!stock || stock.availableQuantity < additionalQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available'
        });
      }
    }
    
    cart.updateItemQuantity(itemId, parseInt(quantity));
    await cart.save();
    
    console.log(`Cart item updated successfully. New cart total: ${cart.totalQuantity} items`);
    
    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cart: {
        _id: cart._id,
        items: cart.items,
        totalQuantity: cart.totalQuantity,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
});

// DELETE /api/cart/items/:itemId - Remove item from cart
router.delete('/items/:itemId', getSessionId, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    console.log(`Removing item ${itemId} from cart`);
    
    const cart = await Cart.findBySession(req.sessionId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }
    
    cart.removeItem(itemId);
    await cart.save();
    
    console.log(`Item removed from cart successfully. Remaining items: ${cart.items.length}`);
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: {
        _id: cart._id,
        items: cart.items,
        totalQuantity: cart.totalQuantity,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Error removing cart item:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: error.message
    });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', getSessionId, async (req, res) => {
  try {
    console.log(`Clearing cart for session: ${req.sessionId}`);
    
    const cart = await Cart.findBySession(req.sessionId);
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'Cart is already empty',
        cart: {
          items: [],
          totalQuantity: 0,
          totalAmount: 0
        }
      });
    }
    
    cart.clearCart();
    await cart.save();
    
    console.log('Cart cleared successfully');
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        _id: cart._id,
        items: cart.items,
        totalQuantity: cart.totalQuantity,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
});

// GET /api/cart/count - Get cart item count (for header badge)
router.get('/count', getSessionId, async (req, res) => {
  try {
    const cart = await Cart.findBySession(req.sessionId);
    const count = cart ? cart.getItemCount() : 0;
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching cart count:', error.message);
    res.status(500).json({
      success: false,
      count: 0,
      error: error.message
    });
  }
});

module.exports = router;