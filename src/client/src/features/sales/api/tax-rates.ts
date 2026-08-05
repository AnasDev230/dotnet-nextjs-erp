import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type { TaxRate } from "../types/sales-order.types";

export async function fetchTaxRates(): Promise<TaxRate[]> {
  const response = await apiClient.get<ApiResponse<TaxRate[]>>("/tax-rates");
  return response.data.data;
}
