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
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { getProducts as apiGetProducts, createProduct as apiCreateProduct, updateProduct as apiUpdateProduct, deleteProduct as apiDeleteProduct } from "@/api/products";

interface Size {
  name: string;
  price: number;
  stock: number;
  isDefault: boolean;
  _id?: string;
}

interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  categoryId: string | { _id: string; name: string; description: string };
  sizes: Size[];
  images: string[];
  isActive?: boolean;
  featured?: boolean;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, control, setValue } = useForm<Product>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      sizes: [],
      images: [],
      isActive: true,
      featured: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sizes",
  });

  const [imagesText, setImagesText] = useState("");

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);

      // usa as funções do módulo api para garantir credentials: 'include'
      const productsData = await apiGetProducts();
      // productsData tem { success, products }
      setProducts(Array.isArray(productsData.products) ? productsData.products : []);

      // categories endpoint (fetch manual com credentials)
      const catsRes = await fetch("http://localhost:3000/api/categories", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!catsRes.ok) throw new Error(`Failed fetching categories: ${catsRes.status}`);
      const catsJson = await catsRes.json();
      // tentativa de adaptar vários formatos
      const cats = Array.isArray(catsJson) ? catsJson : Array.isArray(catsJson.data) ? catsJson.data : catsJson.categories || [];
      setCategories(cats);
    } catch (err) {
      console.error("loadAll error:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onSubmit = async (formData: Product) => {
    setError(null);
    setSuccessMsg(null);

    // normalize images and sizes
    const payload: any = { ...formData };
    payload.images = imagesText.split("\n").map((s) => s.trim()).filter(Boolean);
    // ensure categoryId is id string (if user picks object somehow)
    payload.categoryId = typeof payload.categoryId === "object" ? (payload.categoryId as any)._id : payload.categoryId;

    try {
      if (editingProduct && editingProduct._id) {
        const res = await apiUpdateProduct(editingProduct._id, payload);
        if (!res || !res.success) throw new Error("Falha ao atualizar produto");
        setSuccessMsg("Produto atualizado com sucesso");
      } else {
        const res = await apiCreateProduct(payload);
        if (!res || !res.success) throw new Error("Falha ao criar produto");
        setSuccessMsg("Produto criado com sucesso");
      }

      await loadAll();
      reset();
      setImagesText("");
      setEditingProduct(null);
      setOpen(false);
    } catch (err: any) {
      console.error("Submit error:", err);
      // tenta extrair mensagem do erro
      const msg = err?.message || "Erro ao salvar produto";
      setError(msg);
    }
  };

  const handleEdit = (product: Product) => {
    // Se categoryId for objeto, setValue para seu _id
    const catId = typeof product.categoryId === "string" ? product.categoryId : (product.categoryId as any)?._id;
    reset({
      ...product,
      categoryId: catId as any,
    } as Product);
    setImagesText(Array.isArray(product.images) ? product.images.join("\n") : "");
    setEditingProduct(product);
    setOpen(true);
    // atualiza select controlled value
    setValue("categoryId", catId as any);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      const res = await apiDeleteProduct(id);
      if (!res || !res.success) throw new Error("Falha ao deletar");
      await loadAll();
      setSuccessMsg("Produto removido");
    } catch (err) {
      console.error("Delete error:", err);
      setError("Erro ao deletar produto");
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>

        <div className="space-x-2">
          {successMsg && <span className="text-green-600 mr-2">{successMsg}</span>}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { reset(); setEditingProduct(null); setImagesText(""); }}>Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update the product details below." : "Fill out the form to create a new product."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register("name", { required: true })} />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register("description")} />
                </div>

                <div>
                  <Label htmlFor="price">Base Price</Label>
                  <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
                </div>

                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    onValueChange={(value) => setValue("categoryId", value)}
                    value={String((editingProduct && typeof editingProduct.categoryId === "string") ? editingProduct.categoryId : (editingProduct && (editingProduct.categoryId as any)?._id) || ( (control as any)._defaultValues?.categoryId ?? "" ) )}
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
                    <div key={field.id} className="flex space-x-2 items-center mb-2">
                      <Input placeholder="Size name" {...register(`sizes.${index}.name` as const)} />
                      <Input type="number" step="0.01" placeholder="Price" {...register(`sizes.${index}.price` as const, { valueAsNumber: true })} />
                      <Input type="number" placeholder="Stock" {...register(`sizes.${index}.stock` as const, { valueAsNumber: true })} />
                      <Label className="flex items-center space-x-1">
                        <input type="checkbox" {...register(`sizes.${index}.isDefault` as const)} /> <span>Default</span>
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
                  <Textarea id="images" value={imagesText} onChange={(e) => setImagesText(e.target.value)} />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit">{editingProduct ? "Update" : "Create"}</Button>
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); setEditingProduct(null); setImagesText(""); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="border rounded-lg p-4">
              <img src={product.images?.[0] || "https://via.placeholder.com/400?text=No+Image"} alt={product.name} className="w-full h-40 object-cover rounded" />
              <h2 className="text-lg font-bold mt-2">{product.name}</h2>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-md font-semibold">${(product.price ?? 0).toFixed(2)}</p>
              <p className="text-sm">
                Category: {typeof product.categoryId === "string" ? product.categoryId : (product.categoryId as any)?.name}
              </p>
              <div className="flex space-x-2 mt-2">
                <Button onClick={() => handleEdit(product)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(product._id)}>Delete</Button>
              </div>
            </div>
          ))
        ) : (
          <p>Nenhum produto encontrado.</p>
        )}
      </div>
    </div>
  );
}

export default Products;
