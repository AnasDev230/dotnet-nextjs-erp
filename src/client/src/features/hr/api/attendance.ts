import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type { PagedResult } from "@/types/hr";
import type {
  AttendanceListItem,
  AttendanceDetail,
  AttendanceSummary,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  BulkAttendanceRequest,
  FetchAttendanceParams,
} from "@/types/attendance";

export async function fetchAttendance(
  params: FetchAttendanceParams = {}
): Promise<PagedResult<AttendanceListItem>> {
  const response = await apiClient.get<
    ApiResponse<PagedResult<AttendanceListItem>>
  >("/attendance", { params });
  return response.data.data;
}

export async function fetchAttendanceById(
  id: string
): Promise<AttendanceDetail> {
  const response = await apiClient.get<ApiResponse<AttendanceDetail>>(
    `/attendance/${id}`
  );
  return response.data.data;
}

export async function fetchAttendanceSummary(
  employeeId: string,
  year: number,
  month: number
): Promise<AttendanceSummary> {
  const response = await apiClient.get<ApiResponse<AttendanceSummary>>(
    "/attendance/summary",
    { params: { employeeId, year, month } }
  );
  return response.data.data;
}

export async function createAttendance(
  data: CreateAttendanceRequest
): Promise<AttendanceDetail> {
  const response = await apiClient.post<ApiResponse<AttendanceDetail>>(
    "/attendance",
    data
  );
  return response.data.data;
}

export async function createBulkAttendance(
  data: BulkAttendanceRequest
): Promise<AttendanceDetail[]> {
  const response = await apiClient.post<ApiResponse<AttendanceDetail[]>>(
    "/attendance/bulk",
    data
  );
  return response.data.data;
}

export async function updateAttendance(
  id: string,
  data: UpdateAttendanceRequest
): Promise<AttendanceDetail> {
  const response = await apiClient.put<ApiResponse<AttendanceDetail>>(
    `/attendance/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteAttendance(id: string): Promise<void> {
  await apiClient.delete(`/attendance/${id}`);
}
