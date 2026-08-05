import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardStats,
  fetchRecentOrders,
  fetchRecentInvoices,
  fetchLowStockItems,
} from "../api/dashboard";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 60000,
  });
}

export function useRecentOrders(count: number = 5) {
  return useQuery({
    queryKey: ["dashboard-recent-orders", count],
    queryFn: () => fetchRecentOrders(count),
  });
}

export function useRecentInvoices(count: number = 5) {
  return useQuery({
    queryKey: ["dashboard-recent-invoices", count],
    queryFn: () => fetchRecentInvoices(count),
  });
}

export function useLowStockItems(count: number = 10) {
  return useQuery({
    queryKey: ["dashboard-low-stock", count],
    queryFn: () => fetchLowStockItems(count),
  });
}
