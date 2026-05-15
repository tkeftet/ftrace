import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionApi } from "@/api/endpoints/section.api";
import { sectionKeys, tableKeys } from "@/api/queryKeys";

export function useDeleteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sectionApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sectionKeys.list() });
      // Tables may have been unassigned by the server
      qc.invalidateQueries({ queryKey: tableKeys.list() });
    },
  });
}
