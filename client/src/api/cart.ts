// client/src/api/cart.ts
import api from "./api";

export interface CartItem {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  sizeName: string;
  sizeId?: string | null;
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

// ✅ Obter itens do carrinho
export const getCartItems = async (token?: string): Promise<{ cart: Cart }> => {
  const response = await api.get<{ success: boolean; cart: Cart }>("/cart", {
    headers: authHeaders(token),
    withCredentials: true,
  });
  return { cart: response.data.cart };
};

// Payload que o frontend monta
export type AddToCartPayload = {
  productId: string;
  productName?: string;
  productImage?: string;
  sizeId?: string | null;
  sizeName: string; // 🔥 tornar obrigatório para evitar erro 400
  unitPrice?: number;
  quantity: number;
  totalPrice?: number;
};

// ✅ Adicionar item ao carrinho (envia todos os campos obrigatórios)
export const addToCart = async (
  data: AddToCartPayload,
  token?: string
): Promise<{ success: boolean; message: string; cart: Cart }> => {
  const payload: any = {
    productId: data.productId,
    sizeName: data.sizeName, // 🔥 essencial para não gerar erro 400
    quantity: data.quantity,
  };

  if (data.sizeId) payload.sizeId = data.sizeId;

  const response = await api.post<{ success: boolean; message: string; cart: Cart }>(
    "/cart/items",
    payload,
    { headers: authHeaders(token), withCredentials: true }
  );
  return response.data;
};

// ✅ Atualizar item do carrinho
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

// ✅ Remover item do carrinho
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

// ✅ Limpar carrinho
export const clearCart = async (
  token?: string
): Promise<{ success: boolean; message: string; cart: Cart }> => {
  const response = await api.delete<{ success: boolean; message: string; cart: Cart }>(
    "/cart",
    { headers: authHeaders(token), withCredentials: true }
  );
  return response.data;
};
