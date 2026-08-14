import { useQuery } from "@tanstack/react-query";
import { searchGlobal } from "../api/search";
import { useDebounce } from "@/hooks/use-debounce";

export function useGlobalSearch(query: string, enabled: boolean) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => searchGlobal(debouncedQuery),
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 30_000,
  });
}