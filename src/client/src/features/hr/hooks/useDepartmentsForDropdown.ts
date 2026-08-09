import { useQuery } from "@tanstack/react-query";
import { fetchDepartmentsForDropdown } from "../api/departments";

export function useDepartmentsForDropdown() {
  return useQuery({
    queryKey: ["departments-dropdown"],
    queryFn: fetchDepartmentsForDropdown,
    staleTime: 5 * 60 * 1000,
  });
}
