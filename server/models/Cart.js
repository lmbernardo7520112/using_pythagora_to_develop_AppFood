// server/models/Cart.js
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // mantém suporte para carrinhos anônimos
    index: true
  },
  sessionId: {
    type: String,
    required: false,
    index: true
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
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// ---------- INDEXES ----------
cartSchema.index({ userId: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });

// ---------- MÉTODOS DE INSTÂNCIA ----------
cartSchema.methods.calculateTotals = function() {
  this.items.forEach(item => {
    item.totalPrice = item.quantity * item.unitPrice;
  });
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  return this;
};

cartSchema.pre('save', function(next) {
  this.calculateTotals();
  // expira em 7 dias para usuários logados, 1 dia para sessionId
  const hours = this.userId ? 24 * 7 : 24;
  this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  next();
});

cartSchema.methods.addItem = function(itemData) {
  const existingIndex = this.items.findIndex(item =>
    item.productId.toString() === itemData.productId.toString() &&
    ((!item.sizeId && !itemData.sizeId) || (item.sizeId && item.sizeId.toString() === itemData.sizeId?.toString()))
  );

  if (existingIndex > -1) {
    this.items[existingIndex].quantity += itemData.quantity;
  } else {
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
    }
  }
  this.calculateTotals();
  return this;
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  this.calculateTotals();
  return this;
};

cartSchema.methods.getItemCount = function() {
  return this.totalQuantity;
};

cartSchema.methods.isEmpty = function() {
  return this.items.length === 0;
};

// ---------- MÉTODOS ESTÁTICOS ----------
cartSchema.statics.findBySession = function(sessionId) {
  return this.findOne({ sessionId });
};

cartSchema.statics.findByUser = function(userId) {
  return this.findOne({ userId });
};

/**
 * Find cart by userId or sessionId (prioriza userId)
 */
cartSchema.statics.findCart = function({ userId, sessionId }) {
  const query = userId ? { userId } : { sessionId };
  return this.findOne(query);
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;

