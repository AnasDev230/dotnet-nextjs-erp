export interface InventoryLevelListItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  warehouseId: string;
  warehouseName: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderLevel: number;
  isLowStock: boolean;
  avgCost: number;
  lastMovement: string | null;
}

export interface UpsertInventoryLevelRequest {
  productId: string;
  warehouseId: string;
  quantityOnHand: number;
  avgCost: number;
}
