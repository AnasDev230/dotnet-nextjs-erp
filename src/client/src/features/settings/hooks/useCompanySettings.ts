import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import {
  fetchCompanySettings,
  updateCompanySettings,
} from "../api/company-settings";
import type { UpdateCompanySettingsRequest } from "@/types/settings";

export function useCompanySettings() {
  return useQuery({
    queryKey: ["company-settings"],
    queryFn: fetchCompanySettings,
  });
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: UpdateCompanySettingsRequest) =>
      updateCompanySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
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