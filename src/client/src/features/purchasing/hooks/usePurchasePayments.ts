import { useQuery } from "@tanstack/react-query";
import {
  fetchPurchasePayments,
  type FetchPurchasePaymentsParams,
} from "../api/purchase-payments";

export function usePurchasePayments(
  params: FetchPurchasePaymentsParams = {}
) {
  return useQuery({
    queryKey: ["purchase-payments", params],
    queryFn: () => fetchPurchasePayments(params),
  });
}