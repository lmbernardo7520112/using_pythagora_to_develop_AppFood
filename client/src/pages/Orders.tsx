import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/useToast"
import { getOrders, updateOrderStatus, Order } from "@/api/orders"
import { Clock, CheckCircle, Package, Truck, Eye, Phone, MapPin } from "lucide-react"

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log('Fetching orders with status filter:', statusFilter)
      const params = statusFilter ? { status: statusFilter } : {}
      const response = await getOrders(params)
      setOrders(response.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      console.log('Updating order status:', { orderId, newStatus })
      await updateOrderStatus(orderId, newStatus)
      toast({
        title: "Success",
        description: "Order status updated successfully!",
      })
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
      case 'preparing':
        return <Package className="h-4 w-4" />
      case 'ready':
        return <CheckCircle className="h-4 w-4" />
      case 'delivered':
        return <Truck className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'confirmed':
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'ready':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'confirmed'
      case 'confirmed':
        return 'preparing'
      case 'preparing':
        return 'ready'
      case 'ready':
        return 'delivered'
      default:
        return null
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Orders Management
        </h1>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-sm">
            {orders.length} orders
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order._id} className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">#{order.orderNumber}</CardTitle>
                <Badge className={`${getStatusColor(order.status)}`}>
                  <span className="flex items-center space-x-1">
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </span>
                </Badge>
              </div>
              <CardDescription>
                {order.customerName} • {formatTime(order.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Items:</strong>
                </div>
                {order.items.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.productName} ({item.size})</span>
                    <span>${item.total.toFixed(2)}</span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <div className="text-sm text-gray-500">
                    +{order.items.length - 2} more items
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-lg font-bold text-blue-600">
                  ${order.totalAmount.toFixed(2)}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowDialog(true)
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  {getNextStatus(order.status) && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status)!)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Mark {getNextStatus(order.status)}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder && formatTime(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <strong>{selectedOrder.customerName}</strong>
                    </div>
                    <div className="text-sm text-gray-600">{selectedOrder.customerEmail}</div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{selectedOrder.deliveryAddress.phone}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-2 text-sm">
                      <MapPin className="h-3 w-3 mt-1 flex-shrink-0" />
                      <div>
                        <div>{selectedOrder.deliveryAddress.street}</div>
                        <div>
                          {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.productName}</div>
                          <div className="text-xs text-gray-500">
                            Size: {item.size} • Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${item.total.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">${item.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-3 border-t font-bold">
                    <span>Total Amount:</span>
                    <span className="text-lg text-blue-600">${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Status Update */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Current Status:</span>
                  <Badge className={`${getStatusColor(selectedOrder.status)}`}>
                    <span className="flex items-center space-x-1">
                      {getStatusIcon(selectedOrder.status)}
                      <span className="capitalize">{selectedOrder.status}</span>
                    </span>
                  </Badge>
                </div>
                {getNextStatus(selectedOrder.status) && (
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedOrder._id, getNextStatus(selectedOrder.status)!)
                      setShowDialog(false)
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Mark as {getNextStatus(selectedOrder.status)}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-6">
            <Package className="h-24 w-24 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
            No orders found
          </h2>
          <p className="text-gray-500 dark:text-gray-500">
            {statusFilter ? `No orders with status "${statusFilter}"` : 'No orders have been placed yet'}
          </p>
        </div>
      )}
    </div>
  )
}