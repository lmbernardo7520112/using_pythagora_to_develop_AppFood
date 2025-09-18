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

interface GetProductsResponse {
  success: boolean;
  products: Product[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

interface ProductResponse {
  success: boolean;
  product: Product;
}

export const getProducts = async (categoryId?: string): Promise<GetProductsResponse> => {
  try {
    const url = categoryId ? `http://localhost:3000/api/products?categoryId=${categoryId}` : 'http://localhost:3000/api/products';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: GetProductsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createProduct = async (data: Partial<Product>): Promise<ProductResponse> => {
  try {
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result: ProductResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId: string, data: Partial<Product>): Promise<ProductResponse> => {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result: ProductResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result: { success: boolean } = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const toggleProductStatus = async (productId: string): Promise<ProductResponse> => {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result: ProductResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error toggling product status:', error);
    throw error;
  }
};