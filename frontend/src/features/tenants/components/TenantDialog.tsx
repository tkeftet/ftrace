import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  addTenantSchema,
  editTenantSchema,
  type AddTenantFormValues,
} from "../schema";
import { useCreateTenant, useUpdateTenant } from "../hooks";
import { useSnackbar } from "@/hooks/useSnackbar";
import { AppSnackbar } from "@/components/common/AppSnackbar";
import { TenantFormFields } from "./TenantFormFields";
import type { Tenant, TenantOwner } from "../types";

// Both schemas infer to the same TypeScript shape — one unified type is enough
type TenantFormValues = AddTenantFormValues;

export type TenantDialogProps = {
  mode: "add" | "edit";
  tenant?: Tenant;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

function handleApiError(
  err: unknown,
  setError: (field: "slug" | "ownerEmail", err: { message: string }) => void,
  show: (msg: string, sev?: "error") => void,
  fallback: string,
) {
  const message =
    axios.isAxiosError(err) && err.response?.data?.error
      ? (err.response.data.error as string)
      : fallback;
  const lower = message.toLowerCase();
  if (lower.includes("slug")) setError("slug", { message });
  else if (lower.includes("email")) setError("ownerEmail", { message });
  show(message, "error");
}

export function TenantDialog({
  mode,
  tenant,
  open,
  onClose,
  onSuccess,
}: TenantDialogProps) {
  const isEdit = mode === "edit";
  const { snackbar, show, close: closeSnackbar } = useSnackbar();

  const owner =
    isEdit && tenant?.owner && typeof tenant.owner === "object"
      ? (tenant.owner as TenantOwner)
      : null;

  const defaultValues: Partial<TenantFormValues> =
    isEdit && tenant
      ? {
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
          ownerName: owner?.name ?? "",
          ownerEmail: owner?.email ?? "",
          ownerPassword: "",
          currency: tenant.currency ?? "MAD",
          timezone: tenant.timezone ?? "Africa/Casablanca",
        }
      : { plan: "free", currency: "MAD", timezone: "Africa/Casablanca" };

  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant(tenant?._id ?? "");
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(isEdit ? editTenantSchema : addTenantSchema),
    defaultValues,
  });

  // Re-populate form whenever the dialog opens (defaultValues only apply on mount,
  // but the dialog stays mounted with empty tenant until the first edit click)
  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tenant]);

  const onSubmit = async (values: TenantFormValues) => {
    if (isEdit && !isDirty) {
      show("No changes to save.", "info");
      onClose();
      return;
    }
    try {
      await mutation.mutateAsync(values);
      if (!isEdit) reset();
      onSuccess();
    } catch (err) {
      handleApiError(
        err,
        setError,
        show,
        isEdit
          ? "Failed to update tenant. Please try again."
          : "Failed to create tenant. Please try again.",
      );
    }
  };

  const handleClose = () => {
    reset(defaultValues);
    mutation.reset();
    closeSnackbar();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? "Edit Tenant" : "Add New Tenant"}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={3} mt={1}>
              <TenantFormFields
                register={register}
                control={control}
                errors={errors}
              />
              <TextField
                label={isEdit ? "New Password" : "Owner Password"}
                type="password"
                {...register("ownerPassword")}
                error={!!errors.ownerPassword}
                helperText={
                  errors.ownerPassword?.message ??
                  (isEdit ? "Leave blank to keep current password" : undefined)
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isEdit
                ? isSubmitting
                  ? "Saving..."
                  : "Save Changes"
                : isSubmitting
                  ? "Creating..."
                  : "Create Tenant"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </>
  );
}
