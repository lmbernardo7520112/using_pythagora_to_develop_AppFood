import api from "./api";

export interface InventorySize {
  name: string;
  price: number;
  stock: number;
}

export interface InventoryItem {
  productId: string;
  name: string;
  sku?: string | null;
  sizes: InventorySize[];
  totalStock: number;
}

// ✅ Buscar inventário (com pesquisa opcional ?q=)
export async function fetchInventory(q?: string): Promise<{ inventory: InventoryItem[] }> {
  const res = await api.get("/inventory", { params: { q } });
  return res.data;
}

// ✅ Atualizar estoque total de um produto
export async function updateInventoryQuantity(productId: string, quantity: number): Promise<InventoryItem> {
  const res = await api.put(`/inventory/${productId}`, { quantity });
  return res.data;
}

// ✅ Atualizar estoque por tamanhos
export async function updateInventorySizes(productId: string, sizes: { name: string; stock: number; price?: number }[]): Promise<InventoryItem> {
  const res = await api.put(`/inventory/${productId}`, { sizes });
  return res.data;
}

// ✅ Aplicar delta (+/-)
export async function updateInventoryDelta(productId: string, delta: number): Promise<InventoryItem> {
  const res = await api.put(`/inventory/${productId}`, { delta });
  return res.data;
}
