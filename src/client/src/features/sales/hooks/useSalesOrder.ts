import { useQuery } from "@tanstack/react-query";
import { fetchSalesOrder } from "../api/sales-orders";

export function useSalesOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["sales-order", id],
    queryFn: () => fetchSalesOrder(id!),
    enabled: !!id,
  });
}
