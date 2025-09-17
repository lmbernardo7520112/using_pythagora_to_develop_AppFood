const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
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
  },
  specialInstructions: {
    type: String,
    maxlength: [200, 'Special instructions cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Indexes for better performance
orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ productId: 1 });

// Pre-save middleware to calculate total price
orderItemSchema.pre('save', function(next) {
  this.totalPrice = this.quantity * this.unitPrice;
  next();
});

// Static methods
orderItemSchema.statics.getOrderTotal = async function(orderId) {
  const result = await this.aggregate([
    { $match: { orderId: new mongoose.Types.ObjectId(orderId) } },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalPrice' },
        totalQuantity: { $sum: '$quantity' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { totalAmount: 0, totalQuantity: 0 };
};

// Methods
orderItemSchema.methods.updateTotal = function() {
  this.totalPrice = this.quantity * this.unitPrice;
  return this.totalPrice;
};

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;