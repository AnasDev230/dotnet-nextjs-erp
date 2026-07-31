import { useQuery } from "@tanstack/react-query";
import { fetchCustomers, type FetchCustomersParams } from "../api/customers";

export function useCustomers(params: FetchCustomersParams = {}) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => fetchCustomers(params),
  });
}
