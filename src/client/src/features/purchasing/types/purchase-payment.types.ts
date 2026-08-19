import type { PurchasePaymentMethod } from "./supplier-invoice.types";

export interface CreatePurchasePaymentRequest {
  supplierInvoiceId: string;
  amount: number;
  method: PurchasePaymentMethod;
  paymentDate: string;
  reference?: string | null;
  notes?: string | null;
}

export interface PurchasePaymentListItem {
  id: string;
  amount: number;
  method: PurchasePaymentMethod;
  paymentDate: string;
  reference: string | null;
  notes: string | null;
}