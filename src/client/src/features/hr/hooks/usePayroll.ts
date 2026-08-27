import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import {
  fetchPayrollRuns,
  fetchPayrollRun,
  fetchPayrollDetails,
  fetchPayrollDetail,
  createPayrollRun,
  markPayrollRunPaid,
  deletePayrollRun,
} from "../api/payroll";
import type {
  FetchPayrollParams,
  CreatePayrollRunRequest,
} from "@/types/payroll";

export function usePayrollRuns(params: FetchPayrollParams = {}) {
  return useQuery({
    queryKey: ["payroll", params],
    queryFn: () => fetchPayrollRuns(params),
  });
}

export function usePayrollRun(id: string | undefined) {
  return useQuery({
    queryKey: ["payroll", id],
    queryFn: () => fetchPayrollRun(id!),
    enabled: Boolean(id),
  });
}

export function usePayrollDetails(runId: string | undefined) {
  return useQuery({
    queryKey: ["payroll", runId, "details"],
    queryFn: () => fetchPayrollDetails(runId!),
    enabled: Boolean(runId),
  });
}

export function usePayrollDetail(
  runId: string | undefined,
  detailId: string | undefined,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["payroll", runId, "detail", detailId],
    queryFn: () => fetchPayrollDetail(runId!, detailId!),
    enabled: enabled && Boolean(runId) && Boolean(detailId),
  });
}

export function useCreatePayrollRun() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreatePayrollRunRequest) => createPayrollRun(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      success(t("payroll.toast.created"), created.runNumber);
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}

export function useMarkPayrollPaid() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => markPayrollRunPaid(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      success(t("payroll.toast.markedPaid"), updated.runNumber);
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}

export function useDeletePayrollRun() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => deletePayrollRun(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      success(t("payroll.toast.deleted"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}
