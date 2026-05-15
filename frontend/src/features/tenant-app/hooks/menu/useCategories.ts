import { useQuery } from "@tanstack/react-query";
import { menuApi } from "@/api/endpoints/menu.api";
import { menuKeys } from "@/api/queryKeys";

export function useCategories() {
  return useQuery({
    queryKey: menuKeys.categories(),
    queryFn: () => menuApi.getCategories().then((r) => r.data),
  });
}
