import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Category } from "@/api/categories"
import { X } from "lucide-react"

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const selectedCategoryName = categories.find(c => c._id === selectedCategory)?.name

  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-gray-200/50">
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
      
      {selectedCategory && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onCategoryChange("")}
          className="bg-white/80 backdrop-blur-sm border-gray-200/50"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}