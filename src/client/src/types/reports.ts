export interface ReportQueryParams {
  fromDate?: string;
  toDate?: string;
  entityId?: string;
}

export interface SalesByPeriodItem {
  period: string;
  revenue: number;
  orderCount: number;
}

export interface TopCustomerItem {
  customerId: string;
  customerName: string;
  totalAmount: number;
  orderCount: number;
}

export interface SalesSummaryResponse {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  byPeriod: SalesByPeriodItem[];
  topCustomers: TopCustomerItem[];
}

export interface PurchasesByPeriodItem {
  period: string;
  spending: number;
  orderCount: number;
}

export interface TopSupplierItem {
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  orderCount: number;
}

export interface PurchasesSummaryResponse {
  totalSpending: number;
  totalOrders: number;
  averageOrderValue: number;
  totalSuppliers: number;
  byPeriod: PurchasesByPeriodItem[];
  topSuppliers: TopSupplierItem[];
}

export interface StockByWarehouseItem {
  warehouseId: string;
  warehouseName: string;
  productCount: number;
  totalValue: number;
}

export interface LowStockItem {
  productId: string;
  productName: string;
  sku: string;
  warehouseName: string;
  quantityOnHand: number;
  reorderLevel: number;
}

export interface InventorySummaryResponse {
  totalProducts: number;
  totalWarehouses: number;
  totalInventoryValue: number;
  lowStockCount: number;
  byWarehouse: StockByWarehouseItem[];
  lowStockItems: LowStockItem[];
}

export type StatementLineType = "Invoice" | "Payment";

export interface StatementLineItem {
  date: string;
  type: StatementLineType;
  reference: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface CustomerStatementResponse {
  customerId: string;
  customerName: string;
  customerCode: string | null;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  transactions: StatementLineItem[];
}

export interface EmployeesByDepartmentItem {
  departmentId: string | null;
  departmentName: string;
  employeeCount: number;
  totalSalaries: number;
}

export interface EmployeesSummaryResponse {
  totalEmployees: number;
  activeCount: number;
  onLeaveCount: number;
  terminatedCount: number;
  totalSalaries: number;
  byDepartment: EmployeesByDepartmentItem[];
}