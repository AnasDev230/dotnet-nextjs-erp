import { useQuery } from "@tanstack/react-query";
import { fetchEmployeesForDropdown } from "../api/employees";

export function useEmployeesForDropdown() {
  return useQuery({
    queryKey: ["employees-dropdown"],
    queryFn: fetchEmployeesForDropdown,
    staleTime: 5 * 60 * 1000,
  });
}
