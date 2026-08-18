import { useQuery } from "@tanstack/react-query";
import {
  fetchAuditLog,
  fetchAuditLogs,
  fetchAuditFilterTables,
  fetchAuditFilterUsers,
} from "../api/audit";
import type { AuditLogQueryParams } from "@/types/audit";

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: ["audit-logs", id],
    queryFn: () => fetchAuditLog(id),
    enabled: !!id,
  });
}

export function useAuditLogs(params: AuditLogQueryParams) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => fetchAuditLogs(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAuditFilterTables() {
  return useQuery({
    queryKey: ["audit-filter-tables"],
    queryFn: fetchAuditFilterTables,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAuditFilterUsers() {
  return useQuery({
    queryKey: ["audit-filter-users"],
    queryFn: fetchAuditFilterUsers,
    staleTime: 5 * 60 * 1000,
  });
}