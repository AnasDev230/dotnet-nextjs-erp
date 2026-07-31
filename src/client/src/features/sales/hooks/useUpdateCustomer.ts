import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCustomer } from "../api/customers";
import type { UpdateCustomerRequest } from "../types/customer.types";

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCustomerRequest) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
    },
  });
}
