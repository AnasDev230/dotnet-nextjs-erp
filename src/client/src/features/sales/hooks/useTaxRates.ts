import { useQuery } from "@tanstack/react-query";
import { fetchTaxRates } from "../api/tax-rates";

export function useTaxRates() {
  return useQuery({
    queryKey: ["tax-rates"],
    queryFn: fetchTaxRates,
    staleTime: 10 * 60 * 1000,
  });
}
