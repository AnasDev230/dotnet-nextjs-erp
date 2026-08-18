import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type { PagedResult } from "../types/product.types";
import type {
  StockTransferListItem,
  StockTransferDetail,
  CreateStockTransferRequest,
  UpdateStockTransferRequest,
  StockTransferStatus,
} from "../types/stock-transfer.types";

export interface FetchStockTransfersParams {
  page?: number;
  pageSize?: number;
  status?: StockTransferStatus;
}

export async function fetchStockTransfers(
  params: FetchStockTransfersParams = {}
): Promise<PagedResult<StockTransferListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<StockTransferListItem>>
  >("/stock-transfers", { params });
  return response.data.data;
}

export async function fetchStockTransfer(
  id: string
): Promise<StockTransferDetail> {
  const response = await apiClient.get<ApiResponse<StockTransferDetail>>(
    `/stock-transfers/${id}`
  );
  return response.data.data;
}

export async function createStockTransfer(
  data: CreateStockTransferRequest
): Promise<StockTransferDetail> {
  const response = await apiClient.post<ApiResponse<StockTransferDetail>>(
    "/stock-transfers",
    data
  );
  return response.data.data;
}

export async function updateStockTransfer(
  id: string,
  data: UpdateStockTransferRequest
): Promise<StockTransferDetail> {
  const response = await apiClient.put<ApiResponse<StockTransferDetail>>(
    `/stock-transfers/${id}`,
    data
  );
  return response.data.data;
}

export async function submitStockTransfer(id: string): Promise<void> {
  await apiClient.patch(`/stock-transfers/${id}/submit`);
}

export async function approveStockTransfer(id: string): Promise<void> {
  await apiClient.patch(`/stock-transfers/${id}/approve`);
}

export async function completeStockTransfer(id: string): Promise<void> {
  await apiClient.patch(`/stock-transfers/${id}/complete`);
}

export async function cancelStockTransfer(id: string): Promise<void> {
  await apiClient.patch(`/stock-transfers/${id}/cancel`);
}

export async function deleteStockTransfer(id: string): Promise<void> {
  await apiClient.delete(`/stock-transfers/${id}`);
}