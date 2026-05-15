import { useQuery } from "@tanstack/react-query";
import { menuApi } from "@/api/endpoints/menu.api";
import { menuKeys } from "@/api/queryKeys";

export function useMenuItems(categoryId?: string) {
  return useQuery({
    queryKey: menuKeys.items(categoryId),
    queryFn: () => menuApi.getItems(categoryId).then((r) => r.data),
    enabled: !!categoryId,
  });
}
