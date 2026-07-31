import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  CustomerListItem,
  CustomerDetail,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  PagedResult,
} from "../types/customer.types";

export interface FetchCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  type?: string;
}

export async function fetchCustomers(
  params: FetchCustomersParams = {}
): Promise<PagedResult<CustomerListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<CustomerListItem>>
  >("/customers", { params });
  return response.data.data;
}

export async function fetchCustomersForDropdown(): Promise<CustomerListItem[]> {
  const response = await apiClient.get<
    ApiResponse<CustomerListItem[]>
  >("/customers/dropdown");
  return response.data.data;
}

export async function fetchCustomer(id: string): Promise<CustomerDetail> {
  const response = await apiClient.get<ApiResponse<CustomerDetail>>(
    `/customers/${id}`
  );
  return response.data.data;
}

export async function createCustomer(
  data: CreateCustomerRequest
): Promise<CustomerDetail> {
  const response = await apiClient.post<ApiResponse<CustomerDetail>>(
    "/customers",
    data
  );
  return response.data.data;
}

export async function updateCustomer(
  id: string,
  data: UpdateCustomerRequest
): Promise<CustomerDetail> {
  const response = await apiClient.put<ApiResponse<CustomerDetail>>(
    `/customers/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}
