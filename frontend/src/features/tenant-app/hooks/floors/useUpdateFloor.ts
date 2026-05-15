import { useMutation, useQueryClient } from "@tanstack/react-query";
import { floorApi } from "@/api/endpoints/floor.api";
import { floorKeys } from "@/api/queryKeys";

export function useUpdateFloor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      floorApi.update(id, { name }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: floorKeys.list() });
    },
  });
}
