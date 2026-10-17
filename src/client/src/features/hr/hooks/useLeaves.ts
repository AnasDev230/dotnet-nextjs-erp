import { useQuery } from "@tanstack/react-query";
import {
  fetchLeaveRequests,
  fetchLeaveRequestById,
  fetchLeaveSummary,
} from "../api/leaves";
import type { FetchLeaveRequestsParams } from "@/types/leave";

export function useLeaves(params: FetchLeaveRequestsParams = {}) {
  return useQuery({
    queryKey: ["leaves", params],
    queryFn: () => fetchLeaveRequests(params),
  });
}

export function useLeave(id: string | undefined) {
  return useQuery({
    queryKey: ["leaves", id],
    queryFn: () => fetchLeaveRequestById(id!),
    enabled: Boolean(id),
  });
}

export function useLeaveSummary(employeeId: string | undefined, year: number) {
  return useQuery({
    queryKey: ["leave-summary", employeeId, year],
    queryFn: () => fetchLeaveSummary(employeeId!, year),
    enabled: Boolean(employeeId) && Number.isFinite(year),
  });
}
