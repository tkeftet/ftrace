import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantApi } from "@/api/endpoints/tenant.api";
import { tenantKeys } from "@/api/queryKeys";
import type { CreateTenantPayload } from "../types";

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTenantPayload) =>
      tenantApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}
