import { useQuery } from "@tanstack/react-query";
import { fetchProducts, type FetchProductsParams } from "../api/products";

export function useProducts(params: FetchProductsParams = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
  });
}
