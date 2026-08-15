import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import { updateWarehouse } from "../api/warehouses";
import type { UpdateWarehouseRequest } from "../types/warehouse.types";

export function useUpdateWarehouse(id: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: UpdateWarehouseRequest) => updateWarehouse(id, data),
    onSuccess: (_updated, data) => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouses-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse", id] });
      success(t("toast.updated"), data.name);
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}
