import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import { upsertInventoryLevel } from "../api/inventory-levels";
import type { UpsertInventoryLevelRequest } from "../types/inventory-level.types";

export function useUpsertInventoryLevel() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: UpsertInventoryLevelRequest) => upsertInventoryLevel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
      success(t("toast.saved"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}
