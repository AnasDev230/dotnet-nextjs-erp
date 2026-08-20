import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  CreatePurchaseReturnRequest,
  PurchaseReturnDetail,
  PurchaseReturnListItem,
  ReturnStatus,
} from "@/types/returns";
import type { PagedResult } from "../../sales/types/sales-order.types";

export interface FetchPurchaseReturnsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  supplierId?: string;
  status?: ReturnStatus;
  fromDate?: string;
  toDate?: string;
}

export async function fetchPurchaseReturns(
  params: FetchPurchaseReturnsParams = {}
): Promise<PagedResult<PurchaseReturnListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<PurchaseReturnListItem>>
  >("/purchase-returns", { params });
  return response.data.data;
}

export async function fetchPurchaseReturn(
  id: string
): Promise<PurchaseReturnDetail> {
  const response = await apiClient.get<ApiResponse<PurchaseReturnDetail>>(
    `/purchase-returns/${id}`
  );
  return response.data.data;
}

export async function createPurchaseReturn(
  data: CreatePurchaseReturnRequest
): Promise<PurchaseReturnDetail> {
  const response = await apiClient.post<ApiResponse<PurchaseReturnDetail>>(
    "/purchase-returns",
    data
  );
  return response.data.data;
}

export async function submitPurchaseReturn(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/purchase-returns/${id}/submit`
  );
  return response.data.data;
}

export async function approvePurchaseReturn(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/purchase-returns/${id}/approve`
  );
  return response.data.data;
}

export async function completePurchaseReturn(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/purchase-returns/${id}/complete`
  );
  return response.data.data;
}

export async function cancelPurchaseReturn(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/purchase-returns/${id}/cancel`
  );
  return response.data.data;
}

export async function deletePurchaseReturn(id: string): Promise<void> {
  await apiClient.delete(`/purchase-returns/${id}`);
}