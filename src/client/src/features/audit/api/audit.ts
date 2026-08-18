import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type { PagedResult } from "@/types/settings";
import type { AuditLogItem, AuditLogQueryParams } from "@/types/audit";

export async function fetchAuditLogs(
  params: AuditLogQueryParams
): Promise<PagedResult<AuditLogItem>> {
  const response = await apiClient.get<ApiResponse<PagedResult<AuditLogItem>>>(
    "/audit-logs",
    { params }
  );
  return response.data.data;
}

export async function fetchAuditLog(id: string): Promise<AuditLogItem> {
  const response = await apiClient.get<ApiResponse<AuditLogItem>>(
    `/audit-logs/${id}`
  );
  return response.data.data;
}

export async function fetchAuditFilterTables(): Promise<string[]> {
  const response = await apiClient.get<ApiResponse<string[]>>(
    "/audit-logs/filters/tables"
  );
  return response.data.data;
}

export async function fetchAuditFilterUsers(): Promise<string[]> {
  const response = await apiClient.get<ApiResponse<string[]>>(
    "/audit-logs/filters/users"
  );
  return response.data.data;
}