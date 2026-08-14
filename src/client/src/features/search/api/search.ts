import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type { SearchResultResponse } from "@/types/search";

export async function searchGlobal(
  query: string,
  limit: number = 5
): Promise<SearchResultResponse> {
  const response = await apiClient.get<ApiResponse<SearchResultResponse>>(
    "/search",
    { params: { q: query, limit } }
  );
  return response.data.data;
}