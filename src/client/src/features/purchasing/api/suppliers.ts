import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  SupplierListItem,
  SupplierDetail,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "../types/supplier.types";
import type { PagedResult } from "../../sales/types/sales-order.types";

export interface FetchSuppliersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export async function fetchSuppliers(
  params: FetchSuppliersParams = {}
): Promise<PagedResult<SupplierListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<SupplierListItem>>
  >("/suppliers", { params });
  return response.data.data;
}

export async function fetchSuppliersForDropdown(): Promise<
  SupplierListItem[]
> {
  const response = await apiClient.get<ApiResponse<SupplierListItem[]>>(
    "/suppliers/dropdown"
  );
  return response.data.data;
}

export async function fetchSupplier(id: string): Promise<SupplierDetail> {
  const response = await apiClient.get<ApiResponse<SupplierDetail>>(
    `/suppliers/${id}`
  );
  return response.data.data;
}

export async function createSupplier(
  data: CreateSupplierRequest
): Promise<SupplierDetail> {
  const response = await apiClient.post<ApiResponse<SupplierDetail>>(
    "/suppliers",
    data
  );
  return response.data.data;
}

export async function updateSupplier(
  id: string,
  data: UpdateSupplierRequest
): Promise<SupplierDetail> {
  const response = await apiClient.put<ApiResponse<SupplierDetail>>(
    `/suppliers/${id}`,
    data
  );
  return response.data.data;
}

export async function suspendSupplier(id: string): Promise<void> {
  await apiClient.patch(`/suppliers/${id}/suspend`);
}

export async function activateSupplier(id: string): Promise<void> {
  await apiClient.patch(`/suppliers/${id}/activate`);
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`/suppliers/${id}`);
}
