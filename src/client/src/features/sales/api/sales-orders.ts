import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  SalesOrderListItem,
  SalesOrderResponse,
  CreateSalesOrderRequest,
  UpdateSalesOrderRequest,
  PagedResult,
} from "../types/sales-order.types";

export interface FetchSalesOrdersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  customerId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export async function fetchSalesOrders(
  params: FetchSalesOrdersParams = {}
): Promise<PagedResult<SalesOrderListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<SalesOrderListItem>>
  >("/sales-orders", { params });
  return response.data.data;
}

export async function fetchSalesOrder(
  id: string
): Promise<SalesOrderResponse> {
  const response = await apiClient.get<ApiResponse<SalesOrderResponse>>(
    `/sales-orders/${id}`
  );
  return response.data.data;
}

export async function createSalesOrder(
  data: CreateSalesOrderRequest
): Promise<SalesOrderResponse> {
  const response = await apiClient.post<ApiResponse<SalesOrderResponse>>(
    "/sales-orders",
    data
  );
  return response.data.data;
}

export async function updateSalesOrder(
  id: string,
  data: UpdateSalesOrderRequest
): Promise<SalesOrderResponse> {
  const response = await apiClient.put<ApiResponse<SalesOrderResponse>>(
    `/sales-orders/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteSalesOrder(id: string): Promise<void> {
  await apiClient.delete(`/sales-orders/${id}`);
}
