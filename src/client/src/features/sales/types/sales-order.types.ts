export type SalesOrderStatus = "Draft" | "Confirmed" | "Cancelled";

export interface SalesOrderItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesOrderRequest {
  customerId: string;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
  items: SalesOrderItemRequest[];
}

export interface UpdateSalesOrderRequest {
  customerId: string;
  orderDate: string;
  deliveryDate?: string;
  status: SalesOrderStatus;
  notes?: string;
  items: SalesOrderItemRequest[];
}

export interface SalesOrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SalesOrderResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  deliveryDate: string | null;
  status: SalesOrderStatus;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  items: SalesOrderItemResponse[];
}

export interface SalesOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  status: SalesOrderStatus;
  totalAmount: number;
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
