import { useQuery } from "@tanstack/react-query";
import {
  fetchSupplierInvoices,
  type FetchSupplierInvoicesParams,
} from "../api/supplier-invoices";

export function useSupplierInvoices(
  params: FetchSupplierInvoicesParams = {}
) {
  return useQuery({
    queryKey: ["supplier-invoices", params],
    queryFn: () => fetchSupplierInvoices(params),
  });
}