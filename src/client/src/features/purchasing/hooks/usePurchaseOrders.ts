import { useQuery } from "@tanstack/react-query";
import {
  fetchPurchaseOrders,
  type FetchPurchaseOrdersParams,
} from "../api/purchase-orders";

export function usePurchaseOrders(params: FetchPurchaseOrdersParams = {}) {
  return useQuery({
    queryKey: ["purchase-orders", params],
    queryFn: () => fetchPurchaseOrders(params),
  });
}