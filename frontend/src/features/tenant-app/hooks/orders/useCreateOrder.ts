import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  orderApi,
  type CreateOrderPayload,
  type CreateOrderResponse,
} from "@/api/endpoints/order.api";
import { orderKeys } from "@/api/queryKeys";

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      orderApi.create(payload).then((r) => r.data as CreateOrderResponse),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
