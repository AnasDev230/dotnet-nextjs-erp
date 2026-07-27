import apiClient from "@/lib/api-client";
import type { ApiResponse, AuthResponse, LoginRequest } from "@/types";

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    data
  );
  return response.data.data;
}

export async function refreshToken(
  refreshToken: string
): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    "/auth/refresh-token",
    { refreshToken }
  );
  return response.data.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post("/auth/logout", { refreshToken });
}
