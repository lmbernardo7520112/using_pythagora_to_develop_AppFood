const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Stock = require('../models/Stock');

/**
 * GET /api/orders/recent
 * Retorna os pedidos mais recentes
 * Query params: limit (opcional, padrão 5)
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    console.log(`Fetching ${limit} most recent orders`);

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Error fetching recent orders:', error.message);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent orders',
      error: error.message,
    });
  }
});

// GET /api/orders - Get orders (with pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, email } = req.query;

    console.log('Fetching orders with filters:', { page, limit, status, email });

    const query = {};
    if (status) query.status = status;
    if (email) query['customerInfo.email'] = email;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'name email');

    const totalOrders = await Order.countDocuments(query);

    console.log(`Found ${orders.length} orders (${totalOrders} total)`);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        hasNextPage: skip + orders.length < totalOrders,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// GET /api/orders/:id - Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching order with ID: ${id}`);

    const order = await Order.findById(id).populate('userId', 'name email');

    if (!order) {
      console.log(`Order not found with ID: ${id}`);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderItems = await OrderItem.find({ orderId: id }).populate('productId', 'name images category');

    console.log(`Found order: ${order.orderNumber} with ${orderItems.length} items`);

    res.status(200).json({ success: true, order: { ...order.toObject(), items: orderItems } });
  } catch (error) {
    console.error('Error fetching order:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
  }
});

// GET /api/orders/number/:orderNumber - Get order by order number
router.get('/number/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    console.log(`Fetching order with number: ${orderNumber}`);

    const order = await Order.findOne({ orderNumber }).populate('userId', 'name email');

    if (!order) {
      console.log(`Order not found with number: ${orderNumber}`);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderItems = await OrderItem.find({ orderId: order._id }).populate('productId', 'name images category');

    console.log(`Found order: ${order.orderNumber} with ${orderItems.length} items`);

    res.status(200).json({ success: true, order: { ...order.toObject(), items: orderItems } });
  } catch (error) {
    console.error('Error fetching order by number:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
  }
});

// POST /api/orders - Create new order from cart
router.post('/', async (req, res) => {
  try {
    const { customerInfo, deliveryAddress, paymentMethod, sessionId, deliveryFee = 0, notes } = req.body;

    console.log('Creating new order:', { customerName: customerInfo?.name, paymentMethod, sessionId });

    if (!customerInfo?.name || !customerInfo?.email) {
      return res.status(400).json({ success: false, message: 'Customer name and email are required' });
    }

    if (!deliveryAddress?.street || !deliveryAddress?.city || !deliveryAddress?.zipCode) {
      return res.status(400).json({ success: false, message: 'Complete delivery address is required' });
    }

    if (!paymentMethod) return res.status(400).json({ success: false, message: 'Payment method is required' });
    if (!sessionId) return res.status(400).json({ success: false, message: 'Session ID is required' });

    const cart = await Cart.findBySession(sessionId);
    if (!cart || cart.isEmpty()) return res.status(400).json({ success: false, message: 'Cart is empty' });

    const orderItemsData = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      if (!product || !product.isActive)
        return res.status(400).json({ success: false, message: `Product ${cartItem.productName} is no longer available` });

      const stockQuery = { productId: cartItem.productId, isActive: true };
      if (cartItem.sizeId) stockQuery.sizeId = cartItem.sizeId;

      const stock = await Stock.findOne(stockQuery);
      if (!stock || stock.availableQuantity < cartItem.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for ${cartItem.productName}` });

      if (!stock.reserveStock(cartItem.quantity))
        return res.status(400).json({ success: false, message: `Failed to reserve stock for ${cartItem.productName}` });

      await stock.save();

      orderItemsData.push({
        productId: cartItem.productId,
        productName: cartItem.productName,
        productImage: cartItem.productImage,
        sizeId: cartItem.sizeId,
        sizeName: cartItem.sizeName,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        totalPrice: cartItem.totalPrice,
      });

      subtotal += cartItem.totalPrice;
    }

    const tax = 0;
    const discount = 0;
    const totalAmount = subtotal + deliveryFee + tax - discount;

    const order = new Order({ customerInfo, deliveryAddress, paymentMethod, subtotal, deliveryFee, tax, discount, totalAmount, notes, estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000) });

    const savedOrder = await order.save();

    const orderItems = await Promise.all(orderItemsData.map(itemData => new OrderItem({ orderId: savedOrder._id, ...itemData }).save()));

    cart.clearCart();
    await cart.save();

    console.log(`Order created successfully: ${savedOrder.orderNumber} with ${orderItems.length} items, total: R$ ${savedOrder.totalAmount}`);

    res.status(201).json({ success: true, message: 'Order created successfully', order: { ...savedOrder.toObject(), items: orderItems } });
  } catch (error) {
    console.error('Error creating order:', error.message);
    console.error('Stack trace:', error.stack);
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: 'Validation error', error: error.message });
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating order ${id} status to: ${status}`);
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const oldStatus = order.status;
    order.status = status;

    if (status === 'delivered' && !order.actualDeliveryTime) order.actualDeliveryTime = new Date();

    await order.save();

    console.log(`Order ${order.orderNumber} status updated from ${oldStatus} to ${status}`);
    res.status(200).json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
});

// PUT /api/orders/:id/payment-status - Update payment status
router.put('/:id/payment-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentId } = req.body;

    console.log(`Updating order ${id} payment status to: ${paymentStatus}`);
    const validPaymentStatuses = ['pending', 'processing', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) return res.status(400).json({ success: false, message: 'Invalid payment status' });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const oldPaymentStatus = order.paymentStatus;
    order.paymentStatus = paymentStatus;
    if (paymentId) order.paymentId = paymentId;

    if (paymentStatus === 'paid' && order.status === 'pending') order.status = 'confirmed';

    if (paymentStatus === 'paid') {
      const orderItems = await OrderItem.find({ orderId: id });
      for (const item of orderItems) {
        const stockQuery = { productId: item.productId, isActive: true };
        if (item.sizeId) stockQuery.sizeId = item.sizeId;

        const stock = await Stock.findOne(stockQuery);
        if (stock) {
          stock.consumeStock(item.quantity);
          await stock.save();
          console.log(`Stock consumed for ${item.productName}: ${item.quantity} units`);
        }
      }
    }

    await order.save();
    console.log(`Order ${order.orderNumber} payment status updated from ${oldPaymentStatus} to ${paymentStatus}`);
    res.status(200).json({ success: true, message: 'Payment status updated successfully', order });
  } catch (error) {
    console.error('Error updating payment status:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to update payment status', error: error.message });
  }
});

// DELETE /api/orders/:id - Cancel order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log(`Cancelling order ${id}, reason: ${reason}`);
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!order.canBeCancelled()) return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });

    const orderItems = await OrderItem.find({ orderId: id });
    for (const item of orderItems) {
      const stockQuery = { productId: item.productId, isActive: true };
      if (item.sizeId) stockQuery.sizeId = item.sizeId;

      const stock = await Stock.findOne(stockQuery);
      if (stock) {
        stock.releaseReservedStock(item.quantity);
        await stock.save();
        console.log(`Stock released for ${item.productName}: ${item.quantity} units`);
      }
    }

    order.status = 'cancelled';
    order.cancelReason = reason;
    await order.save();

    console.log(`Order ${order.orderNumber} cancelled successfully`);
    res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling order:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to cancel order', error: error.message });
  }
});

module.exports = router;
