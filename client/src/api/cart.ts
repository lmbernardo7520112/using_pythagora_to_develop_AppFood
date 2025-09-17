import api from './api';

export interface CartItem {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Description: Get cart items for current user
// Endpoint: GET /api/cart
// Request: {}
// Response: { cart: Cart }
export const getCartItems = async () => {
  console.log('Fetching cart items...')
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        cart: {
          _id: '1',
          userId: 'user1',
          items: [
            {
              _id: '1',
              productId: '1',
              productName: 'Margherita Pizza',
              productImage: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
              size: 'Medium',
              price: 16.99,
              quantity: 2,
              total: 33.98
            },
            {
              _id: '2',
              productId: '2',
              productName: 'Caesar Salad',
              productImage: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
              size: 'Regular',
              price: 8.99,
              quantity: 1,
              total: 8.99
            }
          ],
          totalAmount: 42.97,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/cart');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Add item to cart
// Endpoint: POST /api/cart/add
// Request: { productId: string, size: string, quantity: number }
// Response: { success: boolean, message: string }
export const addToCart = async (data: { productId: string; size: string; quantity: number }) => {
  console.log('Adding item to cart:', data)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Item added to cart successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/cart/add', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Update cart item quantity
// Endpoint: PUT /api/cart/update
// Request: { itemId: string, quantity: number }
// Response: { success: boolean, message: string }
export const updateCartItem = async (data: { itemId: string; quantity: number }) => {
  console.log('Updating cart item:', data)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Cart item updated successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put('/api/cart/update', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Remove item from cart
// Endpoint: DELETE /api/cart/remove/:itemId
// Request: {}
// Response: { success: boolean, message: string }
export const removeFromCart = async (itemId: string) => {
  console.log('Removing item from cart:', itemId)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Item removed from cart successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete(`/api/cart/remove/${itemId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Clear entire cart
// Endpoint: DELETE /api/cart/clear
// Request: {}
// Response: { success: boolean, message: string }
export const clearCart = async () => {
  console.log('Clearing cart...')
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Cart cleared successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete('/api/cart/clear');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}