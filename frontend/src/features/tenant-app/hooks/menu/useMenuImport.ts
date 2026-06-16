import { useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi } from "@/api/endpoints/menu.api";
import type { ExtractedCategory } from "@/api/endpoints/menu.api";
import { menuKeys } from "@/api/queryKeys";

export function useParsePdfMenu() {
  return useMutation({
    mutationFn: (file: File) => menuApi.parseMenu(file).then((r) => r.data),
  });
}

export function useConfirmMenuImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categories: ExtractedCategory[]) =>
      menuApi.confirmImport(categories).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.categories() });
      queryClient.invalidateQueries({ queryKey: menuKeys.items() });
    },
  });
}
