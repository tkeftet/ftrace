import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantApi } from "@/api/endpoints/tenant.api";
import { tenantKeys } from "@/api/queryKeys";
import type { UpdateTenantPayload } from "../types";

export function useUpdateTenant(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTenantPayload) =>
      tenantApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(id) });
    },
  });
}
