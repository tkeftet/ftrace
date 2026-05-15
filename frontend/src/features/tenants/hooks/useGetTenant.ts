import { useQuery } from "@tanstack/react-query";
import { tenantApi } from "@/api/endpoints/tenant.api";
import { tenantKeys } from "@/api/queryKeys";

export function useGetTenant(id: string) {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => tenantApi.getById(id).then((r) => r.data),
    enabled: Boolean(id),
  });
}
