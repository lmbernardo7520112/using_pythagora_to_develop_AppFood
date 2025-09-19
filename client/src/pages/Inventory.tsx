import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { fetchInventory, updateInventorySizes, InventoryItem } from "@/api/inventory";
import { AlertTriangle, Package, Plus, Minus, Edit } from "lucide-react";

// Interface para a UI
interface UiInventoryItem {
  productId: string;
  productName: string;
  totalStock: number;
  lowStockAlert: boolean;
  sizes: {
    name: string;
    stock: number;
    status: "good" | "low" | "out";
  }[];
}

export function Inventory() {
  const [inventory, setInventory] = useState<UiInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<UiInventoryItem | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSizes, setEditingSizes] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchInventoryData();
  }, []); // Dependência vazia para evitar múltiplas chamadas

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response: { inventory: InventoryItem[] } = await fetchInventory();
      const adaptedInventory: UiInventoryItem[] = response.inventory.map((item: InventoryItem) => {
        const lowStockThreshold = 10;
        const sizes = item.sizes.map((size) => ({
          name: size.name,
          stock: size.stock,
          status: size.stock === 0 ? "out" : size.stock <= lowStockThreshold ? "low" : "good",
        }));
        return {
          productId: item.productId,
          productName: item.name,
          totalStock: item.totalStock,
          lowStockAlert: item.totalStock <= lowStockThreshold,
          sizes,
        };
      });
      setInventory(adaptedInventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "low":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "out":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const handleUpdateStock = async (productId: string, sizeName: string, newStock: number) => {
    try {
      const item = inventory.find((i) => i.productId === productId);
      if (!item) return;

      const updatedSizes = item.sizes.map((size) =>
        size.name === sizeName ? { ...size, stock: Math.max(0, newStock) } : size
      );
      const response = await updateInventorySizes(
        productId,
        updatedSizes.map((s) => ({ name: s.name, stock: s.stock }))
      );
      setInventory((prev) =>
        prev.map((i) =>
          i.productId === productId
            ? {
                ...i,
                totalStock: response.totalStock,
                sizes: response.sizes.map((s) => ({
                  name: s.name,
                  stock: s.stock,
                  status: s.stock === 0 ? "out" : s.stock <= 10 ? "low" : "good",
                })),
                lowStockAlert: response.totalStock <= 10,
              }
            : i
        )
      );
      toast({
        title: "Success",
        description: "Stock updated successfully!",
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkUpdate = async () => {
    if (!editingItem) return;
    try {
      const updatedSizes = editingItem.sizes.map((size) => ({
        name: size.name,
        stock: editingSizes[size.name] ?? size.stock,
      }));
      const response = await updateInventorySizes(editingItem.productId, updatedSizes);
      setInventory((prev) =>
        prev.map((i) =>
          i.productId === editingItem.productId
            ? {
                ...i,
                totalStock: response.totalStock,
                sizes: response.sizes.map((s) => ({
                  name: s.name,
                  stock: s.stock,
                  status: s.stock === 0 ? "out" : s.stock <= 10 ? "low" : "good",
                })),
                lowStockAlert: response.totalStock <= 10,
              }
            : i
        )
      );
      toast({
        title: "Success",
        description: "Stock levels updated successfully!",
      });
      setShowDialog(false);
      setEditingSizes({});
    } catch (error) {
      console.error("Error updating stock:", error);
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const lowStockItems = inventory.filter((item) => item.lowStockAlert);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Inventory Management</h1>
        <Badge variant="secondary" className="text-sm">
          {inventory.length} products tracked
        </Badge>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              <span>Low Stock Alerts</span>
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              {lowStockItems.length} product{lowStockItems.length !== 1 ? "s" : ""} running low on stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map((item) => (
                <div key={item.productId} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="font-medium text-sm">{item.productName}</div>
                  <div className="text-xs text-gray-500 mt-1">Total stock: {item.totalStock}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.sizes
                      .filter((size) => size.status === "low" || size.status === "out")
                      .map((size) => (
                        <Badge key={size.name} className={`text-xs ${getStatusColor(size.status)}`}>
                          {size.name}: {size.stock}
                        </Badge>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {inventory.map((item) => (
          <Card key={item.productId} className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.productName}</CardTitle>
                {item.lowStockAlert && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Low Stock
                  </Badge>
                )}
              </div>
              <CardDescription>Total Stock: {item.totalStock} units</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {item.sizes.map((size) => (
                  <div
                    key={size.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium text-sm">{size.name}</div>
                        <Badge className={`text-xs ${getStatusColor(size.status)}`}>
                          {size.status === "good" && "In Stock"}
                          {size.status === "low" && "Low Stock"}
                          {size.status === "out" && "Out of Stock"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleUpdateStock(item.productId, size.name, Math.max(0, size.stock - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{size.stock}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleUpdateStock(item.productId, size.name, size.stock + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEditingItem(item);
                  setEditingSizes(
                    item.sizes.reduce((acc, size) => ({ ...acc, [size.name]: size.stock }), {})
                  );
                  setShowDialog(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Bulk Update
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Bulk Update Stock</DialogTitle>
            <DialogDescription>Update stock levels for {editingItem?.productName}</DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4">
              {editingItem.sizes.map((size) => (
                <div key={size.name} className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{size.name}</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      value={editingSizes[size.name] ?? size.stock}
                      className="w-20 text-center"
                      onChange={(e) => {
                        const newStock = parseInt(e.target.value) || 0;
                        setEditingSizes((prev) => ({ ...prev, [size.name]: newStock }));
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setEditingSizes({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkUpdate}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Update Stock
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {inventory.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-6">
            <Package className="h-24 w-24 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
            No inventory data
          </h2>
          <p className="text-gray-500 dark:text-gray-500">
            Add some products to start tracking inventory
          </p>
        </div>
      )}
    </div>
  );
}