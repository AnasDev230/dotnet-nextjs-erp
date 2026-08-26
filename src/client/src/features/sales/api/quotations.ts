import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  CreateQuotationRequest,
  PagedResult,
  QuotationDetail,
  QuotationListItem,
  UpdateQuotationRequest,
} from "../types/quotation.types";

export interface FetchQuotationsParams {
  page?: number;
  pageSize?: number;
  status?: number;
  customerId?: string;
}

export async function fetchQuotations(
  params: FetchQuotationsParams = {}
): Promise<PagedResult<QuotationListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<QuotationListItem>>
  >("/quotations", { params });
  return response.data.data;
}

export async function fetchQuotation(id: string): Promise<QuotationDetail> {
  const response = await apiClient.get<ApiResponse<QuotationDetail>>(
    `/quotations/${id}`
  );
  return response.data.data;
}

export async function createQuotation(
  data: CreateQuotationRequest
): Promise<QuotationDetail> {
  const response = await apiClient.post<ApiResponse<QuotationDetail>>(
    "/quotations",
    data
  );
  return response.data.data;
}

export async function updateQuotation(
  id: string,
  data: UpdateQuotationRequest
): Promise<QuotationDetail> {
  const response = await apiClient.put<ApiResponse<QuotationDetail>>(
    `/quotations/${id}`,
    data
  );
  return response.data.data;
}

async function postAction(id: string, action: string): Promise<void> {
  await apiClient.patch(`/quotations/${id}/${action}`);
}

export async function sendQuotation(id: string): Promise<void> {
  return postAction(id, "send");
}

export async function acceptQuotation(id: string): Promise<void> {
  return postAction(id, "accept");
}

export async function rejectQuotation(id: string): Promise<void> {
  return postAction(id, "reject");
}

export async function convertQuotation(
  id: string,
  warehouseId?: string
): Promise<{ salesOrderId: string }> {
  const response = await apiClient.post<ApiResponse<{ salesOrderId: string }>>(
    `/quotations/${id}/convert`,
    { warehouseId: warehouseId || null }
  );
  return response.data.data;
}

export async function deleteQuotation(id: string): Promise<void> {
  await apiClient.delete(`/quotations/${id}`);
}
