import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import type { CreatePurchaseReturnRequest } from "@/types/returns";
import {
  approvePurchaseReturn,
  cancelPurchaseReturn,
  completePurchaseReturn,
  createPurchaseReturn,
  deletePurchaseReturn,
  fetchPurchaseReturn,
  fetchPurchaseReturns,
  submitPurchaseReturn,
  type FetchPurchaseReturnsParams,
} from "../api/purchase-returns";

export function usePurchaseReturns(params: FetchPurchaseReturnsParams = {}) {
  return useQuery({
    queryKey: ["purchase-returns", params],
    queryFn: () => fetchPurchaseReturns(params),
  });
}

export function usePurchaseReturn(id: string | undefined) {
  return useQuery({
    queryKey: ["purchase-return", id],
    queryFn: () => fetchPurchaseReturn(id!),
    enabled: !!id,
  });
}

export function useCreatePurchaseReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreatePurchaseReturnRequest) =>
      createPurchaseReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-returns"] });
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

export function useSubmitPurchaseReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => submitPurchaseReturn(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-returns"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-return", id] });
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

export function useApprovePurchaseReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => approvePurchaseReturn(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-returns"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-return", id] });
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

export function useCompletePurchaseReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => completePurchaseReturn(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-returns"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-return", id] });
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

export function useCancelPurchaseReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => cancelPurchaseReturn(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-returns"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-return", id] });
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

export function useDeletePurchaseReturn() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => deletePurchaseReturn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-returns"] });
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