export interface StockAdjustmentItem {
  id: string;
  productName: string;
  warehouseName: string;
  countedQty: number;
  systemQty: number;
  variance: number;
  reason: string;
  createdAt: string;
}

export interface CreateStockAdjustmentRequest {
  productId: string;
  warehouseId: string;
  countedQty: number;
  reason: string;
}
