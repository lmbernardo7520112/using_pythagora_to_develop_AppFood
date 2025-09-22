import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/useToast"
import { getAnalytics, AnalyticsData } from "@/api/analytics"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { AnalyticsChart } from "@/components/AnalyticsChart"

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      console.log('Fetching analytics data for period:', period)
      const response = await getAnalytics(period)
      setAnalytics(response.analytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: "Error",
        description: "Failed to load analytics. Please try again.",
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
          Failed to load analytics data
        </h2>
        <p className="text-gray-500 dark:text-gray-500">
          Please refresh the page to try again.
        </p>
      </div>
    )
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(analytics.revenue.total),
      change: analytics.revenue.growth,
      icon: DollarSign,
      description: `${formatCurrency(analytics.revenue.thisMonth)} this month`
    },
    {
      title: "Total Orders",
      value: analytics.orders.total.toLocaleString(),
      change: analytics.orders.growth,
      icon: ShoppingCart,
      description: `${analytics.orders.thisMonth} this month`
    },
    {
      title: "Total Customers",
      value: analytics.customers.total.toLocaleString(),
      change: analytics.customers.growth,
      icon: Users,
      description: `${analytics.customers.thisMonth} this month`
    },
    {
      title: "Popular Products",
      value: analytics.popularProducts.length.toString(),
      change: 0,
      icon: Package,
      description: "Top selling items"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Analytics Dashboard
        </h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
          </SelectContent>
        </Select>
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
                <div className="flex items-center space-x-1 text-xs mt-1">
                  {stat.change > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.change > 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-gray-500">vs last period</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={analytics.revenueChart} />
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Current order status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.orderStatusDistribution.map((status) => (
                <div key={status.status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{status.status}</span>
                    <span>{status.count} orders ({status.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${status.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Products */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <CardTitle>Popular Products</CardTitle>
          <CardDescription>Top selling items for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.popularProducts.map((product, index) => (
              <div key={product.productId} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{product.productName}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Orders:</span>
                    <span className="font-medium">{product.orderCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
