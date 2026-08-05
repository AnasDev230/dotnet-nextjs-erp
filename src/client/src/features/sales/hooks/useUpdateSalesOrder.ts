import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSalesOrder } from "../api/sales-orders";
import type { UpdateSalesOrderRequest } from "../types/sales-order.types";

export function useUpdateSalesOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSalesOrderRequest) => updateSalesOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["sales-order", id] });
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
    },
    onError: () => {
      // Backend BusinessException (e.g. insufficient stock) is exposed through
      // mutation.error and rendered by the form's destructive Alert.
    },
  });
}
