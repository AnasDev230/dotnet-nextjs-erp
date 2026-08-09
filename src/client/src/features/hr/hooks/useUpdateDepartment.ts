import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDepartment } from "../api/departments";
import type { UpdateDepartmentRequest } from "@/types/hr";

export function useUpdateDepartment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDepartmentRequest) => updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["department", id] });
    },
  });
}
