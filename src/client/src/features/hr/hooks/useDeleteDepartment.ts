import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDepartment } from "../api/departments";

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
