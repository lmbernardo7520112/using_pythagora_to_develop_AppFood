import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/useToast"
import { getProducts, createProduct, updateProduct, deleteProduct, toggleProductStatus, Product } from "@/api/products"
import { getCategories, Category } from "@/api/categories"
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"

interface ProductFormData {
  name: string
  description: string
  basePrice: number
  categoryId: string
  images: string[]
  sizes: { name: string; price: number; stock: number }[]
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const { toast } = useToast()
  const { register, handleSubmit, reset, setValue, control, watch, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      sizes: [{ name: 'Regular', price: 0, stock: 0 }]
    }
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sizes"
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('Fetching products and categories...')
      const [categoriesResponse] = await Promise.all([
        getCategories()
      ])
      setCategories(categoriesResponse.categories)
      await fetchProducts()
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await getProducts(selectedCategory)
      setProducts(response.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      console.log('Submitting product form:', data)
      
      if (editingProduct) {
        await updateProduct(editingProduct._id, data)
        toast({
          title: "Success",
          description: "Product updated successfully!",
        })
      } else {
        await createProduct(data)
        toast({
          title: "Success",
          description: "Product created successfully!",
        })
      }

      setShowDialog(false)
      setEditingProduct(null)
      reset()
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setValue('name', product.name)
    setValue('description', product.description)
    setValue('basePrice', product.basePrice)
    setValue('categoryId', product.categoryId)
    setValue('images', product.images)
    setValue('sizes', product.sizes)
    setShowDialog(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      console.log('Deleting product:', productId)
      await deleteProduct(productId)
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      })
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (productId: string) => {
    try {
      console.log('Toggling product status:', productId)
      await toggleProductStatus(productId)
      toast({
        title: "Success",
        description: "Product status updated successfully!",
      })
      fetchProducts()
    } catch (error) {
      console.error('Error toggling product status:', error)
      toast({
        title: "Error",
        description: "Failed to update product status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    setShowDialog(false)
    setEditingProduct(null)
    reset()
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
          Products Management
        </h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Update product information' : 'Add a new product to your menu'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Product name is required' })}
                      placeholder="e.g., Margherita Pizza"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="categoryId">Category</Label>
                    <Select onValueChange={(value) => setValue('categoryId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p className="text-sm text-red-500 mt-1">Category is required</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description', { required: 'Description is required' })}
                    placeholder="Detailed description of the product"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    {...register('basePrice', { 
                      required: 'Base price is required',
                      min: { value: 0.01, message: 'Price must be greater than 0' }
                    })}
                    placeholder="0.00"
                  />
                  {errors.basePrice && (
                    <p className="text-sm text-red-500 mt-1">{errors.basePrice.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="images">Image URLs (one per line)</Label>
                  <Textarea
                    id="images"
                    {...register('images')}
                    placeholder="https://example.com/image1.jpg"
                    rows={3}
                    onChange={(e) => {
                      const urls = e.target.value.split('\n').filter(url => url.trim())
                      setValue('images', urls)
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Sizes & Pricing</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ name: '', price: 0, stock: 0 })}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Size
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-4 gap-2 items-end">
                        <div>
                          <Label className="text-xs">Size Name</Label>
                          <Input
                            {...register(`sizes.${index}.name`, { required: true })}
                            placeholder="Small, Medium, Large"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`sizes.${index}.price`, { required: true, min: 0.01 })}
                            placeholder="0.00"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Stock</Label>
                          <Input
                            type="number"
                            {...register(`sizes.${index}.stock`, { required: true, min: 0 })}
                            placeholder="0"
                            className="text-sm"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    {editingProduct ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product._id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardContent className="p-0">
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img
                  src={product.coverImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold line-clamp-1">{product.name}</h3>
                  <p className="text-sm opacity-90 line-clamp-2">{product.description}</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      ${product.basePrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.categoryName || 'No Category'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {product.sizes.length} size{product.sizes.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      Total stock: {product.sizes.reduce((sum, size) => sum + size.stock, 0)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleStatus(product._id)}
                      className="h-8 w-8"
                    >
                      {product.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(product)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(product._id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(product.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-6">
            <Package className="h-24 w-24 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
            No products yet
          </h2>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            Create your first product to start building your menu
          </p>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      )}
    </div>
  )
}