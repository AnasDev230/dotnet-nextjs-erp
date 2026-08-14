const routeMap: Record<string, string> = {
  employee: "/hr/employees",
  customer: "/sales/customers",
  supplier: "/purchasing/suppliers",
  product: "/inventory/products",
  salesOrder: "/sales/orders",
  purchaseOrder: "/purchasing/orders",
  invoice: "/sales/invoices",
  department: "/hr/departments",
  warehouse: "/inventory/warehouses",
};

export function getSearchResultUrl(type: string, id: string): string {
  const base = routeMap[type];
  if (!base) return "/dashboard";
  return `${base}/${id}`;
}