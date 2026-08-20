import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import type { CreateSalesReturnRequest } from "@/types/returns";
import {
  approveSalesReturn,
  cancelSalesReturn,
  completeSalesReturn,
  createSalesReturn,
  deleteSalesReturn,
  fetchSalesReturn,
  fetchSalesReturns,
  submitSalesReturn,
  type FetchSalesReturnsParams,
} from "../api/sales-returns";

export function useSalesReturns(params: FetchSalesReturnsParams = {}) {
  return useQuery({
    queryKey: ["sales-returns", params],
    queryFn: () => fetchSalesReturns(params),
  });
}

export function useSalesReturn(id: string | undefined) {
  return useQuery({
    queryKey: ["sales-return", id],
    queryFn: () => fetchSalesReturn(id!),
    enabled: !!id,
  });
}

export function useCreateSalesReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateSalesReturnRequest) => createSalesReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-returns"] });
      success(t("returns.toast.created"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}

export function useSubmitSalesReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => submitSalesReturn(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales-returns"] });
      queryClient.invalidateQueries({ queryKey: ["sales-return", id] });
      success(t("returns.toast.submitted"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}

export function useApproveSalesReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => approveSalesReturn(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales-returns"] });
      queryClient.invalidateQueries({ queryKey: ["sales-return", id] });
      success(t("returns.toast.approved"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}

export function useCompleteSalesReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => completeSalesReturn(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales-returns"] });
      queryClient.invalidateQueries({ queryKey: ["sales-return", id] });
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
      success(t("returns.toast.completed"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}

export function useCancelSalesReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => cancelSalesReturn(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales-returns"] });
      queryClient.invalidateQueries({ queryKey: ["sales-return", id] });
      success(t("returns.toast.cancelled"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}

export function useDeleteSalesReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteSalesReturn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-returns"] });
      success(t("returns.toast.deleted"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}