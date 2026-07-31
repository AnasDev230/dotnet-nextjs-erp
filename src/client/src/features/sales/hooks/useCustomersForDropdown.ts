import { useQuery } from "@tanstack/react-query";
import { fetchCustomersForDropdown } from "../api/customers";

export function useCustomersForDropdown() {
  return useQuery({
    queryKey: ["customers-dropdown"],
    queryFn: fetchCustomersForDropdown,
    staleTime: 5 * 60 * 1000,
  });
}
