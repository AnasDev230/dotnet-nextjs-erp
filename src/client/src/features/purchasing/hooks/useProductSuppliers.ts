import { useQuery } from "@tanstack/react-query";
import {
  fetchProductSuppliers,
  type FetchProductSuppliersParams,
} from "../api/product-suppliers";

export function useProductSuppliers(params: FetchProductSuppliersParams = {}) {
  return useQuery({
    queryKey: ["product-suppliers", params],
    queryFn: () => fetchProductSuppliers(params),
  });
}
