import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCustomer } from "../api/customers";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers-dropdown"] });
    },
  });
}
