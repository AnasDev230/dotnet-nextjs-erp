import { useQuery } from "@tanstack/react-query";
import { fetchSuppliers, type FetchSuppliersParams } from "../api/suppliers";

export function useSuppliers(params: FetchSuppliersParams = {}) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => fetchSuppliers(params),
  });
}