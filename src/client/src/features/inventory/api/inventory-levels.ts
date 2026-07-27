import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  InventoryLevelListItem,
  UpsertInventoryLevelRequest,
} from "../types/inventory-level.types";
import type { PagedResult } from "../types/product.types";

export interface FetchInventoryLevelsParams {
  page?: number;
  pageSize?: number;
  productId?: string;
  warehouseId?: string;
  lowStockOnly?: boolean;
}

export async function fetchInventoryLevels(
  params: FetchInventoryLevelsParams = {}
): Promise<PagedResult<InventoryLevelListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<InventoryLevelListItem>>
  >("/inventory-levels", { params });
  return response.data.data;
}

export async function upsertInventoryLevel(
  data: UpsertInventoryLevelRequest
): Promise<InventoryLevelListItem> {
  const response = await apiClient.post<
    ApiResponse<InventoryLevelListItem>
  >("/inventory-levels", data);
  return response.data.data;
}
