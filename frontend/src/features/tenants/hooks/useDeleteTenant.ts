import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantApi } from "@/api/endpoints/tenant.api";
import { tenantKeys } from "@/api/queryKeys";

interface Options {
  onSuccess?: () => void;
  onError?: () => void;
}

export function useDeleteTenant(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tenantApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      options?.onSuccess?.();
    },
    onError: () => {
      options?.onError?.();
    },
  });
}
