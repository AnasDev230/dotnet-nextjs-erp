export enum StockTransferStatus {
  Draft = 0,
  Submitted = 1,
  Approved = 2,
  Completed = 3,
  Cancelled = 4,
}

export interface StockTransferListItem {
  id: string;
  transferNumber: string;
  fromWarehouseName: string;
  toWarehouseName: string;
  productName: string;
  quantity: number;
  status: StockTransferStatus;
  createdAt: string;
}

export interface StockTransferDetail {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  status: StockTransferStatus;
  approvedByName?: string;
  approvedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  createdByName?: string;
}

export interface CreateStockTransferRequest {
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantity: number;
  notes?: string;
}

export type UpdateStockTransferRequest = CreateStockTransferRequest;