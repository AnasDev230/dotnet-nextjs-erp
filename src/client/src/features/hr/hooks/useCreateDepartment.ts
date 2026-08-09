import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDepartment } from "../api/departments";
import type { CreateDepartmentRequest } from "@/types/hr";

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) => createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments-dropdown"] });
    },
  });
}
