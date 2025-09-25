//client/src/components/ProductCard.tsx
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Product } from "@/api/products"
import { Plus, Minus, ShoppingCart, Star, Eye } from "lucide-react"

interface ProductCardProps {
  product: Product
  // ✅ CORREÇÃO: Mudança na assinatura para incluir sizeId
  onAddToCart: (productId: string, sizeName: string, sizeId: string | null, quantity: number) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // ✅ CORREÇÃO: Inicializar com primeiro tamanho disponível
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]?.name || "")
  const [quantity, setQuantity] = useState(1)
  const [showDetails, setShowDetails] = useState(false)

  // ✅ CORREÇÃO: Buscar dados completos do tamanho selecionado
  const selectedSizeData = product.sizes.find(size => size.name === selectedSize)
  const totalPrice = selectedSizeData ? selectedSizeData.price * quantity : 0

  const handleAddToCart = () => {
    if (selectedSize && selectedSizeData) {
      // ✅ CORREÇÃO: Enviar sizeId junto com sizeName
      const sizeId = (selectedSizeData as any)._id || null
      onAddToCart(product._id, selectedSize, sizeId, quantity)
      setQuantity(1)
    }
  }

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-gray-200/50 hover:scale-105">
        <CardContent className="p-0">
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img
              src={product.images[0] || 'https://via.placeholder.com/400?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400?text=Fallback'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-2 right-2">
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? "Available" : "Unavailable"}
              </Badge>
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={() => setShowDetails(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 line-clamp-1">
                {product.name}
              </h3>
              <div className="flex items-center space-x-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm text-gray-600">4.5</span>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
            
            <div className="space-y-3">
              {product.sizes.length > 1 && (
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size.name} value={size.name}>
                        {size.name} - ${size.price.toFixed(2)}
                        {/* ✅ MELHORIA: Mostrar estoque disponível */}
                        {size.stock !== undefined && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({size.stock} available)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      // ✅ MELHORIA: Verificar estoque antes de aumentar
                      const maxQuantity = selectedSizeData?.stock || 999
                      setQuantity(Math.min(maxQuantity, quantity + 1))
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    ${totalPrice.toFixed(2)}
                  </div>
                  {/* ✅ MELHORIA: Mostrar preço unitário se diferente */}
                  {quantity > 1 && (
                    <div className="text-xs text-gray-500">
                      ${selectedSizeData?.price.toFixed(2)} each
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={
                  !product.isActive || 
                  !selectedSizeData || 
                  (selectedSizeData.stock !== undefined && selectedSizeData.stock < quantity)
                }
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {!selectedSizeData 
                  ? "Select Size"
                  : selectedSizeData.stock !== undefined && selectedSizeData.stock < quantity
                  ? "Not Enough Stock"
                  : "Add to Cart"
                }
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-2xl">{product.name}</DialogTitle>
            <DialogDescription>{product.description}</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={product.images[0] || 'https://via.placeholder.com/400?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400?text=Fallback'
                  }}
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {product.images.slice(1, 4).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${product.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400?text=Fallback'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Available Sizes</h4>
                <div className="space-y-2">
                  {product.sizes.map((size) => (
                    <div key={size.name} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span>{size.name}</span>
                      <div className="text-right">
                        <div className="font-semibold">${size.price.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          {/* ✅ MELHORIA: Mostrar estoque real */}
                          {size.stock !== undefined 
                            ? `${size.stock} available`
                            : "Available"
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                {product.sizes.length > 1 && (
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size.name} value={size.name}>
                          {size.name} - ${size.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const maxQuantity = selectedSizeData?.stock || 999
                        setQuantity(Math.min(maxQuantity, quantity + 1))
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">
                      ${totalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => {
                    handleAddToCart()
                    setShowDetails(false)
                  }}
                  disabled={
                    !product.isActive || 
                    !selectedSizeData ||
                    (selectedSizeData.stock !== undefined && selectedSizeData.stock < quantity)
                  }
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}