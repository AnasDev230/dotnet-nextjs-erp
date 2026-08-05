import { useQuery } from "@tanstack/react-query";
import { fetchInventoryLevels, type FetchInventoryLevelsParams } from "../api/inventory-levels";

export function useInventoryLevels(
  params: FetchInventoryLevelsParams = {},
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: ["inventory-levels", params],
    queryFn: () => fetchInventoryLevels(params),
    ...options,
  });
}
