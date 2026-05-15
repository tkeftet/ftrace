import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/api/endpoints/staff.api";
import { staffKeys } from "@/api/queryKeys";
import type { CreateStaffPayload } from "@/types/staff.types";

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) =>
      staffApi.create(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.list() });
    },
  });
}
