import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/api/endpoints/staff.api";
import { staffKeys } from "@/api/queryKeys";

export function useToggleStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active
        ? staffApi.reactivate(id).then((r) => r.data)
        : staffApi.deactivate(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.list() });
    },
  });
}
