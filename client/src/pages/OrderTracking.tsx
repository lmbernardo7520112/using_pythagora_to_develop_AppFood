import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/useToast"
import { getOrders, Order } from "@/api/orders"
import { Clock, CheckCircle, Package, Truck, MapPin, Phone, RotateCcw } from "lucide-react"

export function OrderTracking() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log("Fetching user orders...")
      const response = await getOrders()
      setOrders(response.orders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
      case "preparing":
        return <Package className="h-4 w-4" />
      case "ready":
        return <CheckCircle className="h-4 w-4" />
      case "delivered":
        return <Truck className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      case "confirmed":
      case "preparing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "ready":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { key: "pending", label: "Order Placed", icon: Clock },
      { key: "confirmed", label: "Confirmed", icon: CheckCircle },
      { key: "preparing", label: "Preparing", icon: Package },
      { key: "ready", label: "Ready", icon: CheckCircle },
      { key: "delivered", label: "Delivered", icon: Truck },
    ]

    const statusOrder = ["pending", "confirmed", "preparing", "ready", "delivered"]
    const currentIndex = statusOrder.indexOf(currentStatus)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }))
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getEstimatedDelivery = (createdAt: string, status: string) => {
    const orderTime = new Date(createdAt)
    let estimatedMinutes = 45 // Default estimation

    switch (status) {
      case "pending":
        estimatedMinutes = 45
        break
      case "confirmed":
        estimatedMinutes = 35
        break
      case "preparing":
        estimatedMinutes = 25
        break
      case "ready":
        estimatedMinutes = 15
        break
      case "delivered":
        return "Delivered"
      default:
        estimatedMinutes = 45
    }

    const estimatedTime = new Date(orderTime.getTime() + estimatedMinutes * 60000)
    return estimatedTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">My Orders</h1>
        <Button
          variant="outline"
          onClick={fetchOrders}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-6">
            <Package className="h-24 w-24 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
            No orders yet
          </h2>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            Place your first order to start tracking your deliveries
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Browse Menu
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card
              key={order._id}
              className="bg-white/80 backdrop-blur-sm border-gray-200/50"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Order #{order.orderNumber}</CardTitle>
                    <CardDescription>
                      Placed on {formatDateTime(order.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(order.status)} mb-2`}>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </Badge>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Est. delivery: {getEstimatedDelivery(order.createdAt, order.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Progress */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Order Progress</h4>
                  <div className="flex items-center justify-between">
                    {getStatusSteps(order.status).map((step, index) => (
                      <div
                        key={step.key}
                        className="flex flex-col items-center space-y-2"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                          }`}
                        >
                          <step.icon className="h-4 w-4" />
                        </div>
                        <div className="text-xs text-center">
                          <div
                            className={`font-medium ${
                              step.completed ? "text-blue-600" : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </div>
                        </div>
                        {index < getStatusSteps(order.status).length - 1 && (
                          <div
                            className={`absolute h-0.5 w-16 mt-5 ${
                              step.completed
                                ? "bg-blue-500"
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                            style={{ left: `${index * 25 + 12.5}%` }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                        >
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.productName}</div>
                            <div className="text-xs text-gray-500">
                              {item.size} • Qty: {item.quantity}
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            ${((item.total !== undefined ? item.total : item.price * item.quantity) ?? 0).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        ${(order.totalAmount ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Delivery Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2 text-sm">
                        <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                        <div>
                          <div>{order.deliveryAddress.street}</div>
                          <div className="text-gray-500">
                            {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{order.deliveryAddress.phone}</span>
                      </div>
                    </div>

                    {order.status === "ready" && (
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Your order is ready for pickup!
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                          Our delivery driver will be with you shortly.
                        </div>
                      </div>
                    )}

                    {order.status === "delivered" && (
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="text-sm font-medium text-green-800 dark:text-green-200">
                          Order delivered successfully!
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-300 mt-1">
                          Thank you for choosing AppFood.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
