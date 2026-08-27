import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type { PagedResult } from "@/types/hr";
import type {
  PayrollRunListItem,
  PayrollRunDetail,
  PayrollDetailListItem,
  PayrollDetail,
  CreatePayrollRunRequest,
  FetchPayrollParams,
} from "@/types/payroll";

export async function fetchPayrollRuns(
  params: FetchPayrollParams = {}
): Promise<PagedResult<PayrollRunListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<PayrollRunListItem>>
  >("/payroll", { params });
  return response.data.data;
}

export async function fetchPayrollRun(id: string): Promise<PayrollRunDetail> {
  const response = await apiClient.get<ApiResponse<PayrollRunDetail>>(
    `/payroll/${id}`
  );
  return response.data.data;
}

export async function fetchPayrollDetails(
  runId: string
): Promise<PayrollDetailListItem[]> {
  const response = await apiClient.get<ApiResponse<PayrollDetailListItem[]>>(
    `/payroll/${runId}/details`
  );
  return response.data.data;
}

export async function fetchPayrollDetail(
  runId: string,
  detailId: string
): Promise<PayrollDetail> {
  const response = await apiClient.get<ApiResponse<PayrollDetail>>(
    `/payroll/${runId}/details/${detailId}`
  );
  return response.data.data;
}

export async function createPayrollRun(
  data: CreatePayrollRunRequest
): Promise<PayrollRunDetail> {
  const response = await apiClient.post<ApiResponse<PayrollRunDetail>>(
    "/payroll",
    data
  );
  return response.data.data;
}

export async function markPayrollRunPaid(id: string): Promise<PayrollRunDetail> {
  const response = await apiClient.patch<ApiResponse<PayrollRunDetail>>(
    `/payroll/${id}/mark-paid`
  );
  return response.data.data;
}

export async function deletePayrollRun(id: string): Promise<void> {
  await apiClient.delete(`/payroll/${id}`);
}
