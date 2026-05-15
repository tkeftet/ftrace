import { useQuery } from "@tanstack/react-query";
import { floorApi } from "@/api/endpoints/floor.api";
import { floorKeys } from "@/api/queryKeys";

export function useFloors() {
  return useQuery({
    queryKey: floorKeys.list(),
    queryFn: () => floorApi.getAll().then((r) => r.data),
  });
}
