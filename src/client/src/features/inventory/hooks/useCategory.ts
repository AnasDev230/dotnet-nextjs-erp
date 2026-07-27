import { useQuery } from "@tanstack/react-query";
import { fetchCategory } from "../api/categories";

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => fetchCategory(id!),
    enabled: !!id,
  });
}
