import { useMutation, useQueryClient } from "@tanstack/react-query";
import { floorApi } from "@/api/endpoints/floor.api";
import { floorKeys } from "@/api/queryKeys";

export function useCreateFloor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) =>
      floorApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: floorKeys.list() });
    },
  });
}
