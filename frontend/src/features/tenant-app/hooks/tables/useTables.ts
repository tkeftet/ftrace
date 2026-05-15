import { useQuery } from "@tanstack/react-query";
import { tableApi } from "@/api/endpoints/table.api";
import { tableKeys } from "@/api/queryKeys";

export function useTables() {
  return useQuery({
    queryKey: tableKeys.list(),
    queryFn: () => tableApi.getAll().then((r) => r.data),
  });
}
