import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tableApi } from "@/api/endpoints/table.api";
import { tableKeys } from "@/api/queryKeys";

export function useDeleteTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tableApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tableKeys.list() });
    },
  });
}
