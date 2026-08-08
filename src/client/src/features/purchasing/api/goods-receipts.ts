import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  GoodsReceiptListItem,
  GoodsReceiptResponse,
  CreateGoodsReceiptRequest,
} from "../types/goods-receipt.types";
import type { PagedResult } from "../../sales/types/sales-order.types";

export interface FetchGoodsReceiptsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  purchaseOrderId?: string;
  fromDate?: string;
  toDate?: string;
}

export async function fetchGoodsReceipts(
  params: FetchGoodsReceiptsParams = {}
): Promise<PagedResult<GoodsReceiptListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<GoodsReceiptListItem>>
  >("/goods-receipts", { params });
  return response.data.data;
}

export async function fetchGoodsReceipt(
  id: string
): Promise<GoodsReceiptResponse> {
  const response = await apiClient.get<ApiResponse<GoodsReceiptResponse>>(
    `/goods-receipts/${id}`
  );
  return response.data.data;
}

export async function createGoodsReceipt(
  data: CreateGoodsReceiptRequest
): Promise<GoodsReceiptResponse> {
  const response = await apiClient.post<ApiResponse<GoodsReceiptResponse>>(
    "/goods-receipts",
    data
  );
  return response.data.data;
}

export async function cancelGoodsReceipt(id: string): Promise<void> {
  await apiClient.patch(`/goods-receipts/${id}/cancel`);
}
