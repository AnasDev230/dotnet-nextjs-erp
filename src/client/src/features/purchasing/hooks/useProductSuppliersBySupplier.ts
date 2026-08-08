import { useQuery } from "@tanstack/react-query";
import { fetchProductSuppliersBySupplier } from "../api/product-suppliers";

export function useProductSuppliersBySupplier(supplierId: string | undefined) {
  return useQuery({
    queryKey: ["product-suppliers-by-supplier", supplierId],
    queryFn: () => fetchProductSuppliersBySupplier(supplierId!),
    enabled: !!supplierId,
  });
}