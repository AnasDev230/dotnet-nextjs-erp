import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type FetchCategoriesParams } from "../api/categories";

export function useCategories(params: FetchCategoriesParams = {}) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => fetchCategories(params),
  });
}
