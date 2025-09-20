import api from "./api";

// Interface consistente com o que Orders.tsx usa
export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  items: {
    productId: string;
    productName: string;
    productImage: string;
    size?: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
  };
}

// Buscar pedidos
export const getOrders = async (
  params?: Record<string, any>
): Promise<OrdersResponse> => {
  const res = await api.get("/orders", { params });
  return res.data;
};

// Criar pedido
export const createOrder = async (
  data: Omit<Order, "_id" | "orderNumber" | "status" | "createdAt">
): Promise<{ success: boolean; order: Order }> => {
  const res = await api.post("/orders", data);
  return res.data;
};

// Atualizar status do pedido
export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<{ success: boolean; order: Order }> => {
  const res = await api.patch(`/orders/${orderId}/status`, { status });
  return res.data;
};





