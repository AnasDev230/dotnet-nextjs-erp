import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategory } from "../api/categories";
import type { UpdateCategoryRequest } from "../types/category.types";

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCategoryRequest) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["category", id] });
    },
  });
}
