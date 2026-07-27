export interface ProductListItem {
  id: string;
  sku: string;
  name: string;
  categoryName: string | null;
  unitOfMeasure: string;
  reorderLevel: number;
  salePrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductDetail {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  unitOfMeasure: string;
  reorderLevel: number;
  reorderQty: number;
  salePrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  unitOfMeasure: string;
  reorderLevel: number;
  reorderQty: number;
  salePrice: number;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  categoryId?: string;
  unitOfMeasure: string;
  reorderLevel: number;
  reorderQty: number;
  salePrice: number;
  isActive: boolean;
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
