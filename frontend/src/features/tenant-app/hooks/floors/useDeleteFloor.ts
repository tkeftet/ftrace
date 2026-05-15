import { useMutation, useQueryClient } from "@tanstack/react-query";
import { floorApi } from "@/api/endpoints/floor.api";
import { floorKeys } from "@/api/queryKeys";

export function useDeleteFloor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => floorApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: floorKeys.list() });
    },
  });
}
