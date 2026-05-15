import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi, type UpdateMenuItemPayload } from "@/api/endpoints/menu.api";
import { menuKeys } from "@/api/queryKeys";

export function useUpdateMenuItem(categoryId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMenuItemPayload;
    }) => menuApi.updateItem(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: menuKeys.items(categoryId) });
    },
  });
}
