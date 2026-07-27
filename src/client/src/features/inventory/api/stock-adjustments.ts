import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  StockAdjustmentItem,
  CreateStockAdjustmentRequest,
} from "../types/stock-adjustment.types";
import type { PagedResult } from "../types/product.types";

export interface FetchStockAdjustmentsParams {
  page?: number;
  pageSize?: number;
  productId?: string;
  warehouseId?: string;
}

export async function fetchStockAdjustments(
  params: FetchStockAdjustmentsParams = {}
): Promise<PagedResult<StockAdjustmentItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<StockAdjustmentItem>>
  >("/stock-adjustments", { params });
  return response.data.data;
}

export async function createStockAdjustment(
  data: CreateStockAdjustmentRequest
): Promise<StockAdjustmentItem> {
  const response = await apiClient.post<
    ApiResponse<StockAdjustmentItem>
  >("/stock-adjustments", data);
  return response.data.data;
}
