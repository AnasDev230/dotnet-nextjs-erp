import { useQuery } from "@tanstack/react-query";
import { fetchWarehouses, type FetchWarehousesParams } from "../api/warehouses";

export function useWarehouses(params: FetchWarehousesParams = {}) {
  return useQuery({
    queryKey: ["warehouses", params],
    queryFn: () => fetchWarehouses(params),
  });
}
