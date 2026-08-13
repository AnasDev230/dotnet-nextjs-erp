import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  CreateUserRequest,
  PagedResult,
  UpdateUserRequest,
  UserListItem,
} from "@/types/settings";

export interface FetchUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function fetchUsers(
  params: FetchUsersParams = {}
): Promise<PagedResult<UserListItem>> {
  const response = await apiClient.get<ApiResponse<PagedResult<UserListItem>>>(
    "/settings/users",
    { params }
  );
  return response.data.data;
}

export async function createUser(data: CreateUserRequest): Promise<UserListItem> {
  const response = await apiClient.post<ApiResponse<UserListItem>>(
    "/settings/users",
    data
  );
  return response.data.data;
}

export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<UserListItem> {
  const response = await apiClient.put<ApiResponse<UserListItem>>(
    `/settings/users/${id}`,
    data
  );
  return response.data.data;
}

export async function toggleUserActive(id: string): Promise<UserListItem> {
  const response = await apiClient.patch<ApiResponse<UserListItem>>(
    `/settings/users/${id}/toggle-active`
  );
  return response.data.data;
}