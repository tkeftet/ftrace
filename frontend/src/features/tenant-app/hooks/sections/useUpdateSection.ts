import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionApi } from "@/api/endpoints/section.api";
import { sectionKeys } from "@/api/queryKeys";

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      sectionApi.update(id, { name }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sectionKeys.list() });
    },
  });
}
