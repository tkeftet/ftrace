import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi } from "@/api/endpoints/menu.api";
import { menuKeys } from "@/api/queryKeys";

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuApi.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}
