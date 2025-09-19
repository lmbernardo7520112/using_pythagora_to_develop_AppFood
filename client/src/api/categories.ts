import api from './api';
import { AxiosError } from 'axios';

export interface Category {
  _id: string;
  name: string;
  description: string;
  coverImage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Description: Get all categories
// Endpoint: GET /api/categories
// Request: {}
// Response: { categories: Category[] }
export const getCategories = async (): Promise<{ categories: Category[] }> => {
  console.log('Fetching categories...');
  try {
    const response = await api.get<{ categories: Category[] }>('/categories');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch categories');
  }
};

// Description: Create a new category
// Endpoint: POST /api/categories
// Request: { name: string, description: string, coverImage: string }
// Response: { success: boolean, category: Category }
export const createCategory = async (data: { name: string; description: string; coverImage: string }) => {
  console.log('Creating category:', data);
  try {
    const response = await api.post<{ success: boolean; category: Category }>('/categories', data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to create category');
  }
};

// Description: Update a category
// Endpoint: PUT /api/categories/:id
// Request: { name: string, description: string, coverImage: string }
// Response: { success: boolean, category: Category }
export const updateCategory = async (id: string, data: { name: string; description: string; coverImage: string }) => {
  console.log('Updating category:', id, data);
  try {
    const response = await api.put<{ success: boolean; category: Category }>(`/categories/${id}`, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to update category');
  }
};

// Description: Delete a category
// Endpoint: DELETE /api/categories/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteCategory = async (id: string) => {
  console.log('Deleting category:', id);
  try {
    const response = await api.delete<{ success: boolean; message: string }>(`/categories/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to delete category');
  }
};