export type ReturnStatus =
  | "Draft"
  | "Submitted"
  | "Approved"
  | "Completed"
  | "Cancelled";

export interface SalesReturnItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  reason?: string | null;
}

export interface CreateSalesReturnRequest {
  invoiceId: string;
  customerId: string;
  warehouseId: string;
  returnDate: string;
  reason?: string | null;
  items: SalesReturnItemRequest[];
}

export interface SalesReturnItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  reason: string | null;
}

export interface SalesReturnDetail {
  id: string;
  returnNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;
  reason: string | null;
  returnDate: string;
  totalAmount: number;
  status: ReturnStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  items: SalesReturnItem[];
}

export interface SalesReturnListItem {
  id: string;
  returnNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  warehouseName: string;
  returnDate: string;
  totalAmount: number;
  status: ReturnStatus;
}

export interface PurchaseReturnItemRequest {
  productId: string;
  quantity: number;
  unitCost: number;
  reason?: string | null;
}

export interface CreatePurchaseReturnRequest {
  goodsReceiptId: string;
  supplierId: string;
  warehouseId: string;
  returnDate: string;
  reason?: string | null;
  items: PurchaseReturnItemRequest[];
}

export interface PurchaseReturnItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  reason: string | null;
}

export interface PurchaseReturnDetail {
  id: string;
  returnNumber: string;
  goodsReceiptId: string;
  grnNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  reason: string | null;
  returnDate: string;
  totalAmount: number;
  status: ReturnStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  items: PurchaseReturnItem[];
}

export interface PurchaseReturnListItem {
  id: string;
  returnNumber: string;
  goodsReceiptId: string;
  grnNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseName: string;
  returnDate: string;
  totalAmount: number;
  status: ReturnStatus;
}

export const RETURN_STATUS_CONFIG: Record<
  ReturnStatus,
  { labelKey: string; badgeClass: string }
> = {
  Draft: {
    labelKey: "returns.status.draft",
    badgeClass: "border-slate-500/20 bg-slate-500/10 text-slate-600",
  },
  Submitted: {
    labelKey: "returns.status.submitted",
    badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  },
  Approved: {
    labelKey: "returns.status.approved",
    badgeClass: "border-blue-500/20 bg-blue-500/10 text-blue-600",
  },
  Completed: {
    labelKey: "returns.status.completed",
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  },
  Cancelled: {
    labelKey: "returns.status.cancelled",
    badgeClass: "border-red-500/20 bg-red-500/10 text-red-600",
  },
};