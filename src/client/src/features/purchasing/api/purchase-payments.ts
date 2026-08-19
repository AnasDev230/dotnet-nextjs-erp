import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type { PagedResult } from "../../sales/types/sales-order.types";
import type {
  CreatePurchasePaymentRequest,
  PurchasePaymentListItem,
} from "../types/purchase-payment.types";

export interface FetchPurchasePaymentsParams {
  page?: number;
  pageSize?: number;
  supplierInvoiceId?: string;
}

export async function fetchPurchasePayments(
  params: FetchPurchasePaymentsParams = {}
): Promise<PagedResult<PurchasePaymentListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<PurchasePaymentListItem>>
  >("/purchase-payments", { params });
  return response.data.data;
}

export async function createPurchasePayment(
  data: CreatePurchasePaymentRequest
): Promise<PurchasePaymentListItem> {
  const response = await apiClient.post<ApiResponse<PurchasePaymentListItem>>(
    "/purchase-payments",
    data
  );
  return response.data.data;
}