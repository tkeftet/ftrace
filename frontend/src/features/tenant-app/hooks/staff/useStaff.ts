import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/api/endpoints/staff.api";
import { staffKeys } from "@/api/queryKeys";

export function useStaff() {
  return useQuery({
    queryKey: staffKeys.list(),
    queryFn: () => staffApi.list().then((r) => r.data),
  });
}
