import { useQuery } from "@tanstack/react-query";
import { fetchStockTransfers, type FetchStockTransfersParams } from "../api/stock-transfers";

export function useStockTransfers(params: FetchStockTransfersParams = {}) {
  return useQuery({
    queryKey: ["stock-transfers", params],
    queryFn: () => fetchStockTransfers(params),
  });
}