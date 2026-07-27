import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWarehouse } from "../api/warehouses";

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouses-dropdown"] });
    },
  });
}
