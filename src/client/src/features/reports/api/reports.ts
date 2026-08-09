import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/auth";
import type {
  ReportQueryParams,
  SalesSummaryResponse,
  PurchasesSummaryResponse,
  InventorySummaryResponse,
  CustomerStatementResponse,
  EmployeesSummaryResponse,
} from "@/types/reports";

function buildParams(params?: ReportQueryParams) {
  if (!params) return undefined;
  return {
    fromDate: params.fromDate || undefined,
    toDate: params.toDate || undefined,
    entityId: params.entityId || undefined,
  };
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function fetchSalesSummary(
  params?: ReportQueryParams
): Promise<SalesSummaryResponse> {
  const response = await apiClient.get<ApiResponse<SalesSummaryResponse>>(
    "/reports/sales",
    { params }
  );
  return response.data.data;
}

export async function fetchPurchasesSummary(
  params?: ReportQueryParams
): Promise<PurchasesSummaryResponse> {
  const response = await apiClient.get<ApiResponse<PurchasesSummaryResponse>>(
    "/reports/purchases",
    { params }
  );
  return response.data.data;
}

export async function fetchInventorySummary(): Promise<InventorySummaryResponse> {
  const response = await apiClient.get<ApiResponse<InventorySummaryResponse>>(
    "/reports/inventory"
  );
  return response.data.data;
}

export async function fetchCustomerStatement(
  customerId: string
): Promise<CustomerStatementResponse> {
  const response = await apiClient.get<
    ApiResponse<CustomerStatementResponse>
  >(`/reports/customer-statement/${customerId}`);
  return response.data.data;
}

export async function fetchEmployeesSummary(): Promise<EmployeesSummaryResponse> {
  const response = await apiClient.get<ApiResponse<EmployeesSummaryResponse>>(
    "/reports/employees"
  );
  return response.data.data;
}

export async function downloadSalesCsv(
  params?: ReportQueryParams
): Promise<void> {
  const response = await apiClient.get<Blob>("/reports/export/sales", {
    params: buildParams(params),
    responseType: "blob",
  });
  downloadBlob(response.data, `sales-report-${new Date().toISOString().slice(0, 10)}.csv`);
}

export async function downloadPurchasesCsv(
  params?: ReportQueryParams
): Promise<void> {
  const response = await apiClient.get<Blob>("/reports/export/purchases", {
    params: buildParams(params),
    responseType: "blob",
  });
  downloadBlob(response.data, `purchases-report-${new Date().toISOString().slice(0, 10)}.csv`);
}

export async function downloadInventoryCsv(): Promise<void> {
  const response = await apiClient.get<Blob>("/reports/export/inventory", {
    responseType: "blob",
  });
  downloadBlob(response.data, `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`);
}

export async function downloadCustomerStatementCsv(
  customerId: string
): Promise<void> {
  const response = await apiClient.get<Blob>(
    `/reports/export/customer-statement/${customerId}`,
    { responseType: "blob" }
  );
  downloadBlob(response.data, `customer-statement-${new Date().toISOString().slice(0, 10)}.csv`);
}

export async function downloadEmployeesCsv(): Promise<void> {
  const response = await apiClient.get<Blob>("/reports/export/employees", {
    responseType: "blob",
  });
  downloadBlob(response.data, `employees-report-${new Date().toISOString().slice(0, 10)}.csv`);
}