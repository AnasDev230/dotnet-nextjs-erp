export type SupplierInvoiceStatus =
  | "Draft"
  | "Received"
  | "PartiallyPaid"
  | "Paid"
  | "Cancelled";

export type PurchasePaymentMethod =
  | "Cash"
  | "BankTransfer"
  | "Card"
  | "Cheque";

export interface CreateSupplierInvoiceRequest {
  purchaseOrderId: string;
  supplierId: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  notes?: string | null;
  supplierReference?: string | null;
}

export interface UpdateSupplierInvoiceRequest {
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  notes?: string | null;
  supplierReference?: string | null;
}

export interface PurchasePaymentItem {
  id: string;
  amount: number;
  method: PurchasePaymentMethod;
  paymentDate: string;
  reference: string | null;
  notes: string | null;
}

export interface SupplierInvoiceResponse {
  id: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  supplierId: string;
  supplierName: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: SupplierInvoiceStatus;
  notes: string | null;
  supplierReference: string | null;
  createdAt: string;
  payments: PurchasePaymentItem[];
}

export interface SupplierInvoiceListItem {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  purchaseOrderNumber: string;
  issueDate: string;
  dueDate: string;
  netAmount: number;
  paidAmount: number;
  status: SupplierInvoiceStatus;
}