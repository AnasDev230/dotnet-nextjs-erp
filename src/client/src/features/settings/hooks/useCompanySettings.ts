import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  return useMutation({
    mutationFn: (data: UpdateCompanySettingsRequest) =>
      updateCompanySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
    },
  });
}