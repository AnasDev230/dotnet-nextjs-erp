import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import { updateCustomer } from "../api/customers";
import type { UpdateCustomerRequest } from "../types/customer.types";

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: UpdateCustomerRequest) => updateCustomer(id, data),
    onSuccess: (_updated, data) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
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
