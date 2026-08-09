import { useQuery } from "@tanstack/react-query";
import type { ReportQueryParams } from "@/types/reports";
import {
  fetchSalesSummary,
  fetchPurchasesSummary,
  fetchInventorySummary,
  fetchCustomerStatement,
  fetchEmployeesSummary,
} from "../api/reports";

export function useSalesSummary(params?: ReportQueryParams) {
  return useQuery({
    queryKey: ["reports", "sales", params],
    queryFn: () => fetchSalesSummary(params),
    enabled: true,
  });
}

export function usePurchasesSummary(params?: ReportQueryParams) {
  return useQuery({
    queryKey: ["reports", "purchases", params],
    queryFn: () => fetchPurchasesSummary(params),
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: ["reports", "inventory"],
    queryFn: fetchInventorySummary,
  });
}

export function useCustomerStatement(customerId: string | null) {
  return useQuery({
    queryKey: ["reports", "customer-statement", customerId],
    queryFn: () => fetchCustomerStatement(customerId as string),
    enabled: !!customerId,
  });
}

export function useEmployeesSummary() {
  return useQuery({
    queryKey: ["reports", "employees"],
    queryFn: fetchEmployeesSummary,
  });
}