//client/src/api/cart.ts
import api from "./api";

export interface CartItem {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  sizeName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Cart {
  _id: string;
  userId?: string;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Envia token se disponível
function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Get cart items
export const getCartItems = async (token?: string): Promise<{ cart: Cart }> => {
  const response = await api.get<{ success: boolean; cart: Cart }>("/cart", {
    headers: authHeaders(token),
    withCredentials: true,
  });
  return { cart: response.data.cart };
};

// ✅ Add item to cart
export const addToCart = async (
  data: { productId: string; size?: string; quantity: number },
  token?: string
): Promise<{ success: boolean; message: string; cart: Cart }> => {
  const response = await api.post<{ success: boolean; message: string; cart: Cart }>(
    "/cart/items",
    data,
    { headers: authHeaders(token), withCredentials: true }
  );
  return response.data;
};

// ✅ Update cart item
export const updateCartItem = async (
  data: { itemId: string; quantity: number },
  token?: string
): Promise<{ success: boolean; message: string; cart: Cart }> => {
  const response = await api.put<{ success: boolean; message: string; cart: Cart }>(
    `/cart/items/${data.itemId}`,
    { quantity: data.quantity },
    { headers: authHeaders(token), withCredentials: true }
  );
  return response.data;
};

// ✅ Remove cart item
export const removeFromCart = async (
  itemId: string,
  token?: string
): Promise<{ success: boolean; message: string; cart: Cart }> => {
  const response = await api.delete<{ success: boolean; message: string; cart: Cart }>(
    `/cart/items/${itemId}`,
    { headers: authHeaders(token), withCredentials: true }
  );
  return response.data;
};

// ✅ Clear cart
export const clearCart = async (token?: string): Promise<{ success: boolean; message: string; cart: Cart }> => {
  const response = await api.delete<{ success: boolean; message: string; cart: Cart }>("/cart", {
    headers: authHeaders(token),
    withCredentials: true,
  });
  return response.data;
};
