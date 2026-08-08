import { useQuery } from "@tanstack/react-query";
import { fetchGoodsReceipt } from "../api/goods-receipts";

export function useGoodsReceipt(id: string | undefined) {
  return useQuery({
    queryKey: ["goods-receipt", id],
    queryFn: () => fetchGoodsReceipt(id!),
    enabled: !!id,
  });
}