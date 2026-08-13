import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  CompanySettings,
  UpdateCompanySettingsRequest,
} from "@/types/settings";

export async function fetchCompanySettings(): Promise<CompanySettings> {
  const response = await apiClient.get<ApiResponse<CompanySettings>>(
    "/settings/company"
  );
  return response.data.data;
}

export async function updateCompanySettings(
  data: UpdateCompanySettingsRequest
): Promise<CompanySettings> {
  const response = await apiClient.put<ApiResponse<CompanySettings>>(
    "/settings/company",
    data
  );
  return response.data.data;
}