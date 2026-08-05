export type PaymentMethod =
  | "Cash"
  | "BankTransfer"
  | "Card"
  | "Cheque";

export interface CreatePaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string;
  notes?: string;
}

export interface PaymentListItem {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}
