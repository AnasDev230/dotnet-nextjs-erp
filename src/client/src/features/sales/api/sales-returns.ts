import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  CreateSalesReturnRequest,
  ReturnStatus,
  SalesReturnDetail,
  SalesReturnListItem,
} from "@/types/returns";
import type { PagedResult } from "../types/sales-order.types";

export interface FetchSalesReturnsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  customerId?: string;
  status?: ReturnStatus;
  fromDate?: string;
  toDate?: string;
}

export async function fetchSalesReturns(
  params: FetchSalesReturnsParams = {}
): Promise<PagedResult<SalesReturnListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<SalesReturnListItem>>
  >("/sales-returns", { params });
  return response.data.data;
}

export async function fetchSalesReturn(
  id: string
): Promise<SalesReturnDetail> {
  const response = await apiClient.get<ApiResponse<SalesReturnDetail>>(
    `/sales-returns/${id}`
  );
  return response.data.data;
}

export async function createSalesReturn(
  data: CreateSalesReturnRequest
): Promise<SalesReturnDetail> {
  const response = await apiClient.post<ApiResponse<SalesReturnDetail>>(
    "/sales-returns",
    data
  );
  return response.data.data;
}

export async function submitSalesReturn(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/sales-returns/${id}/submit`
  );
  return response.data.data;
}

export async function approveSalesReturn(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/sales-returns/${id}/approve`
  );
  return response.data.data;
}

export async function completeSalesReturn(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/sales-returns/${id}/complete`
  );
  return response.data.data;
}

export async function cancelSalesReturn(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/sales-returns/${id}/cancel`
  );
  return response.data.data;
}

export async function deleteSalesReturn(id: string): Promise<void> {
  await apiClient.delete(`/sales-returns/${id}`);
}