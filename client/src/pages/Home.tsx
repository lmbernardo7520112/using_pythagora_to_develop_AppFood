import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/useToast"
import { getCategories, Category } from "@/api/categories"
import { getProducts, Product } from "@/api/products"
import { addToCart } from "@/api/cart"
import { Search, Clock, Utensils, Star } from "lucide-react"
import { ProductCard } from "@/components/ProductCard"
import { CategoryFilter } from "@/components/CategoryFilter"

export function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, selectedCategory, searchQuery])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log("Fetching home page data...")

      const [categoriesResponse, productsResponse] = await Promise.all([
        getCategories(),
        getProducts()
      ])

      setCategories(categoriesResponse.categories)
      setProducts(productsResponse.products)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Filtra por categoria, mas só se não for "all"
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(product => String(product.categoryId) === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }

  const handleAddToCart = async (productId: string, size: string, quantity: number) => {
    try {
      console.log("Adding to cart:", { productId, size, quantity })
      await addToCart({ productId, size, quantity })
      toast({
        title: "Success",
        description: "Item added to cart successfully!",
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">Welcome to AppFood</h1>
          <p className="text-xl mb-6 opacity-90">
            Discover delicious meals from your favorite restaurants
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <Utensils className="h-4 w-4" />
              <span>Fresh Food</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Top Rated</span>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search for food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200/50"
          />
        </div>
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Categories Grid */}
      {selectedCategory === "all" && !searchQuery && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
            Browse Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card
                key={category._id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-gray-200/50 hover:scale-105"
                onClick={() => setSelectedCategory(category._id)}
              >
                <CardContent className="p-0">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={category.coverImage}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {selectedCategory !== "all"
              ? `${categories.find(c => c._id === selectedCategory)?.name || "Category"} Items`
              : searchQuery
              ? `Search Results for "${searchQuery}"`
              : "All Items"
            }
          </h2>
          <Badge variant="secondary" className="text-sm">
            {filteredProducts.length} items
          </Badge>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              No items found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
