import { useQuery } from "@tanstack/react-query";
import { fetchSuppliersForDropdown } from "../api/suppliers";

export function useSuppliersForDropdown() {
  return useQuery({
    queryKey: ["suppliers-dropdown"],
    queryFn: fetchSuppliersForDropdown,
    staleTime: 5 * 60 * 1000,
  });
}