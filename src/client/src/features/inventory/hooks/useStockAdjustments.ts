import { useQuery } from "@tanstack/react-query";
import { fetchStockAdjustments, type FetchStockAdjustmentsParams } from "../api/stock-adjustments";

export function useStockAdjustments(params: FetchStockAdjustmentsParams = {}) {
  return useQuery({
    queryKey: ["stock-adjustments", params],
    queryFn: () => fetchStockAdjustments(params),
  });
}
