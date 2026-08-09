import { useQuery } from "@tanstack/react-query";
import { fetchDepartments, type FetchDepartmentsParams } from "../api/departments";

export function useDepartments(params: FetchDepartmentsParams = {}) {
  return useQuery({
    queryKey: ["departments", params],
    queryFn: () => fetchDepartments(params),
  });
}
