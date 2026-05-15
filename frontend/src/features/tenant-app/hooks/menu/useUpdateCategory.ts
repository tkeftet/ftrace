import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi, type UpdateCategoryPayload } from "@/api/endpoints/menu.api";
import { menuKeys } from "@/api/queryKeys";

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCategoryPayload;
    }) => menuApi.updateCategory(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: menuKeys.categories() });
    },
  });
}
