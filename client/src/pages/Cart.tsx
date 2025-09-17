import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"
import { getCartItems, updateCartItem, removeFromCart, clearCart, Cart as CartType } from "@/api/cart"
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"

export function Cart() {
  const [cart, setCart] = useState<CartType | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)
      console.log('Fetching cart items...')
      const response = await getCartItems()
      setCart(response.cart)
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast({
        title: "Error",
        description: "Failed to load cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setUpdating(itemId)
      console.log('Updating cart item quantity:', { itemId, newQuantity })
      await updateCartItem({ itemId, quantity: newQuantity })
      
      // Update local state
      if (cart) {
        const updatedItems = cart.items.map(item => 
          item._id === itemId 
            ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
            : item
        )
        const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0)
        setCart({ ...cart, items: updatedItems, totalAmount: newTotal })
      }

      toast({
        title: "Success",
        description: "Cart updated successfully!",
      })
    } catch (error) {
      console.error('Error updating cart:', error)
      toast({
        title: "Error",
        description: "Failed to update cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      console.log('Removing item from cart:', itemId)
      await removeFromCart(itemId)
      
      // Update local state
      if (cart) {
        const updatedItems = cart.items.filter(item => item._id !== itemId)
        const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0)
        setCart({ ...cart, items: updatedItems, totalAmount: newTotal })
      }

      toast({
        title: "Success",
        description: "Item removed from cart!",
      })
    } catch (error) {
      console.error('Error removing item:', error)
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClearCart = async () => {
    try {
      console.log('Clearing cart...')
      await clearCart()
      setCart(null)
      toast({
        title: "Success",
        description: "Cart cleared successfully!",
      })
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-6">
          <ShoppingBag className="h-24 w-24 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-500 dark:text-gray-500 mb-6">
          Add some delicious items to get started!
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          Browse Menu
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Shopping Cart
        </h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {cart.items.length} items
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item._id} className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 truncate">
                      {item.productName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Size: {item.size}
                    </p>
                    <p className="text-blue-600 font-semibold">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                      disabled={updating === item._id || item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                      disabled={updating === item._id}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-800 dark:text-gray-200">
                      ${item.total.toFixed(2)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 sticky top-6">
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${cart.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>$3.99</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${(cart.totalAmount * 0.08).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${(cart.totalAmount + 3.99 + cart.totalAmount * 0.08).toFixed(2)}</span>
                </div>
              </div>
              
              <Button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="lg"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}