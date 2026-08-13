import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserProfile,
} from "@/types/settings";

export async function fetchProfile(): Promise<UserProfile> {
  const response = await apiClient.get<ApiResponse<UserProfile>>("/profile");
  return response.data.data;
}

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<UserProfile> {
  const response = await apiClient.put<ApiResponse<UserProfile>>("/profile", data);
  return response.data.data;
}

export async function changePassword(
  data: ChangePasswordRequest
): Promise<void> {
  await apiClient.post("/profile/change-password", data);
}