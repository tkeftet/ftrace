import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/api/endpoints/staff.api";
import { staffKeys } from "@/api/queryKeys";
import type { UpdateStaffPayload } from "@/types/staff.types";

export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStaffPayload;
    }) => staffApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.list() });
    },
  });
}
