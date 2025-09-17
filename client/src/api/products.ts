import api from './api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  categoryName?: string;
  images: string[];
  coverImage: string;
  isActive: boolean;
  sizes: {
    name: string;
    price: number;
    stock: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Description: Get all products
// Endpoint: GET /api/products
// Request: { categoryId?: string }
// Response: { products: Product[] }
export const getProducts = async (categoryId?: string) => {
  console.log('Fetching products for category:', categoryId)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const allProducts = [
        {
          _id: '1',
          name: 'Margherita Pizza',
          description: 'Classic pizza with fresh tomatoes, mozzarella, and basil',
          basePrice: 12.99,
          categoryId: '2',
          categoryName: 'Main Courses',
          images: [
            'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
          ],
          coverImage: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
          isActive: true,
          sizes: [
            { name: 'Small', price: 12.99, stock: 10 },
            { name: 'Medium', price: 16.99, stock: 8 },
            { name: 'Large', price: 20.99, stock: 5 }
          ],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '2',
          name: 'Caesar Salad',
          description: 'Fresh romaine lettuce with caesar dressing and croutons',
          basePrice: 8.99,
          categoryId: '1',
          categoryName: 'Appetizers',
          images: [
            'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'
          ],
          coverImage: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
          isActive: true,
          sizes: [
            { name: 'Regular', price: 8.99, stock: 15 }
          ],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '3',
          name: 'Chocolate Cake',
          description: 'Rich and moist chocolate cake with chocolate frosting',
          basePrice: 6.99,
          categoryId: '3',
          categoryName: 'Desserts',
          images: [
            'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
          ],
          coverImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
          isActive: true,
          sizes: [
            { name: 'Slice', price: 6.99, stock: 12 },
            { name: 'Whole Cake', price: 45.99, stock: 3 }
          ],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          _id: '4',
          name: 'Fresh Orange Juice',
          description: 'Freshly squeezed orange juice',
          basePrice: 4.99,
          categoryId: '4',
          categoryName: 'Beverages',
          images: [
            'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'
          ],
          coverImage: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
          isActive: true,
          sizes: [
            { name: 'Small', price: 4.99, stock: 20 },
            { name: 'Large', price: 7.99, stock: 15 }
          ],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const filteredProducts = categoryId 
        ? allProducts.filter(product => product.categoryId === categoryId)
        : allProducts;

      resolve({
        products: filteredProducts
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const params = categoryId ? { categoryId } : {};
  //   return await api.get('/api/products', { params });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Create a new product
// Endpoint: POST /api/products
// Request: { name: string, description: string, basePrice: number, categoryId: string, images: string[], sizes: Array }
// Response: { success: boolean, product: Product }
export const createProduct = async (data: {
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  images: string[];
  sizes: { name: string; price: number; stock: number }[];
}) => {
  console.log('Creating product:', data)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        product: {
          _id: Date.now().toString(),
          ...data,
          coverImage: data.images[0] || '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/products', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Update a product
// Endpoint: PUT /api/products/:id
// Request: { name: string, description: string, basePrice: number, categoryId: string, images: string[], sizes: Array }
// Response: { success: boolean, product: Product }
export const updateProduct = async (id: string, data: {
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  images: string[];
  sizes: { name: string; price: number; stock: number }[];
}) => {
  console.log('Updating product:', id, data)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        product: {
          _id: id,
          ...data,
          coverImage: data.images[0] || '',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/products/${id}`, data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Delete a product
// Endpoint: DELETE /api/products/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteProduct = async (id: string) => {
  console.log('Deleting product:', id)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Product deleted successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete(`/api/products/${id}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Toggle product active status
// Endpoint: PATCH /api/products/:id/toggle
// Request: {}
// Response: { success: boolean, product: Product }
export const toggleProductStatus = async (id: string) => {
  console.log('Toggling product status:', id)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Product status updated successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.patch(`/api/products/${id}/toggle`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}