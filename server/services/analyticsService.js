// services/analyticsService.js
const Order = require("../models/Order");

function calculateGrowth(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

async function getDashboard(period = "30d") {
  const now = new Date();
  let days;

  switch (period) {
    case "7d":
      days = 7;
      break;
    case "30d":
      days = 30;
      break;
    case "90d":
      days = 90;
      break;
    case "1y":
      days = 365;
      break;
    default:
      days = 30;
  }

  // Período atual
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Período anterior
  const prevStartDate = new Date();
  prevStartDate.setDate(prevStartDate.getDate() - days * 2);

  const prevEndDate = new Date();
  prevEndDate.setDate(prevEndDate.getDate() - days);

  // Buscar pedidos atuais
  const orders = await Order.find({ createdAt: { $gte: startDate } });

  // Buscar pedidos do período anterior
  const prevOrders = await Order.find({
    createdAt: { $gte: prevStartDate, $lt: prevEndDate },
  });

  // Totais atuais
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const customers = new Set(orders.map((o) => o.customerId)).size;

  // Totais anteriores
  const prevRevenue = prevOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const prevOrdersCount = prevOrders.length;
  const prevCustomers = new Set(prevOrders.map((o) => o.customerId)).size;

  // Popular Products
  const productMap = {};
  for (const order of orders) {
    for (const item of order.items) {
      if (!productMap[item.productId]) {
        productMap[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          orderCount: 0,
          revenue: 0,
        };
      }
      productMap[item.productId].orderCount += item.quantity;
      productMap[item.productId].revenue += item.total || item.price * item.quantity;
    }
  }
  const popularProducts = Object.values(productMap)
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5);

  // Order Status Distribution
  const statusMap = {};
  for (const order of orders) {
    statusMap[order.status] = (statusMap[order.status] || 0) + 1;
  }
  const orderStatusDistribution = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
    percentage: ((count / totalOrders) * 100).toFixed(1),
  }));

  // Revenue Chart
  const revenueChartMap = {};
  for (const order of orders) {
    const date = order.createdAt.toISOString().split("T")[0]; // yyyy-mm-dd
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

module.exports = { getDashboard };




