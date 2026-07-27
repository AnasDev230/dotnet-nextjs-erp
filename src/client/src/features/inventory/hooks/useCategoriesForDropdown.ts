import { useQuery } from "@tanstack/react-query";
import { fetchCategoriesForDropdown } from "../api/categories";

export function useCategoriesForDropdown() {
  return useQuery({
    queryKey: ["categories-dropdown"],
    queryFn: fetchCategoriesForDropdown,
    staleTime: 5 * 60 * 1000,
  });
}
