// src/api/categories.ts
import api from "./api";
import { AxiosError } from "axios";

export interface Category {
  _id: string;
  name: string;
  description: string;
  coverImage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ================================
// GET: Buscar todas as categorias
// Endpoint: GET /api/categories
// Response: { categories: Category[] }
// ================================
export const getCategories = async (): Promise<{ categories: Category[] }> => {
  console.log("Fetching categories...");
  try {
    const response = await api.get<{ categories: Category[] }>("/categories");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch categories"
    );
  }
};

// ================================
// POST: Criar nova categoria
// Endpoint: POST /api/categories
// Request: { name, description, coverImage }
// Response: { success: boolean, category: Category }
// ================================
export const createCategory = async (data: {
  name: string;
  description: string;
  coverImage: string;
}) => {
  console.log("Creating category:", data);
  try {
    const response = await api.post<{
      success: boolean;
      category: Category;
    }>("/categories", data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to create category"
    );
  }
};

// ================================
// PUT: Atualizar categoria
// Endpoint: PUT /api/categories/:id
// Request: { name, description, coverImage }
// Response: { success: boolean, category: Category }
// ================================
export const updateCategory = async (
  id: string,
  data: { name: string; description: string; coverImage: string }
) => {
  console.log("Updating category:", id, data);
  try {
    const response = await api.put<{
      success: boolean;
      category: Category;
    }>(`/categories/${id}`, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to update category"
    );
  }
};

// ================================
// DELETE: Remover categoria
// Endpoint: DELETE /api/categories/:id
// Response: { success: boolean, message?: string }
// ================================
export const deleteCategory = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  console.log("Deleting category:", id);
  try {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/categories/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to delete category"
    );
  }
};
