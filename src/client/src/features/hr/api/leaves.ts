import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type { PagedResult } from "@/types/hr";
import type {
  LeaveRequestListItem,
  LeaveRequestDetail,
  LeaveSummary,
  CreateLeaveRequest,
  UpdateLeaveRequest,
  RejectLeaveRequest,
  CancelLeaveRequest,
  FetchLeaveRequestsParams,
} from "@/types/leave";

export async function fetchLeaveRequests(
  params: FetchLeaveRequestsParams = {}
): Promise<PagedResult<LeaveRequestListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<LeaveRequestListItem>>
  >("/leave-requests", { params });
  return response.data.data;
}

export async function fetchLeaveRequestById(
  id: string
): Promise<LeaveRequestDetail> {
  const response = await apiClient.get<ApiResponse<LeaveRequestDetail>>(
    `/leave-requests/${id}`
  );
  return response.data.data;
}

export async function fetchLeaveSummary(
  employeeId: string,
  year: number
): Promise<LeaveSummary> {
  const response = await apiClient.get<ApiResponse<LeaveSummary>>(
    "/leave-requests/summary",
    { params: { employeeId, year } }
  );
  return response.data.data;
}

export async function createLeaveRequest(
  data: CreateLeaveRequest
): Promise<LeaveRequestDetail> {
  const response = await apiClient.post<ApiResponse<LeaveRequestDetail>>(
    "/leave-requests",
    data
  );
  return response.data.data;
}

export async function updateLeaveRequest(
  id: string,
  data: UpdateLeaveRequest
): Promise<LeaveRequestDetail> {
  const response = await apiClient.put<ApiResponse<LeaveRequestDetail>>(
    `/leave-requests/${id}`,
    data
  );
  return response.data.data;
}

export async function approveLeaveRequest(
  id: string
): Promise<LeaveRequestDetail> {
  const response = await apiClient.patch<ApiResponse<LeaveRequestDetail>>(
    `/leave-requests/${id}/approve`
  );
  return response.data.data;
}

export async function rejectLeaveRequest(
  id: string,
  data: RejectLeaveRequest
): Promise<LeaveRequestDetail> {
  const response = await apiClient.patch<ApiResponse<LeaveRequestDetail>>(
    `/leave-requests/${id}/reject`,
    data
  );
  return response.data.data;
}

export async function cancelLeaveRequest(
  id: string,
  data: CancelLeaveRequest = {}
): Promise<LeaveRequestDetail> {
  const response = await apiClient.patch<ApiResponse<LeaveRequestDetail>>(
    `/leave-requests/${id}/cancel`,
    data
  );
  return response.data.data;
}

export async function deleteLeaveRequest(id: string): Promise<void> {
  await apiClient.delete(`/leave-requests/${id}`);
}
