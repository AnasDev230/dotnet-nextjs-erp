import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  CreatePaymentRequest,
  PaymentListItem,
} from "../types/payment.types";
import type { PaymentResponse } from "../types/invoice.types";

export async function fetchPaymentsForInvoice(
  invoiceId: string
): Promise<PaymentListItem[]> {
  const response = await apiClient.get<ApiResponse<PaymentListItem[]>>(
    `/invoices/${invoiceId}/payments`
  );
  return response.data.data;
}

export async function recordPayment(
  invoiceId: string,
  data: CreatePaymentRequest
): Promise<PaymentResponse> {
  const response = await apiClient.post<ApiResponse<PaymentResponse>>(
    `/invoices/${invoiceId}/payments`,
    data
  );
  return response.data.data;
}

export async function deletePayment(id: string): Promise<void> {
  await apiClient.delete(`/payments/${id}`);
}
