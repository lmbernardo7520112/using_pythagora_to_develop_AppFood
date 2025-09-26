//client/src/components/RecentOrders.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Order } from "@/api/orders"
import { Eye, Clock, CheckCircle, Package, Truck } from "lucide-react"

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />
      case 'preparing':
        return <Package className="h-3 w-3" />
      case 'ready':
        return <CheckCircle className="h-3 w-3" />
      case 'delivered':
        return <Truck className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        No recent orders
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {order.orderNumber.split('-')[1]?.slice(-2) || '00'}
            </div>
            <div>
              <div className="font-medium text-sm">{order.customerName}</div>
              <div className="text-xs text-gray-500">
                {formatTime(order.createdAt)} • ${order.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`text-xs ${getStatusColor(order.status)}`}>
              <span className="flex items-center space-x-1">
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status}</span>
              </span>
            </Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}