export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
}

export interface SearchResultResponse {
  employees: SearchResultItem[];
  customers: SearchResultItem[];
  suppliers: SearchResultItem[];
  products: SearchResultItem[];
  salesOrders: SearchResultItem[];
  purchaseOrders: SearchResultItem[];
  invoices: SearchResultItem[];
  departments: SearchResultItem[];
  warehouses: SearchResultItem[];
}