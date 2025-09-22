// src/api/analytics.ts
import api from "./api";

export interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth?: number;
    growth: number;
  };
  orders: {
    total: number;
    thisMonth: number;
    lastMonth?: number;
    growth: number;
  };
  customers: {
    total: number;
    thisMonth: number;
    lastMonth?: number;
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

/**
 * Fetch analytics dashboard data from backend.
 */
export const getAnalytics = async (
  period: string = "30d"
): Promise<{ analytics: AnalyticsData }> => {
  try {
    // ✅ Remove o '/api' duplicado
    const res = await api.get("/analytics/dashboard", { params: { period } });

    if (res?.data?.analytics) {
      return { analytics: res.data.analytics as AnalyticsData };
    }

    if (res?.data && typeof res.data === "object") {
      const maybe = res.data as AnalyticsData;
      if (maybe.revenue && maybe.orders) {
        return { analytics: maybe };
      }
      if ((res.data.data && res.data.data.revenue) || (res.data.payload && res.data.payload.revenue)) {
        const candidate = (res.data.data || res.data.payload) as AnalyticsData;
        return { analytics: candidate };
      }
    }

    throw new Error("Unexpected analytics response shape");
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to fetch analytics";
    throw new Error(message);
  }
};

/**
 * Fetch recent orders from backend.
 */
export const getRecentOrders = async (limit = 5): Promise<any[]> => {
  try {
    const res = await api.get("/analytics/recent", { params: { limit } });

    if (!res || res.status >= 400) return [];

    if (Array.isArray(res.data)) return res.data;
    if (res?.data?.orders && Array.isArray(res.data.orders)) return res.data.orders;
    if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
    if (res?.data?.payload && Array.isArray(res.data.payload)) return res.data.payload;
    if (res?.data?.success && Array.isArray(res.data.orders)) return res.data.orders;

    if (res?.data && typeof res.data === "object") {
      const maybeOrder = res.data;
      if (maybeOrder._id || maybeOrder.orderNumber) return [maybeOrder];
    }

    return [];
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to fetch recent orders";
    throw new Error(message);
  }
};
