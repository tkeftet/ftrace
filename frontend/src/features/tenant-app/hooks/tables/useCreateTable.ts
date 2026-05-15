import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tableApi, type CreateTablePayload } from "@/api/endpoints/table.api";
import { tableKeys } from "@/api/queryKeys";

export function useCreateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTablePayload) =>
      tableApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tableKeys.list() });
    },
  });
}
