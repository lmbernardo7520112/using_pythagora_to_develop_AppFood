"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription, // ✅ Import corrigido
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Size {
  name: string;
  price: number;
  stock: number;
  isDefault: boolean;
}

interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  categoryId: string | { _id: string; name: string; description: string };
  sizes: Size[];
  images: string[];
}

interface Category {
  _id: string;
  name: string;
  description: string;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { register, handleSubmit, reset, control, setValue } = useForm<Product>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      sizes: [],
      images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sizes",
  });

  // ✅ Corrigido Textarea (images): mostra array ao editar
  const [imagesText, setImagesText] = useState("");

  useEffect(() => {
    fetch("/api/products").then((res) => res.json()).then(setProducts);
    fetch("/api/categories").then((res) => res.json()).then(setCategories);
  }, []);

  const onSubmit = async (data: Product) => {
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products";

    // ✅ Garante que images seja array vindo do textarea
    data.images = imagesText.split("\n").filter((url) => url.trim());

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    fetch("/api/products").then((res) => res.json()).then(setProducts);
    reset();
    setImagesText("");
    setEditingProduct(null);
    setOpen(false);
  };

  const handleEdit = (product: Product) => {
    reset(product);
    // ✅ Corrigido: converte array para string no textarea
    setImagesText(product.images.join("\n"));
    setEditingProduct(product);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetch("/api/products").then((res) => res.json()).then(setProducts);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { reset(); setEditingProduct(null); setImagesText(""); }}>Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Update the product details below."
                  : "Fill out the form to create a new product."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} />
              </div>
              <div>
                <Label htmlFor="price">Base Price</Label>
                <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} required />
              </div>
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  onValueChange={(value) => setValue("categoryId", value)}
                  value={typeof (editingProduct?.categoryId) === "string" ? editingProduct?.categoryId : (editingProduct?.categoryId as Category)?._id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sizes</Label>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex space-x-2 items-center">
                    <Input placeholder="Size name" {...register(`sizes.${index}.name` as const)} />
                    <Input type="number" step="0.01" placeholder="Price" {...register(`sizes.${index}.price` as const, { valueAsNumber: true })} />
                    <Input type="number" placeholder="Stock" {...register(`sizes.${index}.stock` as const, { valueAsNumber: true })} />
                    <Label>
                      <input type="checkbox" {...register(`sizes.${index}.isDefault` as const)} /> Default
                    </Label>
                    <Button type="button" variant="destructive" onClick={() => remove(index)}>Remove</Button>
                  </div>
                ))}
                <Button type="button" onClick={() => append({ name: "", price: 0, stock: 0, isDefault: false })}>
                  Add Size
                </Button>
              </div>

              <div>
                <Label htmlFor="images">Image URLs (one per line)</Label>
                <Textarea
                  id="images"
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                />
              </div>

              <Button type="submit">{editingProduct ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="border rounded-lg p-4">
            <img src={product.images[0]} alt={product.name} className="w-full h-40 object-cover rounded" />
            <h2 className="text-lg font-bold mt-2">{product.name}</h2>
            <p className="text-sm text-gray-600">{product.description}</p>
            <p className="text-md font-semibold">${product.price.toFixed(2)}</p>
            <p className="text-sm">
              Category: {typeof product.categoryId === "string" ? product.categoryId : product.categoryId.name}
            </p>
            <div className="flex space-x-2 mt-2">
              <Button onClick={() => handleEdit(product)}>Edit</Button>
              <Button variant="destructive" onClick={() => handleDelete(product._id!)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
