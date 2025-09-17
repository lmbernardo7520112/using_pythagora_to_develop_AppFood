const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  sizeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Optional for products without sizes
  },
  quantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Reserved quantity cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Low stock threshold cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique stock entries per product-size combination
stockSchema.index({ productId: 1, sizeId: 1 }, { unique: true });
stockSchema.index({ quantity: 1, isActive: 1 });

// Virtual for available quantity
stockSchema.virtual('availableQuantity').get(function() {
  return this.quantity - this.reservedQuantity;
});

// Methods
stockSchema.methods.reserveStock = function(amount) {
  if (this.availableQuantity >= amount) {
    this.reservedQuantity += amount;
    return true;
  }
  return false;
};

stockSchema.methods.releaseReservedStock = function(amount) {
  this.reservedQuantity = Math.max(0, this.reservedQuantity - amount);
};

stockSchema.methods.consumeStock = function(amount) {
  if (this.quantity >= amount) {
    this.quantity -= amount;
    this.reservedQuantity = Math.max(0, this.reservedQuantity - amount);
    return true;
  }
  return false;
};

stockSchema.methods.isLowStock = function() {
  return this.availableQuantity <= this.lowStockThreshold;
};

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;