import { useQuery } from "@tanstack/react-query";
import { fetchPurchaseOrder } from "../api/purchase-orders";

export function usePurchaseOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["purchase-order", id],
    queryFn: () => fetchPurchaseOrder(id!),
    enabled: !!id,
  });
}