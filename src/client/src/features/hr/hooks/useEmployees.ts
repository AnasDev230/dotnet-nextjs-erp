import { useQuery } from "@tanstack/react-query";
import { fetchEmployees, type FetchEmployeesParams } from "../api/employees";

export function useEmployees(params: FetchEmployeesParams = {}) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => fetchEmployees(params),
  });
}
