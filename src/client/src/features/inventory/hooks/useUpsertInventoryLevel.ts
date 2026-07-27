import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertInventoryLevel } from "../api/inventory-levels";
import type { UpsertInventoryLevelRequest } from "../types/inventory-level.types";

export function useUpsertInventoryLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertInventoryLevelRequest) => upsertInventoryLevel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
    },
  });
}
