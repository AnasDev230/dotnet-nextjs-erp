export type PurchaseOrderStatus =
  | "Draft"
  | "Submitted"
  | "Approved"
  | "PartiallyReceived"
  | "Received"
  | "Cancelled";

export interface PoItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  orderDate: string;
  expectedDate?: string | null;
  currency: string;
  terms?: string | null;
  items: PoItemRequest[];
}

export interface UpdatePurchaseOrderRequest {
  supplierId: string;
  orderDate: string;
  expectedDate?: string | null;
  currency: string;
  terms?: string | null;
  items: PoItemRequest[];
}

export interface PoItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  receivedQty: number;
  remainingQty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PurchaseOrderResponse {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string | null;
  status: PurchaseOrderStatus;
  totalAmount: number;
  currency: string;
  terms: string | null;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  items: PoItemResponse[];
  createdAt: string;
}

export interface PurchaseOrderListItem {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  createdAt: string;
}
