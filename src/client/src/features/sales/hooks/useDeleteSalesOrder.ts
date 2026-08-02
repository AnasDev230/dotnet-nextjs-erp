import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSalesOrder } from "../api/sales-orders";

export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSalesOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
    },
  });
}
