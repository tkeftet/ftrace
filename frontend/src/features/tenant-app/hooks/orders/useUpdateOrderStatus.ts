import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi, type OrderStatus } from "@/api/endpoints/order.api";
import { orderKeys } from "@/api/queryKeys";

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderApi.updateStatus(id, status).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
