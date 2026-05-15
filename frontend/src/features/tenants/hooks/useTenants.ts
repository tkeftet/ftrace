import { useQuery } from "@tanstack/react-query";
import { tenantApi } from "@/api/endpoints/tenant.api";
import { tenantKeys } from "@/api/queryKeys";

export function useTenants(page: number) {
  const list = useQuery({
    queryKey: tenantKeys.list(page),
    queryFn: () => tenantApi.getAll(page + 1).then((r) => r.data),
  });

  const stats = useQuery({
    queryKey: tenantKeys.stats(),
    queryFn: () => tenantApi.getAll(1, 1000).then((r) => r.data),
    staleTime: 60_000,
  });

  const statsActive =
    stats.data?.tenants.filter((t) => t.isActive).length ?? null;

  return { ...list, statsActive };
}
