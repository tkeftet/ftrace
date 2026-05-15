import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionApi } from "@/api/endpoints/section.api";
import { sectionKeys } from "@/api/queryKeys";

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) =>
      sectionApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sectionKeys.list() });
    },
  });
}
