import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  CategoryListItem,
  CategoryDetail,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/category.types";
import type { PagedResult } from "../types/product.types";

export interface FetchCategoriesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function fetchCategories(
  params: FetchCategoriesParams = {}
): Promise<PagedResult<CategoryListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<CategoryListItem>>
  >("/categories", { params });
  return response.data.data;
}

export async function fetchCategoriesForDropdown(): Promise<
  CategoryListItem[]
> {
  const response = await apiClient.get<
    ApiResponse<CategoryListItem[]>
  >("/categories/dropdown");
  return response.data.data;
}

export async function fetchCategory(
  id: string
): Promise<CategoryDetail> {
  const response = await apiClient.get<ApiResponse<CategoryDetail>>(
    `/categories/${id}`
  );
  return response.data.data;
}

export async function createCategory(
  data: CreateCategoryRequest
): Promise<CategoryDetail> {
  const response = await apiClient.post<ApiResponse<CategoryDetail>>(
    "/categories",
    data
  );
  return response.data.data;
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryRequest
): Promise<CategoryDetail> {
  const response = await apiClient.put<ApiResponse<CategoryDetail>>(
    `/categories/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
