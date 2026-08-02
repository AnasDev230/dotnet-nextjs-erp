import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSalesOrder } from "../api/sales-orders";
import type { CreateSalesOrderRequest } from "../types/sales-order.types";

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSalesOrderRequest) => createSalesOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
    },
  });
}
