import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deletePayment,
  fetchPaymentsForInvoice,
  recordPayment,
} from "../api/payments";
import type { CreatePaymentRequest } from "../types/payment.types";

export function usePayments(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["payments", invoiceId],
    queryFn: () => fetchPaymentsForInvoice(invoiceId!),
    enabled: !!invoiceId,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invoiceId,
      data,
    }: {
      invoiceId: string;
      data: CreatePaymentRequest;
    }) => recordPayment(invoiceId, data),
    onSuccess: (_updated, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ["payments", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: () => {
      // Backend BusinessException (e.g. overpayment) is exposed through
      // mutation.error and rendered by the form's destructive Alert.
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: (_updated, id) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: () => {
      // Error rendered via mutation.error in the component.
    },
  });
}
