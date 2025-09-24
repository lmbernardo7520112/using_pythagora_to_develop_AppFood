//server/models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required']
  },
  productImage: {
    type: String,
    required: [true, 'Product image is required']
  },
  sizeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Optional for products without sizes
  },
  sizeName: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: function() { return !this.userId; }, // Required if no userId
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous carts
  },
  items: [cartItemSchema],
  totalQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Anonymous carts expire in 24 hours, user carts in 7 days
      const hours = this.userId ? 24 * 7 : 24;
      return new Date(Date.now() + hours * 60 * 60 * 1000);
    },
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Indexes for better performance
cartSchema.index({ userId: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.items.forEach(item => {
    item.totalPrice = item.quantity * item.unitPrice;
  });

  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);

  next();
});

// Methods
cartSchema.methods.addItem = function(itemData) {
  const existingItemIndex = this.items.findIndex(item => 
    item.productId.toString() === itemData.productId.toString() &&
    ((!item.sizeId && !itemData.sizeId) || (item.sizeId && item.sizeId.toString() === itemData.sizeId.toString()))
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += itemData.quantity;
    this.items[existingItemIndex].totalPrice = this.items[existingItemIndex].quantity * this.items[existingItemIndex].unitPrice;
  } else {
    // Add new item
    this.items.push({
      ...itemData,
      totalPrice: itemData.quantity * itemData.unitPrice
    });
  }

  this.calculateTotals();
  return this;
};

cartSchema.methods.removeItem = function(itemId) {
  this.items.pull({ _id: itemId });
  this.calculateTotals();
  return this;
};

cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    if (quantity <= 0) {
      this.removeItem(itemId);
    } else {
      item.quantity = quantity;
      item.totalPrice = item.quantity * item.unitPrice;
      this.calculateTotals();
    }
  }
  return this;
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  this.calculateTotals();
  return this;
};

cartSchema.methods.calculateTotals = function() {
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  return this;
};

cartSchema.methods.getItemCount = function() {
  return this.totalQuantity;
};

cartSchema.methods.isEmpty = function() {
  return this.items.length === 0;
};

// Static methods
cartSchema.statics.findBySession = function(sessionId) {
  return this.findOne({ sessionId });
};

cartSchema.statics.findByUser = function(userId) {
  return this.findOne({ userId });
};

cartSchema.statics.findCart = function(sessionId, userId) {
  const query = userId ? { userId } : { sessionId };
  return this.findOne(query);
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
