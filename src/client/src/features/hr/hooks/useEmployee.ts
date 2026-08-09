import { useQuery } from "@tanstack/react-query";
import { fetchEmployee } from "../api/employees";

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployee(id!),
    enabled: !!id,
  });
}
