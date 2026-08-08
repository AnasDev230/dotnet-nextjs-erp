import { useQuery } from "@tanstack/react-query";
import {
  fetchGoodsReceipts,
  type FetchGoodsReceiptsParams,
} from "../api/goods-receipts";

export function useGoodsReceipts(params: FetchGoodsReceiptsParams = {}) {
  return useQuery({
    queryKey: ["goods-receipts", params],
    queryFn: () => fetchGoodsReceipts(params),
  });
}