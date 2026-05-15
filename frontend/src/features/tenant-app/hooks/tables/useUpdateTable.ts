import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tableApi, type UpdateTablePayload } from "@/api/endpoints/table.api";
import { tableKeys } from "@/api/queryKeys";

export function useUpdateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTablePayload }) =>
      tableApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tableKeys.list() });
    },
  });
}
