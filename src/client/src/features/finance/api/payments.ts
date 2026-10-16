import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  CreatePaymentRequest,
  PaymentList,
  PaymentListItem,
} from "../types/payment.types";
import type { PagedResult, PaymentResponse } from "../types/invoice.types";

export interface FetchPaymentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  method?: string;
  fromDate?: string;
  toDate?: string;
}

export async function fetchPayments(
  params: FetchPaymentsParams = {}
): Promise<PagedResult<PaymentList>> {
  const response = await apiClient.get<ApiResponse<PagedResult<PaymentList>>>(
    "/payments",
    { params }
  );
  return response.data.data;
}

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
