import { useQuery } from "@tanstack/react-query";
import { fetchSupplier } from "../api/suppliers";

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => fetchSupplier(id!),
    enabled: !!id,
  });
}