import { useQuery } from "@tanstack/react-query";
import { sectionApi } from "@/api/endpoints/section.api";
import { sectionKeys } from "@/api/queryKeys";

export function useSections() {
  return useQuery({
    queryKey: sectionKeys.list(),
    queryFn: () => sectionApi.getAll().then((r) => r.data),
  });
}
