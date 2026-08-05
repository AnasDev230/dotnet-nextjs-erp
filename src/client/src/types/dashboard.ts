import type { SalesOrderStatus } from "@/features/sales/types/sales-order.types";
import type { InvoiceStatus } from "@/features/finance/types/invoice.types";

export interface DashboardStats {
  totalSalesAmount: number;
  totalSalesCount: number;
  totalInvoicesAmount: number;
  totalInvoicesCount: number;
  totalPaidAmount: number;
  totalOutstandingAmount: number;
  overdueInvoicesCount: number;
  lowStockCount: number;
  totalProductsCount: number;
  totalCustomersCount: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  netAmount: number;
  status: SalesOrderStatus;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  issueDate: string;
  netAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  isOverdue: boolean;
}

export interface LowStockItem {
  productId: string;
  productName: string;
  sku: string;
  warehouseName: string;
  quantityOnHand: number;
  reorderLevel: number;
}
