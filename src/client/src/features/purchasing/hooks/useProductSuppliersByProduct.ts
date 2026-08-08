import { useQuery } from "@tanstack/react-query";
import { fetchProductSuppliersByProduct } from "../api/product-suppliers";

export function useProductSuppliersByProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ["product-suppliers-by-product", productId],
    queryFn: () => fetchProductSuppliersByProduct(productId!),
    enabled: !!productId,
  });
}