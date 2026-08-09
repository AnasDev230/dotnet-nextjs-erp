import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  EmployeeListItem,
  EmployeeDetail,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeStatus,
  PagedResult,
} from "@/types/hr";

export interface FetchEmployeesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  status?: EmployeeStatus;
}

export async function fetchEmployees(
  params: FetchEmployeesParams = {}
): Promise<PagedResult<EmployeeListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<EmployeeListItem>>
  >("/employees", { params });
  return response.data.data;
}

export async function fetchEmployeesForDropdown(): Promise<
  EmployeeListItem[]
> {
  const response = await apiClient.get<ApiResponse<EmployeeListItem[]>>(
    "/employees/dropdown"
  );
  return response.data.data;
}

export async function fetchEmployee(id: string): Promise<EmployeeDetail> {
  const response = await apiClient.get<ApiResponse<EmployeeDetail>>(
    `/employees/${id}`
  );
  return response.data.data;
}

export async function createEmployee(
  data: CreateEmployeeRequest
): Promise<EmployeeDetail> {
  const response = await apiClient.post<ApiResponse<EmployeeDetail>>(
    "/employees",
    data
  );
  return response.data.data;
}

export async function updateEmployee(
  id: string,
  data: UpdateEmployeeRequest
): Promise<EmployeeDetail> {
  const response = await apiClient.put<ApiResponse<EmployeeDetail>>(
    `/employees/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await apiClient.delete(`/employees/${id}`);
}
