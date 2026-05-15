import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ASSIGNABLE_ROLES,
  STAFF_ROLE_LABELS,
  type StaffMember,
} from "@/types/staff.types";
import {
  createStaffSchema,
  editStaffSchema,
  type CreateStaffForm,
  type EditStaffForm,
} from "../../schemas/staffSchemas";

// ── Create Dialog ──────────────────────────────────────────────────
interface CreateStaffDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffForm) => void;
}

export function CreateStaffDialog({
  open,
  loading,
  onClose,
  onSubmit,
}: CreateStaffDialogProps) {
  const { control, handleSubmit, reset } = useForm<CreateStaffForm>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: { name: "", email: "", password: "", role: "waiter" },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Add Staff Member</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          id="create-staff-form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Full Name"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Role"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {STAFF_ROLE_LABELS[r]}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          type="submit"
          form="create-staff-form"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Adding…" : "Add Member"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Edit Dialog ────────────────────────────────────────────────────
interface EditStaffDialogProps {
  editTarget: StaffMember | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: EditStaffForm) => void;
}

export function EditStaffDialog({
  editTarget,
  loading,
  onClose,
  onSubmit,
}: EditStaffDialogProps) {
  const { control, handleSubmit, reset } = useForm<EditStaffForm>({
    resolver: zodResolver(editStaffSchema),
    values: editTarget
      ? {
          name: editTarget.name,
          email: editTarget.email,
          role: editTarget.role,
          password: "",
        }
      : undefined,
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={!!editTarget} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Edit Staff Member</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          id="edit-staff-form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Full Name"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Role"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {STAFF_ROLE_LABELS[r]}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="New Password (leave blank to keep)"
                type="password"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          type="submit"
          form="edit-staff-form"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Saving…" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
