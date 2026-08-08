export interface ProductSupplierListItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  supplierSku: string | null;
  leadTimeDays: number;
  unitCost: number;
  isPrimary: boolean;
}

export interface ProductSupplierDetail {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  supplierSku: string | null;
  leadTimeDays: number;
  minOrderQty: number;
  unitCost: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface CreateProductSupplierRequest {
  productId: string;
  supplierId: string;
  supplierSku?: string | null;
  leadTimeDays: number;
  minOrderQty: number;
  unitCost: number;
  isPrimary: boolean;
}

export interface UpdateProductSupplierRequest {
  supplierSku?: string | null;
  leadTimeDays: number;
  minOrderQty: number;
  unitCost: number;
  isPrimary: boolean;
}
