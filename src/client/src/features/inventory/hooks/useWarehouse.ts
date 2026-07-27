import { useQuery } from "@tanstack/react-query";
import { fetchWarehouse } from "../api/warehouses";

export function useWarehouse(id: string | undefined) {
  return useQuery({
    queryKey: ["warehouse", id],
    queryFn: () => fetchWarehouse(id!),
    enabled: !!id,
  });
}
