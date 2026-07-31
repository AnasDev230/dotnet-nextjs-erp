import { useQuery } from "@tanstack/react-query";
import { fetchCustomer } from "../api/customers";

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => fetchCustomer(id!),
    enabled: !!id,
  });
}
