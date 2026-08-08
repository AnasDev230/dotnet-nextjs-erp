export type GoodsReceiptStatus = "Received" | "Cancelled";

export interface GrnItemRequest {
  poItemId: string;
  productId: string;
  quantity: number;
}

export interface CreateGoodsReceiptRequest {
  purchaseOrderId: string;
  receiptDate: string;
  warehouseId: string;
  notes?: string | null;
  items: GrnItemRequest[];
}

export interface GrnItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
}

export interface GoodsReceiptResponse {
  id: string;
  grnNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierName: string;
  receiptDate: string;
  warehouseId: string;
  warehouseName: string;
  status: GoodsReceiptStatus;
  notes: string | null;
  items: GrnItemResponse[];
  createdAt: string;
}

export interface GoodsReceiptListItem {
  id: string;
  grnNumber: string;
  poNumber: string;
  supplierName: string;
  receiptDate: string;
  warehouseName: string;
  status: GoodsReceiptStatus;
}
