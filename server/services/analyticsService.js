const Order = require('../models/Order');
const Product = require('../models/Product');

function parsePeriodToDate(period) {
  if (!period) return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const m = period.match(/^(\d+)d$/);
  if (m) {
    const days = parseInt(m[1], 10);
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

async function getDashboard(period = '30d') {
  try {
    const startDate = parsePeriodToDate(period);

    // 1) Totais de receita e pedidos no período
    const revenueAndOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    const revenueTotals = revenueAndOrders[0] || { totalRevenue: 0, totalOrders: 0 };

    // 2) Este mês x mês passado (para crescimento %)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const thisMonthAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfThisMonth, $lt: startOfNextMonth } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
    ]);
    const lastMonthAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
    ]);

    const thisMonthRevenue = thisMonthAgg[0]?.revenue || 0;
    const lastMonthRevenue = lastMonthAgg[0]?.revenue || 0;
    const revenueGrowth =
      lastMonthRevenue === 0
        ? thisMonthRevenue > 0 ? 100 : 0
        : ((thisMonthRevenue - lastMonthRevenue) / Math.abs(lastMonthRevenue)) * 100;

    const thisMonthOrders = thisMonthAgg[0]?.orders || 0;
    const lastMonthOrders = lastMonthAgg[0]?.orders || 0;
    const ordersGrowth =
      lastMonthOrders === 0
        ? thisMonthOrders > 0 ? 100 : 0
        : ((thisMonthOrders - lastMonthOrders) / Math.abs(lastMonthOrders)) * 100;

    // 3) Clientes únicos (email)
    const uniqueCustomersAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, 'customerInfo.email': { $exists: true, $ne: null } } },
      { $group: { _id: '$customerInfo.email' } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    const customersTotal = uniqueCustomersAgg[0]?.count || 0;

    const customersThisMonthAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfThisMonth, $lt: startOfNextMonth }, 'customerInfo.email': { $exists: true, $ne: null } } },
      { $group: { _id: '$customerInfo.email' } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    const customersLastMonthAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }, 'customerInfo.email': { $exists: true, $ne: null } } },
      { $group: { _id: '$customerInfo.email' } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    const customersThisMonth = customersThisMonthAgg[0]?.count || 0;
    const customersLastMonth = customersLastMonthAgg[0]?.count || 0;
    const customersGrowth =
      customersLastMonth === 0
        ? customersThisMonth > 0 ? 100 : 0
        : ((customersThisMonth - customersLastMonth) / Math.abs(customersLastMonth)) * 100;

    // 4) Produtos populares
    const popularProductsAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, items: { $exists: true } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          orderCount: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: { $toString: '$_id' },
          productName: { $ifNull: ['$product.name', 'Unknown product'] },
          orderCount: 1,
          revenue: 1,
        },
      },
      { $sort: { orderCount: -1, revenue: -1 } },
      { $limit: 10 },
    ]);

    // 5) Receita diária (gráfico)
    const revenueChartAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 6) Distribuição de status de pedidos
    const statusAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const totalOrdersInPeriod = revenueTotals.totalOrders || 0;
    const orderStatusDistribution = statusAgg.map((s) => ({
      status: s._id || 'unknown',
      count: s.count,
      percentage: totalOrdersInPeriod > 0 ? Number(((s.count / totalOrdersInPeriod) * 100).toFixed(1)) : 0,
    }));

    const analytics = {
      revenue: {
        total: Number((revenueTotals.totalRevenue || 0).toFixed(2)),
        thisMonth: Number(thisMonthRevenue.toFixed(2)),
        lastMonth: Number(lastMonthRevenue.toFixed(2)),
        growth: Number(revenueGrowth.toFixed(1)),
      },
      orders: {
        total: Number((revenueTotals.totalOrders || 0)),
        thisMonth: thisMonthOrders,
        lastMonth: lastMonthOrders,
        growth: Number(ordersGrowth.toFixed(1)),
      },
      customers: {
        total: customersTotal,
        thisMonth: customersThisMonth,
        lastMonth: customersLastMonth,
        growth: Number(customersGrowth.toFixed(1)),
      },
      popularProducts: popularProductsAgg.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        orderCount: p.orderCount,
        revenue: Number((p.revenue || 0).toFixed(2)),
      })),
      revenueChart: revenueChartAgg.map((r) => ({ date: r._id, revenue: Number((r.revenue || 0).toFixed(2)) })),
      orderStatusDistribution,
    };

    return { analytics };
  } catch (err) {
    console.error('Analytics service error:', err);
    throw new Error('Failed to compute analytics');
  }
}

module.exports = { getDashboard };


