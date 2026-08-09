import { useQuery } from "@tanstack/react-query";
import { fetchDepartment } from "../api/departments";

export function useDepartment(id: string | undefined) {
  return useQuery({
    queryKey: ["department", id],
    queryFn: () => fetchDepartment(id!),
    enabled: !!id,
  });
}
