// client/src/api/cart.ts
import api from "./api";

// ====================
// Interfaces
// ====================

export interface CartItem {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  sizeName: string;
  sizeId?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number; // ✅ sempre normalizado
  total?: number;     // compatibilidade (não usado no front)
}

export interface Cart {
  _id: string;
  userId?: string;
  items: CartItem[];
  totalQuantity?: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

// ====================
// Helpers
// ====================

// Envia token se disponível
function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Normaliza item recebido do backend
function normalizeItem(item: any): CartItem {
  const unit = Number(item.unitPrice ?? item.price ?? 0);
  const qty = Number(item.quantity ?? 0);
  const total = Number(item.totalPrice ?? item.total ?? unit * qty);

  return {
    ...item,
    unitPrice: unit,
    quantity: qty,
    totalPrice: total,
  };
}

// ✅ Normaliza cart inteiro
function normalizeCart(cart: any): Cart {
  const items = Array.isArray(cart.items)
    ? cart.items.map(normalizeItem)
    : [];

  const totalAmount =
    Number(
      cart.totalAmount ??
        items.reduce((sum, i) => sum + Number(i.totalPrice ?? 0), 0)
    ) || 0;

  return {
    ...cart,
    items,
    totalAmount,
  };
}

// ====================
// API Methods
// ====================

// ✅ Obter itens do carrinho
export const getCartItems = async (
  token?: string
): Promise<{ cart: Cart }> => {
  const response = await api.get<{ success: boolean; cart: Cart }>(
    "/cart",
    {
      headers: authHeaders(token),
      withCredentials: true,
    }
  );

  return { cart: normalizeCart(response.data.cart) };
};

// ✅ Payload para adicionar item
export type AddToCartPayload = {
  productId: string;
  productName: string;
  productImage: string;
  sizeId: string | null;
  sizeName: string;
  unitPrice: number;
  quantity: number;
  totalPrice?: number;
};

// ✅ Adicionar item ao carrinho
export const addToCart = async (
  data: AddToCartPayload,
  token?: string
): Promise<{ success: boolean; message: string; cart: Cart }> => {
  // Validações básicas no front
  if (!data.productId) throw new Error("Product ID is required");
  if (!data.productName) throw new Error("Product name is required");
  if (!data.productImage) throw new Error("Product image is required");
  if (!data.sizeName) throw new Error("Size name is required");
  if (data.unitPrice === undefined || data.unitPrice < 0)
    throw new Error("Valid unit price is required");
  if (!data.quantity || data.quantity < 1)
    throw new Error("Valid quantity is required");

  const payload = {
    productId: data.productId,
    productName: data.productName,
    productImage: data.productImage,
    sizeId: data.sizeId,
    sizeName: data.sizeName,
    unitPrice: data.unitPrice,
    quantity: data.quantity,
    totalPrice: data.totalPrice ?? data.unitPrice * data.quantity,
  };

  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      cart: Cart;
    }>("/cart/items", payload, {
      headers: authHeaders(token),
      withCredentials: true,
      timeout: 10000,
    });

    return {
      ...response.data,
      cart: normalizeCart(response.data.cart),
    };
  } catch (error: any) {
    console.error("❌ Cart error:", error);

    if (error.response?.status === 400) {
      throw new Error(
        `Validation Error: ${
          error.response.data?.message || "Invalid request data"
        }`
      );
    } else if (error.response?.status === 401) {
      throw new Error("Authentication required. Please login again.");
    } else if (error.response?.status === 404) {
      throw new Error("Product not found or unavailable");
    } else if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please check your connection.");
    } else {
      throw new Error(error.message || "Failed to add item to cart");
    }
  }
};

// ✅ Atualizar item do carrinho
export const updateCartItem = async (
  data: { itemId: string; quantity: number },
  token?: string
): Promise<{ success: boolean; message: string; cart: Cart }> => {
  if (!data.itemId) throw new Error("Item ID is required");
  if (!data.quantity || data.quantity < 1)
    throw new Error("Valid quantity is required");

  const response = await api.put<{
    success: boolean;
    message: string;
    cart: Cart;
  }>(`/cart/items/${data.itemId}`, { quantity: data.quantity }, {
    headers: authHeaders(token),
    withCredentials: true,
  });

  return {
    ...response.data,
    cart: normalizeCart(response.data.cart),
  };
};

// ✅ Remover item do carrinho
export const removeFromCart = async (
  itemId: string,
  token?: string
): Promise<{ success: boolean; message: string; cart: Cart }> => {
  if (!itemId) throw new Error("Item ID is required");

  const response = await api.delete<{
    success: boolean;
    message: string;
    cart: Cart;
  }>(`/cart/items/${itemId}`, {
    headers: authHeaders(token),
    withCredentials: true,
  });

  return {
    ...response.data,
    cart: normalizeCart(response.data.cart),
  };
};

// ✅ Limpar carrinho
export const clearCart = async (
  token?: string
): Promise<{ success: boolean; message: string; cart: Cart }> => {
  const response = await api.delete<{
    success: boolean;
    message: string;
    cart: Cart;
  }>("/cart", {
    headers: authHeaders(token),
    withCredentials: true,
  });

  return {
    ...response.data,
    cart: normalizeCart(response.data.cart),
  };
};
