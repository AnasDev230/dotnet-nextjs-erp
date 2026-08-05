export type SalesOrderStatus = "Draft" | "Confirmed" | "Cancelled";

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
}

export interface SalesOrderItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
}

export interface CreateSalesOrderRequest {
  customerId: string;
  warehouseId: string;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
  discountPct: number;
  taxRateId?: string;
  items: SalesOrderItemRequest[];
}

export interface UpdateSalesOrderRequest {
  customerId: string;
  warehouseId: string;
  orderDate: string;
  deliveryDate?: string;
  status: SalesOrderStatus;
  notes?: string;
  discountPct: number;
  taxRateId?: string;
  items: SalesOrderItemRequest[];
}

export interface SalesOrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  lineTotal: number;
}

export interface SalesOrderResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;
  orderDate: string;
  deliveryDate: string | null;
  status: SalesOrderStatus;
  totalAmount: number;
  notes: string | null;
  discountPct: number;
  discountAmount: number;
  taxRateId: string | null;
  taxRateName: string | null;
  taxPct: number;
  taxAmount: number;
  netAmount: number;
  subtotal: number;
  createdAt: string;
  items: SalesOrderItemResponse[];
}

export interface SalesOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  warehouseName: string;
  orderDate: string;
  status: SalesOrderStatus;
  totalAmount: number;
  netAmount: number;
  itemsCount: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
