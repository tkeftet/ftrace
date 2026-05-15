import { useQuery } from "@tanstack/react-query";
import { orderApi, type OrderStatus } from "@/api/endpoints/order.api";
import { orderKeys } from "@/api/queryKeys";

export function useOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: orderKeys.list(status),
    queryFn: () => orderApi.getAll(status).then((r) => r.data),
    refetchInterval: 15_000, // poll every 15 s so live orders stay fresh
  });
}
