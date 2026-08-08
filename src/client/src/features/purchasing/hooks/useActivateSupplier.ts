import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateSupplier } from "../api/suppliers";

export function useActivateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers-dropdown"] });
    },
  });
}