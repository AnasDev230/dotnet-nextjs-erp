import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  PurchaseOrderListItem,
  PurchaseOrderResponse,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
} from "../types/purchase-order.types";
import type { PagedResult } from "../../sales/types/sales-order.types";

export interface FetchPurchaseOrdersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  supplierId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export async function fetchPurchaseOrders(
  params: FetchPurchaseOrdersParams = {}
): Promise<PagedResult<PurchaseOrderListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<PurchaseOrderListItem>>
  >("/purchase-orders", { params });
  return response.data.data;
}

export async function fetchPurchaseOrder(
  id: string
): Promise<PurchaseOrderResponse> {
  const response = await apiClient.get<ApiResponse<PurchaseOrderResponse>>(
    `/purchase-orders/${id}`
  );
  return response.data.data;
}

export async function createPurchaseOrder(
  data: CreatePurchaseOrderRequest
): Promise<PurchaseOrderResponse> {
  const response = await apiClient.post<ApiResponse<PurchaseOrderResponse>>(
    "/purchase-orders",
    data
  );
  return response.data.data;
}

export async function updatePurchaseOrder(
  id: string,
  data: UpdatePurchaseOrderRequest
): Promise<PurchaseOrderResponse> {
  const response = await apiClient.put<ApiResponse<PurchaseOrderResponse>>(
    `/purchase-orders/${id}`,
    data
  );
  return response.data.data;
}

export async function submitPurchaseOrder(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/purchase-orders/${id}/submit`
  );
  return response.data.data;
}

export async function approvePurchaseOrder(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/purchase-orders/${id}/approve`
  );
  return response.data.data;
}

export async function cancelPurchaseOrder(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/purchase-orders/${id}/cancel`
  );
  return response.data.data;
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  await apiClient.delete(`/purchase-orders/${id}`);
}
