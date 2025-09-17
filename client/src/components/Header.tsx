import { Bell, LogOut, ShoppingCart, User } from "lucide-react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./ui/theme-toggle"
import { Badge } from "./ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { getCartItems } from "@/api/cart"

export function Header() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await getCartItems()
        setCartItemCount(response.items?.length || 0)
      } catch (error) {
        console.error('Error fetching cart items:', error)
      }
    }

    if (user?.role !== 'admin') {
      fetchCartItems()
    }
  }, [user])

  const handleLogout = () => {
    console.log('User logging out')
    logout()
    navigate("/login")
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate("/")}
          >
            AppFood
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user?.role !== 'admin' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          )}
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <ThemeToggle />
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.name || 'User'}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="hover:bg-red-100 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}