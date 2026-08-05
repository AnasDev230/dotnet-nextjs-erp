import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelInvoice,
  createInvoice,
  deleteInvoice,
  fetchInvoice,
  fetchInvoices,
  issueInvoice,
  type FetchInvoicesParams,
} from "../api/invoices";
import type { CreateInvoiceRequest } from "../types/invoice.types";

export function useInvoices(filters: FetchInvoicesParams = {}) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => fetchInvoices(filters),
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => fetchInvoice(id!),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) => createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: () => {
      // Backend BusinessException (e.g. order already invoiced) is exposed through
      // mutation.error and rendered by the form's destructive Alert.
    },
  });
}

export function useIssueInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => issueInvoice(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.setQueryData(["invoices", updated.id], updated);
    },
    onError: () => {
      // Error rendered via mutation.error in the component.
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelInvoice(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.setQueryData(["invoices", updated.id], updated);
    },
    onError: () => {
      // Error rendered via mutation.error in the component.
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: () => {
      // Error rendered via mutation.error in the component.
    },
  });
}
