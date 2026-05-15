import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi, type OrderStatus } from "@/api/endpoints/order.api";
import { orderKeys } from "@/api/queryKeys";

export function useUpdateRoundStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      roundNumber,
      status,
    }: {
      id: string;
      roundNumber: number;
      status: OrderStatus;
    }) => orderApi.updateRoundStatus(id, roundNumber, status).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
