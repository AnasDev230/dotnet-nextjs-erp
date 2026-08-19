import { useQuery } from "@tanstack/react-query";
import { fetchSupplierInvoice } from "../api/supplier-invoices";

export function useSupplierInvoice(id: string) {
  return useQuery({
    queryKey: ["supplier-invoice", id],
    queryFn: () => fetchSupplierInvoice(id),
    enabled: !!id,
  });
}