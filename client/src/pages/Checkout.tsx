// client/src/pages/Checkout.tsx

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"
import { getCartItems, Cart } from "@/api/cart"
import { createOrder } from "@/api/orders"
import { useForm } from "react-hook-form"
import { CreditCard, MapPin, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface CheckoutFormData {
  name: string
  email: string
  street: string
  city: string
  state: string
  zipCode: string
  phone: string
}

export function Checkout() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { currentUser, isAuthenticated } = useAuth()

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>()

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to proceed with checkout.",
        variant: "destructive",
      })
      navigate('/login')
      return
    }
    fetchCart()
  }, [isAuthenticated, currentUser])

  const fetchCart = async () => {
    try {
      setLoading(true)
      console.log('Fetching cart for checkout...', { userId: currentUser?._id })
      const response = await getCartItems()

      if (!response.cart || !response.cart.items || response.cart.items.length === 0) {
        toast({
          title: "Empty Cart",
          description: "Your cart is empty. Add some items before checkout.",
          variant: "destructive",
        })
        navigate('/cart')
        return
      }

      // Normalização robusta: prioriza totalPrice, fallback para unit * qty
      const normalizedCart: Cart = {
        ...response.cart,
        items: response.cart.items.map((item) => {
          const unit = Number(item.unitPrice ?? 0)
          const qty = Number(item.quantity ?? 0)
          const total = Number(item.totalPrice ?? unit * qty)
          return {
            ...item,
            unitPrice: unit,
            quantity: qty,
            totalPrice: total,
          }
        }),
        totalAmount: Number(
          response.cart.totalAmount ??
          response.cart.items.reduce(
            (sum, i) => sum + (i.totalPrice ?? (Number(i.unitPrice ?? 0) * Number(i.quantity ?? 0))),
            0
          )
        )
      }

      setCart(normalizedCart)
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast({
        title: "Error",
        description: "Failed to load cart. Please try again.",
        variant: "destructive",
      })
      navigate('/cart')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cart || !currentUser) return

    try {
      setSubmitting(true)
      console.log('Submitting order:', {
        userId: currentUser._id,
        customerInfo: data,
        deliveryAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        },
        paymentMethod: 'cash'
      })

      // Payload: usa userId para autenticados
      const orderData = {
        userId: currentUser._id,
        customerInfo: {
          name: data.name,
          email: data.email,
          phone: data.phone,
        },
        deliveryAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        paymentMethod: "cash",
      }

      const response = await createOrder(orderData)
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${response.order.orderNumber} has been placed.`,
      })

      navigate('/orders')
    } catch (error: any) {
      console.error('Error placing order:', error)
      const errorMessage = error.response?.data?.message || 'Failed to place order. Please try again.'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!cart || !currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading cart or authentication required...</p>
      </div>
    )
  }

  const subtotal = Number(cart.totalAmount ?? 0)
  const deliveryFee = 3.99
  const tax = subtotal * 0.08
  const total = subtotal + deliveryFee + tax

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/cart')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Cart</span>
        </Button>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Delivery Information</span>
              </CardTitle>
              <CardDescription>
                Please provide your contact and delivery details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Full name is required' })}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    {...register('street', { required: 'Street address is required' })}
                    placeholder="123 Main Street"
                  />
                  {errors.street && (
                    <p className="text-sm text-red-500 mt-1">{errors.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register('city', { required: 'City is required' })}
                      placeholder="New York"
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...register('state', { required: 'State is required' })}
                      placeholder="NY"
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      {...register('zipCode', { required: 'ZIP code is required' })}
                      placeholder="10001"
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-red-500 mt-1">{errors.zipCode.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...register('phone', { required: 'Phone number is required' })}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !isAuthenticated || !currentUser}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  size="lg"
                >
                  {submitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Placing Order...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Place Order - ${total.toFixed(2)}</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Review your items before placing the order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.productName}</div>
                      <div className="text-xs text-gray-500">
                        {item.sizeName ?? item.sizeId} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        ${(item.totalPrice ?? item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Method</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment will be collected upon delivery
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Cash only
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}