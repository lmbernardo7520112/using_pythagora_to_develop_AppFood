import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/useToast"
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from "@/api/categories"
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react"
import { useForm } from "react-hook-form"

interface CategoryFormData {
  name: string
  description: string
  coverImage: string
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryFormData>()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      console.log('Fetching categories...')
      const response = await getCategories()
      setCategories(response.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CategoryFormData) => {
    try {
      console.log('Submitting category form:', data)
      
      if (editingCategory) {
        await updateCategory(editingCategory._id, data)
        toast({
          title: "Success",
          description: "Category updated successfully!",
        })
      } else {
        await createCategory(data)
        toast({
          title: "Success",
          description: "Category created successfully!",
        })
      }

      setShowDialog(false)
      setEditingCategory(null)
      reset()
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setValue('name', category.name)
    setValue('description', category.description)
    setValue('coverImage', category.coverImage)
    setShowDialog(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      console.log('Deleting category:', categoryId)
      await deleteCategory(categoryId)
      toast({
        title: "Success",
        description: "Category deleted successfully!",
      })
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    setShowDialog(false)
    setEditingCategory(null)
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
          Categories Management
        </h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update category information' : 'Add a new food category to your menu'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Category name is required' })}
                  placeholder="e.g., Appetizers, Main Courses"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Brief description of this category"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  {...register('coverImage', { required: 'Cover image URL is required' })}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.coverImage && (
                  <p className="text-sm text-red-500 mt-1">{errors.coverImage.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category._id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardContent className="p-0">
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img
                  src={category.coverImage}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-2 right-2">
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <p className="text-sm opacity-90 line-clamp-2">{category.description}</p>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Created: {new Date(category.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(category)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(category._id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-6">
            <ImageIcon className="h-24 w-24 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
            No categories yet
          </h2>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            Create your first category to start organizing your menu
          </p>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      )}
    </div>
  )
}