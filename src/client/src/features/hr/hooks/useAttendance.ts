import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import {
  fetchAttendance,
  fetchAttendanceSummary,
  createAttendance,
  createBulkAttendance,
  deleteAttendance,
} from "../api/attendance";
import type {
  FetchAttendanceParams,
  CreateAttendanceRequest,
  BulkAttendanceRequest,
} from "@/types/attendance";

export function useAttendance(params: FetchAttendanceParams = {}) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: () => fetchAttendance(params),
  });
}

export function useAttendanceSummary(
  employeeId: string | undefined,
  year: number,
  month: number
) {
  return useQuery({
    queryKey: ["attendance-summary", employeeId, year, month],
    queryFn: () => fetchAttendanceSummary(employeeId!, year, month),
    enabled:
      Boolean(employeeId) &&
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      month >= 1 &&
      month <= 12,
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateAttendanceRequest) => createAttendance(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] });
      success(t("attendance.toast.created"), created.employeeName);
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}

export function useBulkAttendance() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: BulkAttendanceRequest) => createBulkAttendance(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] });
      success(t("attendance.toast.bulkCreated"), String(created.length));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] });
      success(t("attendance.toast.deleted"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}
