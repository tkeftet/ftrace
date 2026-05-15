import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi, type CreateCategoryPayload } from "@/api/endpoints/menu.api";
import { menuKeys } from "@/api/queryKeys";

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      menuApi.createCategory(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: menuKeys.categories() });
    },
  });
}
