import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  ProductListItem,
  ProductDetail,
  CreateProductRequest,
  UpdateProductRequest,
  PagedResult,
} from "../types/product.types";

export interface FetchProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export async function fetchProducts(
  params: FetchProductsParams = {}
): Promise<PagedResult<ProductListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<ProductListItem>>
  >("/products", { params });
  return response.data.data;
}

export async function fetchProduct(
  id: string
): Promise<ProductDetail> {
  const response = await apiClient.get<ApiResponse<ProductDetail>>(
    `/products/${id}`
  );
  return response.data.data;
}

export async function createProduct(
  data: CreateProductRequest
): Promise<ProductDetail> {
  const response = await apiClient.post<ApiResponse<ProductDetail>>(
    "/products",
    data
  );
  return response.data.data;
}

export async function updateProduct(
  id: string,
  data: UpdateProductRequest
): Promise<ProductDetail> {
  const response = await apiClient.put<ApiResponse<ProductDetail>>(
    `/products/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteProduct(
  id: string
): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}
