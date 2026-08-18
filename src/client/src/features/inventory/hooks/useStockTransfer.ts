import { useQuery } from "@tanstack/react-query";
import { fetchStockTransfer } from "../api/stock-transfers";

export function useStockTransfer(id: string) {
  return useQuery({
    queryKey: ["stock-transfer", id],
    queryFn: () => fetchStockTransfer(id),
    enabled: !!id,
  });
}