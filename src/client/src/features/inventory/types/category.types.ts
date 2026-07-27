export interface CategoryListItem {
  id: string;
  code: string;
  name: string;
  parentName: string | null;
  productsCount: number;
  createdAt: string;
}

export interface CategoryDetail {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  productsCount: number;
  createdAt: string;
}

export interface CreateCategoryRequest {
  code: string;
  name: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  parentId?: string;
}
