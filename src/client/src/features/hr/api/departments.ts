import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  DepartmentListItem,
  DepartmentDetail,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  PagedResult,
} from "@/types/hr";

export interface FetchDepartmentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export async function fetchDepartments(
  params: FetchDepartmentsParams = {}
): Promise<PagedResult<DepartmentListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<DepartmentListItem>>
  >("/departments", { params });
  return response.data.data;
}

export async function fetchDepartmentsForDropdown(): Promise<
  DepartmentListItem[]
> {
  const response = await apiClient.get<ApiResponse<DepartmentListItem[]>>(
    "/departments/dropdown"
  );
  return response.data.data;
}

export async function fetchDepartment(
  id: string
): Promise<DepartmentDetail> {
  const response = await apiClient.get<ApiResponse<DepartmentDetail>>(
    `/departments/${id}`
  );
  return response.data.data;
}

export async function createDepartment(
  data: CreateDepartmentRequest
): Promise<DepartmentDetail> {
  const response = await apiClient.post<ApiResponse<DepartmentDetail>>(
    "/departments",
    data
  );
  return response.data.data;
}

export async function updateDepartment(
  id: string,
  data: UpdateDepartmentRequest
): Promise<DepartmentDetail> {
  const response = await apiClient.put<ApiResponse<DepartmentDetail>>(
    `/departments/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiClient.delete(`/departments/${id}`);
}
