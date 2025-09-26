// client/src/api/orders.ts
import api from "./api";

// ====================
// Interfaces
// ====================

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size?: string;
  quantity: number;
  price: number;
  totalPrice: number; // ✅ garantido
  total?: number;     // compatibilidade com backend
}

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
  items: OrderItem[];
  totalAmount: number; // ✅ garantido
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

// ====================
// Normalizers
// ====================

// ✅ Normaliza um item de pedido
function normalizeOrderItem(item: any): OrderItem {
  const price = Number(item.price ?? 0);
  const qty = Number(item.quantity ?? 0);
  const total = Number(item.totalPrice ?? item.total ?? price * qty);

  return {
    ...item,
    price,
    quantity: qty,
    totalPrice: total,
  };
}

// ✅ Normaliza um pedido
function normalizeOrder(order: any): Order {
  const items = Array.isArray(order.items)
    ? order.items.map(normalizeOrderItem)
    : [];

  const totalAmount =
    Number(
      order.totalAmount ??
        items.reduce((sum: number, i: { totalPrice: any; }) => sum + Number(i.totalPrice ?? 0), 0)
    ) || 0;

  return {
    ...order,
    items,
    totalAmount,
  };
}

// ====================
// API Methods
// ====================

// Buscar pedidos (com normalização)
export const getOrders = async (
  params?: Record<string, any>
): Promise<OrdersResponse> => {
  const res = await api.get<OrdersResponse>("/orders", { params });

  return {
    ...res.data,
    orders: res.data.orders.map(normalizeOrder),
  };
};

// Criar pedido (já normalizado)
export const createOrder = async (
  data: Omit<Order, "_id" | "orderNumber" | "status" | "createdAt">
): Promise<{ success: boolean; order: Order }> => {
  const res = await api.post<{ success: boolean; order: Order }>(
    "/orders",
    data
  );

  return {
    ...res.data,
    order: normalizeOrder(res.data.order),
  };
};

// Atualizar status do pedido
export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<{ success: boolean; order: Order }> => {
  const res = await api.patch<{ success: boolean; order: Order }>(
    `/orders/${orderId}/status`,
    { status }
  );

  return {
    ...res.data,
    order: normalizeOrder(res.data.order),
  };
};
