import { useQuery } from "@tanstack/react-query";
import { fetchWarehousesForDropdown } from "../api/warehouses";

export function useWarehousesForDropdown() {
  return useQuery({
    queryKey: ["warehouses-dropdown"],
    queryFn: fetchWarehousesForDropdown,
    staleTime: 5 * 60 * 1000,
  });
}
