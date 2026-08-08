export type SupplierStatus = "Active" | "Suspended";

export interface SupplierListItem {
  id: string;
  code: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  paymentTerms: number;
  rating: number;
  status: SupplierStatus;
}

export interface SupplierDetail {
  id: string;
  code: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  taxNumber: string | null;
  paymentTerms: number;
  rating: number;
  status: SupplierStatus;
  createdAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  taxNumber?: string | null;
  paymentTerms: number;
  rating: number;
}

export interface UpdateSupplierRequest {
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  taxNumber?: string | null;
  paymentTerms: number;
  rating: number;
}
