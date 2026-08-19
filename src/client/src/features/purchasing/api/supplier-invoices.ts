import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type { PagedResult } from "../../sales/types/sales-order.types";
import type {
  SupplierInvoiceListItem,
  SupplierInvoiceResponse,
  CreateSupplierInvoiceRequest,
  UpdateSupplierInvoiceRequest,
} from "../types/supplier-invoice.types";

export interface FetchSupplierInvoicesParams {
  page?: number;
  pageSize?: number;
  status?: string;
  supplierId?: string;
}

export async function fetchSupplierInvoices(
  params: FetchSupplierInvoicesParams = {}
): Promise<PagedResult<SupplierInvoiceListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<SupplierInvoiceListItem>>
  >("/supplier-invoices", { params });
  return response.data.data;
}

export async function fetchSupplierInvoice(
  id: string
): Promise<SupplierInvoiceResponse> {
  const response = await apiClient.get<ApiResponse<SupplierInvoiceResponse>>(
    `/supplier-invoices/${id}`
  );
  return response.data.data;
}

export async function createSupplierInvoice(
  data: CreateSupplierInvoiceRequest
): Promise<SupplierInvoiceResponse> {
  const response = await apiClient.post<ApiResponse<SupplierInvoiceResponse>>(
    "/supplier-invoices",
    data
  );
  return response.data.data;
}

export async function updateSupplierInvoice(
  id: string,
  data: UpdateSupplierInvoiceRequest
): Promise<SupplierInvoiceResponse> {
  const response = await apiClient.put<ApiResponse<SupplierInvoiceResponse>>(
    `/supplier-invoices/${id}`,
    data
  );
  return response.data.data;
}

export async function receiveSupplierInvoice(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/supplier-invoices/${id}/receive`
  );
  return response.data.data;
}

export async function cancelSupplierInvoice(id: string): Promise<string> {
  const response = await apiClient.patch<ApiResponse<string>>(
    `/supplier-invoices/${id}/cancel`
  );
  return response.data.data;
}

export async function deleteSupplierInvoice(id: string): Promise<void> {
  await apiClient.delete(`/supplier-invoices/${id}`);
}