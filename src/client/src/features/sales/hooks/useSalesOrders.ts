import { useQuery } from "@tanstack/react-query";
import {
  fetchSalesOrders,
  type FetchSalesOrdersParams,
} from "../api/sales-orders";

export function useSalesOrders(params: FetchSalesOrdersParams = {}) {
  return useQuery({
    queryKey: ["sales-orders", params],
    queryFn: () => fetchSalesOrders(params),
  });
}
