import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings,
  ChefHat,
  Grid3X3,
  Warehouse,
  ClipboardList,
  TrendingUp,
  ShoppingBag
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const customerNavItems = [
  { name: "Browse Food", href: "/", icon: Home },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "My Orders", href: "/orders", icon: ClipboardList },
]

const adminNavItems = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Categories", href: "/admin/categories", icon: Grid3X3 },
  { name: "Products", href: "/admin/products", icon: ChefHat },
  { name: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { name: "Orders", href: "/admin/orders", icon: ClipboardList },
  { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
]

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const isAdmin = user?.role === 'admin' // Assuming user has role property
  const navItems = isAdmin ? adminNavItems : customerNavItems

  console.log('Sidebar rendered for user role:', user?.role)

  return (
    <div className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 z-40",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        <div className="p-4">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {isAdmin ? "Restaurant Admin" : "AppFood"}
              </h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Package className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}