import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  DashboardStats,
  RecentOrder,
  RecentInvoice,
  LowStockItem,
} from "@/types/dashboard";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<ApiResponse<DashboardStats>>(
    "/dashboard/stats"
  );
  return response.data.data;
}

export async function fetchRecentOrders(
  count: number = 5
): Promise<RecentOrder[]> {
  const response = await apiClient.get<ApiResponse<RecentOrder[]>>(
    `/dashboard/recent-orders`,
    { params: { count } }
  );
  return response.data.data;
}

export async function fetchRecentInvoices(
  count: number = 5
): Promise<RecentInvoice[]> {
  const response = await apiClient.get<ApiResponse<RecentInvoice[]>>(
    `/dashboard/recent-invoices`,
    { params: { count } }
  );
  return response.data.data;
}

export async function fetchLowStockItems(
  count: number = 10
): Promise<LowStockItem[]> {
  const response = await apiClient.get<ApiResponse<LowStockItem[]>>(
    `/dashboard/low-stock`,
    { params: { count } }
  );
  return response.data.data;
}
