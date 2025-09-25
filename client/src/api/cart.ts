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

// ✅ CORREÇÃO: Payload expandido com todas as informações necessárias
export type AddToCartPayload = {
  productId: string;
  productName: string;        // ✅ Tornar obrigatório
  productImage: string;       // ✅ Tornar obrigatório
  sizeId: string | null;      // ✅ Tornar obrigatório (pode ser null)
  sizeName: string;           // ✅ Obrigatório para evitar erro 400
  unitPrice: number;          // ✅ Tornar obrigatório
  quantity: number;
  totalPrice?: number;        // ✅ Opcional - será calculado se não fornecido
};

// ✅ CORREÇÃO: Validação rigorosa antes de enviar
export const addToCart = async (
  data: AddToCartPayload,
  token?: string
): Promise<{ success: boolean; message: string; cart: Cart }> => {
  
  // ✅ VALIDAÇÕES NO FRONTEND
  if (!data.productId) {
    throw new Error("Product ID is required");
  }
  if (!data.sizeName) {
    throw new Error("Size name is required");
  }
  if (!data.productName) {
    throw new Error("Product name is required");
  }
  if (!data.productImage) {
    throw new Error("Product image is required");
  }
  if (data.unitPrice === undefined || data.unitPrice < 0) {
    throw new Error("Valid unit price is required");
  }
  if (!data.quantity || data.quantity < 1) {
    throw new Error("Valid quantity is required");
  }

  // ✅ CORREÇÃO: Payload completo e estruturado
  const payload = {
    productId: data.productId,
    productName: data.productName,
    productImage: data.productImage,
    sizeId: data.sizeId,           // Pode ser null
    sizeName: data.sizeName,
    unitPrice: data.unitPrice,
    quantity: data.quantity,
    totalPrice: data.totalPrice || (data.unitPrice * data.quantity), // Calcular se não fornecido
  };

  console.log("🚀 Sending cart payload:", payload);

  try {
    const response = await api.post<{ success: boolean; message: string; cart: Cart }>(
      "/cart/items",
      payload,
      { 
        headers: authHeaders(token), 
        withCredentials: true,
        timeout: 10000  // ✅ Timeout de 10s para evitar travamentos
      }
    );

    console.log("✅ Cart response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Cart error:", error);
    
    // ✅ MELHORIA: Mensagens de erro mais específicas
    if (error.response?.status === 400) {
      const message = error.response.data?.message || "Invalid request data";
      throw new Error(`Validation Error: ${message}`);
    } else if (error.response?.status === 401) {
      throw new Error("Authentication required. Please login again.");
    } else if (error.response?.status === 404) {
      throw new Error("Product not found or unavailable");
    } else if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
    } else if (error.code === 'ECONNABORTED') {
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
  
  if (!data.itemId) {
    throw new Error("Item ID is required");
  }
  if (!data.quantity || data.quantity < 1) {
    throw new Error("Valid quantity is required");
  }

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
  
  if (!itemId) {
    throw new Error("Item ID is required");
  }

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