export type CustomerType = "Individual" | "Company";
export type CustomerStatus = "Active" | "Suspended";

export interface CustomerListItem {
  id: string;
  code: string;
  name: string;
  type: CustomerType;
  creditLimit: number;
  status: CustomerStatus;
  createdAt: string;
}

export interface CustomerDetail {
  id: string;
  code: string;
  name: string;
  type: CustomerType;
  taxNumber: string | null;
  creditLimit: number;
  paymentTerms: number;
  status: CustomerStatus;
  createdAt: string;
}

export interface CreateCustomerRequest {
  code: string;
  name: string;
  type: CustomerType;
  taxNumber?: string;
  creditLimit: number;
  paymentTerms: number;
}

export interface UpdateCustomerRequest {
  name: string;
  type: CustomerType;
  taxNumber?: string;
  creditLimit: number;
  paymentTerms: number;
  status: CustomerStatus;
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
