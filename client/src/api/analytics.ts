import api from './api';

export interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  orders: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  customers: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  popularProducts: {
    productId: string;
    productName: string;
    orderCount: number;
    revenue: number;
  }[];
  revenueChart: {
    date: string;
    revenue: number;
  }[];
  orderStatusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

// Description: Get analytics dashboard data
// Endpoint: GET /api/analytics/dashboard
// Request: { period?: string }
// Response: { analytics: AnalyticsData }
export const getAnalytics = async (period: string = '30d') => {
  console.log('Fetching analytics data for period:', period)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        analytics: {
          revenue: {
            total: 15420.50,
            thisMonth: 8750.25,
            lastMonth: 6670.25,
            growth: 31.2
          },
          orders: {
            total: 342,
            thisMonth: 198,
            lastMonth: 144,
            growth: 37.5
          },
          customers: {
            total: 156,
            thisMonth: 89,
            lastMonth: 67,
            growth: 32.8
          },
          popularProducts: [
            {
              productId: '1',
              productName: 'Margherita Pizza',
              orderCount: 45,
              revenue: 764.55
            },
            {
              productId: '2',
              productName: 'Caesar Salad',
              orderCount: 32,
              revenue: 287.68
            },
            {
              productId: '3',
              productName: 'Chocolate Cake',
              orderCount: 28,
              revenue: 195.72
            },
            {
              productId: '4',
              productName: 'Fresh Orange Juice',
              orderCount: 56,
              revenue: 279.44
            }
          ],
          revenueChart: [
            { date: '2024-01-01', revenue: 450.25 },
            { date: '2024-01-02', revenue: 520.75 },
            { date: '2024-01-03', revenue: 380.50 },
            { date: '2024-01-04', revenue: 620.25 },
            { date: '2024-01-05', revenue: 750.00 },
            { date: '2024-01-06', revenue: 890.25 },
            { date: '2024-01-07', revenue: 1020.50 }
          ],
          orderStatusDistribution: [
            { status: 'delivered', count: 245, percentage: 71.6 },
            { status: 'preparing', count: 42, percentage: 12.3 },
            { status: 'ready', count: 28, percentage: 8.2 },
            { status: 'pending', count: 18, percentage: 5.3 },
            { status: 'cancelled', count: 9, percentage: 2.6 }
          ]
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/analytics/dashboard', { params: { period } });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Get inventory analytics
// Endpoint: GET /api/analytics/inventory
// Request: {}
// Response: { inventory: Array }
export const getInventoryAnalytics = async () => {
  console.log('Fetching inventory analytics...')
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        inventory: [
          {
            productId: '1',
            productName: 'Margherita Pizza',
            totalStock: 23,
            lowStockAlert: true,
            sizes: [
              { name: 'Small', stock: 10, status: 'good' },
              { name: 'Medium', stock: 8, status: 'good' },
              { name: 'Large', stock: 5, status: 'low' }
            ]
          },
          {
            productId: '2',
            productName: 'Caesar Salad',
            totalStock: 15,
            lowStockAlert: false,
            sizes: [
              { name: 'Regular', stock: 15, status: 'good' }
            ]
          },
          {
            productId: '3',
            productName: 'Chocolate Cake',
            totalStock: 15,
            lowStockAlert: false,
            sizes: [
              { name: 'Slice', stock: 12, status: 'good' },
              { name: 'Whole Cake', stock: 3, status: 'low' }
            ]
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/analytics/inventory');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}