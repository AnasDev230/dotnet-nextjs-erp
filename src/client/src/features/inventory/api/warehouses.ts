import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  WarehouseListItem,
  WarehouseDetail,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from "../types/warehouse.types";
import type { PagedResult } from "../types/product.types";

export interface FetchWarehousesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export async function fetchWarehouses(
  params: FetchWarehousesParams = {}
): Promise<PagedResult<WarehouseListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<WarehouseListItem>>
  >("/warehouses", { params });
  return response.data.data;
}

export async function fetchWarehousesForDropdown(): Promise<WarehouseListItem[]> {
  const response = await apiClient.get<
    ApiResponse<WarehouseListItem[]>
  >("/warehouses/dropdown");
  return response.data.data;
}

export async function fetchWarehouse(
  id: string
): Promise<WarehouseDetail> {
  const response = await apiClient.get<ApiResponse<WarehouseDetail>>(
    `/warehouses/${id}`
  );
  return response.data.data;
}

export async function createWarehouse(
  data: CreateWarehouseRequest
): Promise<WarehouseDetail> {
  const response = await apiClient.post<ApiResponse<WarehouseDetail>>(
    "/warehouses",
    data
  );
  return response.data.data;
}

export async function updateWarehouse(
  id: string,
  data: UpdateWarehouseRequest
): Promise<WarehouseDetail> {
  const response = await apiClient.put<ApiResponse<WarehouseDetail>>(
    `/warehouses/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteWarehouse(id: string): Promise<void> {
  await apiClient.delete(`/warehouses/${id}`);
}
