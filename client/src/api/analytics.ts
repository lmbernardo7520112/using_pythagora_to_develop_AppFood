// api/analytics.ts
import api from "./api";

export interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    thisMonth: number;
  };
  orders: {
    total: number;
    growth: number;
    thisMonth: number;
  };
  customers: {
    total: number;
    growth: number;
    thisMonth: number;
  };
  popularProducts: {
    productId: string;
    productName: string;
    orderCount: number;
    revenue: number;
  }[];
  orderStatusDistribution: {
    status: string;
    count: number;
    percentage: string;
  }[];
  revenueChart: {
    date: string;
    revenue: number;
  }[];
}

export const getAnalytics = async (period: string) => {
  const res = await api.get("/analytics/dashboard", { params: { period } });
  return res.data; // { success: true, analytics }
};
