import { useMutation, useQueryClient } from "@tanstack/react-query";
import { suspendSupplier } from "../api/suppliers";

export function useSuspendSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suspendSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers-dropdown"] });
    },
  });
}