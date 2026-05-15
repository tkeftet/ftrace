import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi } from "@/api/endpoints/menu.api";
import { menuKeys } from "@/api/queryKeys";

export function useDeleteMenuItem(categoryId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuApi.deleteItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: menuKeys.items(categoryId) });
    },
  });
}
