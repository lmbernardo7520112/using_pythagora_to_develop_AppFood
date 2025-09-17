import api from './api';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  _id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
}

// Description: Get all orders (admin) or user orders (customer)
// Endpoint: GET /api/orders
// Request: { status?: string, page?: number, limit?: number }
// Response: { orders: Order[], total: number, page: number, totalPages: number }
export const getOrders = async (params?: { status?: string; page?: number; limit?: number }) => {
  console.log('Fetching orders with params:', params)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        orders: [
          {
            _id: '1',
            userId: 'user1',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            deliveryAddress: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              phone: '+1234567890'
            },
            items: [
              {
                productId: '1',
                productName: 'Margherita Pizza',
                productImage: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
                size: 'Medium',
                price: 16.99,
                quantity: 2,
                total: 33.98
              }
            ],
            totalAmount: 33.98,
            status: 'preparing',
            orderNumber: 'ORD-001',
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:30:00Z'
          },
          {
            _id: '2',
            userId: 'user2',
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            deliveryAddress: {
              street: '456 Oak Ave',
              city: 'Los Angeles',
              state: 'CA',
              zipCode: '90001',
              phone: '+1987654321'
            },
            items: [
              {
                productId: '2',
                productName: 'Caesar Salad',
                productImage: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
                size: 'Regular',
                price: 8.99,
                quantity: 1,
                total: 8.99
              },
              {
                productId: '3',
                productName: 'Chocolate Cake',
                productImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
                size: 'Slice',
                price: 6.99,
                quantity: 1,
                total: 6.99
              }
            ],
            totalAmount: 15.98,
            status: 'delivered',
            orderNumber: 'ORD-002',
            createdAt: '2024-01-01T09:00:00Z',
            updatedAt: '2024-01-01T11:00:00Z'
          }
        ],
        total: 2,
        page: 1,
        totalPages: 1
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/orders', { params });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Create a new order
// Endpoint: POST /api/orders
// Request: { deliveryAddress: object, items: OrderItem[] }
// Response: { success: boolean, order: Order }
export const createOrder = async (data: {
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  items: OrderItem[];
}) => {
  console.log('Creating order:', data)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        order: {
          _id: Date.now().toString(),
          userId: 'user1',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          deliveryAddress: data.deliveryAddress,
          items: data.items,
          totalAmount: data.items.reduce((sum, item) => sum + item.total, 0),
          status: 'pending',
          orderNumber: `ORD-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/orders', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Update order status (admin only)
// Endpoint: PATCH /api/orders/:id/status
// Request: { status: string }
// Response: { success: boolean, order: Order }
export const updateOrderStatus = async (orderId: string, status: string) => {
  console.log('Updating order status:', orderId, status)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Order status updated successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.patch(`/api/orders/${orderId}/status`, { status });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Get order by ID
// Endpoint: GET /api/orders/:id
// Request: {}
// Response: { order: Order }
export const getOrderById = async (orderId: string) => {
  console.log('Fetching order by ID:', orderId)
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        order: {
          _id: orderId,
          userId: 'user1',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          deliveryAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            phone: '+1234567890'
          },
          items: [
            {
              productId: '1',
              productName: 'Margherita Pizza',
              productImage: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
              size: 'Medium',
              price: 16.99,
              quantity: 2,
              total: 33.98
            }
          ],
          totalAmount: 33.98,
          status: 'preparing',
          orderNumber: 'ORD-001',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:30:00Z'
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/orders/${orderId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}