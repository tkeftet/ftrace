import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi, type CreateMenuItemPayload } from "@/api/endpoints/menu.api";
import { menuKeys } from "@/api/queryKeys";

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMenuItemPayload) =>
      menuApi.createItem(payload).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: menuKeys.items(variables.category) });
    },
  });
}
