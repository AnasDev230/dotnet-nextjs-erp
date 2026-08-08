import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSupplier } from "../api/suppliers";

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers-dropdown"] });
    },
  });
}