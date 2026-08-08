import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type { PagedResult } from "../../sales/types/sales-order.types";
import type {
  ProductSupplierListItem,
  ProductSupplierDetail,
  CreateProductSupplierRequest,
  UpdateProductSupplierRequest,
} from "../types/product-supplier.types";

export interface FetchProductSuppliersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  productId?: string;
  supplierId?: string;
}

export async function fetchProductSuppliers(
  params: FetchProductSuppliersParams = {}
): Promise<PagedResult<ProductSupplierListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<ProductSupplierListItem>>
  >("/product-suppliers", { params });
  return response.data.data;
}

export async function fetchProductSuppliersByProduct(
  productId: string
): Promise<ProductSupplierListItem[]> {
  const response = await apiClient.get<
    ApiResponse<ProductSupplierListItem[]>
  >(`/product-suppliers/by-product/${productId}`);
  return response.data.data;
}

export async function fetchProductSuppliersBySupplier(
  supplierId: string
): Promise<ProductSupplierListItem[]> {
  const response = await apiClient.get<
    ApiResponse<ProductSupplierListItem[]>
  >(`/product-suppliers/by-supplier/${supplierId}`);
  return response.data.data;
}

export async function fetchProductSupplier(
  id: string
): Promise<ProductSupplierDetail> {
  const response = await apiClient.get<ApiResponse<ProductSupplierDetail>>(
    `/product-suppliers/${id}`
  );
  return response.data.data;
}

export async function createProductSupplier(
  data: CreateProductSupplierRequest
): Promise<ProductSupplierDetail> {
  const response = await apiClient.post<ApiResponse<ProductSupplierDetail>>(
    "/product-suppliers",
    data
  );
  return response.data.data;
}

export async function updateProductSupplier(
  id: string,
  data: UpdateProductSupplierRequest
): Promise<ProductSupplierDetail> {
  const response = await apiClient.put<ApiResponse<ProductSupplierDetail>>(
    `/product-suppliers/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteProductSupplier(id: string): Promise<void> {
  await apiClient.delete(`/product-suppliers/${id}`);
}
