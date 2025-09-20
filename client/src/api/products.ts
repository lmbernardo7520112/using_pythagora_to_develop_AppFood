// src/api/products.ts
import api from "./api";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string | { _id: string; name: string; description: string };
  images: string[];
  sizes: {
    name: string;
    price: number;
    isDefault: boolean;
    stock: number;
    _id?: string;
  }[];
  isActive: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsResponse {
  success: boolean;
  products: Product[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface ProductResponse {
  success: boolean;
  product: Product;
}

export const getProducts = async (
  categoryId?: string
): Promise<GetProductsResponse> => {
  try {
    const params = categoryId ? { categoryId } : {};
    const response = await api.get<GetProductsResponse>("/products", {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (err: any) {
    console.error("getProducts error:", err);
    throw new Error(
      err?.response?.data?.message || err?.message || "Erro ao buscar produtos"
    );
  }
};

export const createProduct = async (
  data: Partial<Product>
): Promise<ProductResponse> => {
  try {
    const response = await api.post<ProductResponse>("/products", data, {
      withCredentials: true,
    });
    return response.data;
  } catch (err: any) {
    console.error("createProduct error:", err);
    throw new Error(
      err?.response?.data?.message || err?.message || "Erro ao criar produto"
    );
  }
};

export const updateProduct = async (
  productId: string,
  data: Partial<Product>
): Promise<ProductResponse> => {
  try {
    const response = await api.put<ProductResponse>(`/products/${productId}`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (err: any) {
    console.error("updateProduct error:", err);
    throw new Error(
      err?.response?.data?.message || err?.message || "Erro ao atualizar produto"
    );
  }
};

export const deleteProduct = async (
  productId: string
): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete<{ success: boolean }>(`/products/${productId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (err: any) {
    console.error("deleteProduct error:", err);
    throw new Error(
      err?.response?.data?.message || err?.message || "Erro ao deletar produto"
    );
  }
};

export const toggleProductStatus = async (
  productId: string
): Promise<ProductResponse> => {
  try {
    const response = await api.patch<ProductResponse>(`/products/${productId}/toggle`, null, {
      withCredentials: true,
    });
    return response.data;
  } catch (err: any) {
    console.error("toggleProductStatus error:", err);
    throw new Error(
      err?.response?.data?.message || err?.message || "Erro ao alternar status"
    );
  }
};

