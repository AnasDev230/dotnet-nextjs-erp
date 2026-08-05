import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  CreateInvoiceRequest,
  InvoiceListItem,
  InvoiceResponse,
  InvoiceStatus,
  PagedResult,
} from "../types/invoice.types";

export interface FetchInvoicesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  customerId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export async function fetchInvoices(
  params: FetchInvoicesParams = {}
): Promise<PagedResult<InvoiceListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<InvoiceListItem>>
  >("/invoices", { params });
  return response.data.data;
}

export async function fetchInvoice(id: string): Promise<InvoiceResponse> {
  const response = await apiClient.get<ApiResponse<InvoiceResponse>>(
    `/invoices/${id}`
  );
  return response.data.data;
}

export async function createInvoice(
  data: CreateInvoiceRequest
): Promise<InvoiceResponse> {
  const response = await apiClient.post<ApiResponse<InvoiceResponse>>(
    "/invoices",
    data
  );
  return response.data.data;
}

export async function issueInvoice(id: string): Promise<InvoiceResponse> {
  const response = await apiClient.patch<ApiResponse<InvoiceResponse>>(
    `/invoices/${id}/issue`
  );
  return response.data.data;
}

export async function cancelInvoice(id: string): Promise<InvoiceResponse> {
  const response = await apiClient.patch<ApiResponse<InvoiceResponse>>(
    `/invoices/${id}/cancel`
  );
  return response.data.data;
}

export async function deleteInvoice(id: string): Promise<void> {
  await apiClient.delete(`/invoices/${id}`);
}

export const invoiceStatusOptions: { value: InvoiceStatus; label: string }[] = [
  { value: "Draft", label: "مسودة" },
  { value: "Issued", label: "صادرة" },
  { value: "PartiallyPaid", label: "مدفوعة جزئياً" },
  { value: "Paid", label: "مدفوعة" },
  { value: "Cancelled", label: "ملغاة" },
];
