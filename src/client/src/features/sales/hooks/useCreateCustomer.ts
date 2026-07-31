import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomer } from "../api/customers";
import type { CreateCustomerRequest } from "../types/customer.types";

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers-dropdown"] });
    },
  });
}
