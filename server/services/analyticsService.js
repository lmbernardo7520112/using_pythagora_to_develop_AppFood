const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const mongoose = require('mongoose');

/**
 * Calcula crescimento percentual
 */
function calculateGrowth(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Obtém dados analíticos do dashboard
 */
async function getDashboard(period = "30d") {
  let days;
  switch (period) {
    case "7d": days = 7; break;
    case "30d": days = 30; break;
    case "90d": days = 90; break;
    case "1y": days = 365; break;
    default: days = 30;
  }

  // Período atual
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Período anterior
  const prevStartDate = new Date();
  prevStartDate.setDate(prevStartDate.getDate() - days * 2);
  const prevEndDate = new Date();
  prevEndDate.setDate(prevEndDate.getDate() - days);

  // Pedidos atuais
  const orders = await Order.find({ createdAt: { $gte: startDate } });

  // Pedidos anteriores
  const prevOrders = await Order.find({
    createdAt: { $gte: prevStartDate, $lt: prevEndDate },
  });

  // Totais
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const customers = new Set(orders.map((o) => o.userId ? o.userId.toString() : o.customerInfo.email)).size;

  const prevRevenue = prevOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const prevOrdersCount = prevOrders.length;
  const prevCustomers = new Set(prevOrders.map((o) => o.userId ? o.userId.toString() : o.customerInfo.email)).size;

  // Produtos mais populares (usando OrderItem)
  const popularProductsAgg = await OrderItem.aggregate([
    { $match: { orderId: { $in: orders.map(o => o._id) } } },
    { $group: { _id: "$productId", orderCount: { $sum: "$quantity" }, revenue: { $sum: "$totalPrice" } } },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $project: { productId: '$_id', productName: '$product.name', orderCount: 1, revenue: 1 } },
    { $sort: { orderCount: -1 } },
    { $limit: 5 }
  ]);

  const popularProducts = popularProductsAgg;

  // Distribuição por status
  const statusMap = {};
  for (const order of orders) {
    statusMap[order.status] = (statusMap[order.status] || 0) + 1;
  }
  const orderStatusDistribution = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
    percentage: parseFloat(((count / totalOrders) * 100).toFixed(1)),
  }));

  // Revenue Chart
  const revenueChartMap = {};
  for (const order of orders) {
    const date = order.createdAt.toISOString().split("T")[0];
    revenueChartMap[date] = (revenueChartMap[date] || 0) + (order.totalAmount || 0);
  }
  const revenueChart = Object.entries(revenueChartMap).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  return {
    revenue: {
      total: totalRevenue,
      growth: calculateGrowth(totalRevenue, prevRevenue),
      thisMonth: totalRevenue,
    },
    orders: {
      total: totalOrders,
      growth: calculateGrowth(totalOrders, prevOrdersCount),
      thisMonth: totalOrders,
    },
    customers: {
      total: customers,
      growth: calculateGrowth(customers, prevCustomers),
      thisMonth: customers,
    },
    popularProducts,
    orderStatusDistribution,
    revenueChart,
  };
}

/**
 * ✅ Obtém os últimos pedidos
 */
async function getRecentOrders(limit = 5) {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(limit);
  return orders;
}

module.exports = { getDashboard, getRecentOrders };