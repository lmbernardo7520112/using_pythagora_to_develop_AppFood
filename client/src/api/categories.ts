import api from './api';

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
export const getCategories = async () => {
  console.log('Fetching categories...')
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        categories: [
          {
            _id: '1',
            name: 'Appetizers',
            description: 'Start your meal with our delicious appetizers',
            coverImage: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            _id: '2',
            name: 'Main Courses',
            description: 'Hearty and satisfying main dishes',
            coverImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            _id: '3',
            name: 'Desserts',
            description: 'Sweet treats to end your meal perfectly',
            coverImage: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            _id: '4',
            name: 'Beverages',
            description: 'Refreshing drinks and beverages',
            coverImage: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/categories');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Create a new category
// Endpoint: POST /api/categories
// Request: { name: string, description: string, coverImage: string }
// Response: { success: boolean, category: Category }
export const createCategory = async (data: { name: string; description: string; coverImage: string }) => {
  console.log('Creating category:', data)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        category: {
          _id: Date.now().toString(),
          ...data,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/categories', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Update a category
// Endpoint: PUT /api/categories/:id
// Request: { name: string, description: string, coverImage: string }
// Response: { success: boolean, category: Category }
export const updateCategory = async (id: string, data: { name: string; description: string; coverImage: string }) => {
  console.log('Updating category:', id, data)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        category: {
          _id: id,
          ...data,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/categories/${id}`, data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Delete a category
// Endpoint: DELETE /api/categories/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteCategory = async (id: string) => {
  console.log('Deleting category:', id)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Category deleted successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete(`/api/categories/${id}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}