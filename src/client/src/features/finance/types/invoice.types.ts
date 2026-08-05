import type { PaymentMethod } from "./payment.types";

export type InvoiceStatus =
  | "Draft"
  | "Issued"
  | "PartiallyPaid"
  | "Paid"
  | "Cancelled";

export interface PaymentResponse {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateInvoiceRequest {
  orderId: string;
  issueDate: string;
}

export interface InvoiceResponse {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  isOverdue: boolean;
  createdAt: string;
  payments: PaymentResponse[];
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  issueDate: string;
  dueDate: string | null;
  netAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  isOverdue: boolean;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
