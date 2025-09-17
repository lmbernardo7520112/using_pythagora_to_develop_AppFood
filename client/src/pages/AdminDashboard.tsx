import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import { getAnalytics, AnalyticsData } from "@/api/analytics"
import { getOrders } from "@/api/orders"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  CheckCircle
} from "lucide-react"
import { AnalyticsChart } from "@/components/AnalyticsChart"
import { RecentOrders } from "@/components/RecentOrders"

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('Fetching admin dashboard data...')

      const [analyticsResponse, ordersResponse] = await Promise.all([
        getAnalytics('30d'),
        getOrders({ limit: 5 })
      ])

      setAnalytics(analyticsResponse.analytics)
      setRecentOrders(ordersResponse.orders)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
          Failed to load dashboard data
        </h2>
        <p className="text-gray-500 dark:text-gray-500">
          Please refresh the page to try again.
        </p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${analytics.revenue.total.toLocaleString()}`,
      change: analytics.revenue.growth,
      icon: DollarSign,
      description: "This month vs last month"
    },
    {
      title: "Total Orders",
      value: analytics.orders.total.toLocaleString(),
      change: analytics.orders.growth,
      icon: ShoppingCart,
      description: "This month vs last month"
    },
    {
      title: "Total Customers",
      value: analytics.customers.total.toLocaleString(),
      change: analytics.customers.growth,
      icon: Users,
      description: "This month vs last month"
    },
    {
      title: "Active Products",
      value: analytics.popularProducts.length.toString(),
      change: 0,
      icon: Package,
      description: "Currently available"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Restaurant Dashboard
        </h1>
        <Badge variant="secondary" className="text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {stat.value}
              </div>
              {stat.change !== 0 && (
                <div className="flex items-center space-x-1 text-xs">
                  {stat.change > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.change > 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-gray-500">{stat.description}</span>
                </div>
              )}
              {stat.change === 0 && (
                <p className="text-xs text-gray-500">{stat.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={analytics.revenueChart} />
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Current order distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.orderStatusDistribution.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {status.status === 'delivered' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {status.status === 'preparing' && <Clock className="h-4 w-4 text-yellow-500" />}
                    {status.status === 'ready' && <Package className="h-4 w-4 text-blue-500" />}
                    {status.status === 'pending' && <Clock className="h-4 w-4 text-gray-500" />}
                    {status.status === 'cancelled' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    <span className="capitalize text-sm font-medium">
                      {status.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{status.count}</span>
                    <Badge variant="secondary" className="text-xs">
                      {status.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Products */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
            <CardDescription>Top selling items this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.popularProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{product.productName}</div>
                      <div className="text-xs text-gray-500">{product.orderCount} orders</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">${product.revenue.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders orders={recentOrders} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}