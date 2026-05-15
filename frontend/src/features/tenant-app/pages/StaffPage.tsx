import { useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { StaffTable } from "../components/staff/StaffTable";
import {
  CreateStaffDialog,
  EditStaffDialog,
} from "../components/staff/StaffDialogs";
import type { CreateStaffForm, EditStaffForm } from "../schemas/staffSchemas";

import {
  useStaff,
  useCreateStaff,
  useUpdateStaff,
  useToggleStaff,
} from "../hooks/staff";
import { type StaffMember } from "@/types/staff.types";
import { useSnackbar } from "@/hooks/useSnackbar";
import { AppSnackbar } from "@/components/common/AppSnackbar";
import { extractError } from "@/utils/extractError";

export default function StaffPage() {
  const { data: staff = [], isLoading } = useStaff();
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const toggleMutation = useToggleStaff();
  const { snackbar, show, close } = useSnackbar();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);

  const handleCreate = (data: CreateStaffForm) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        show("Staff member added.", "success");
        setCreateOpen(false);
      },
      onError: (err) => show(extractError(err), "error"),
    });
  };

  const handleEdit = (data: EditStaffForm) => {
    if (!editTarget) return;
    const payload = {
      name: data.name,
      email: data.email,
      role: data.role,
      ...(data.password ? { password: data.password } : {}),
    };
    updateMutation.mutate(
      { id: editTarget._id, payload },
      {
        onSuccess: () => {
          show("Staff member updated.", "success");
          setEditTarget(null);
        },
        onError: (err) => show(extractError(err), "error"),
      },
    );
  };

  const handleToggle = (member: StaffMember) => {
    toggleMutation.mutate(
      { id: member._id, active: !member.isActive },
      {
        onSuccess: () =>
          show(
            member.isActive ? "Staff deactivated." : "Staff reactivated.",
            "success",
          ),
        onError: () => show("Failed to update status.", "error"),
      },
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Staff Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your team members and their roles.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Add Staff
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" pt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <StaffTable
          staff={staff}
          togglePending={toggleMutation.isPending}
          onEdit={setEditTarget}
          onToggle={handleToggle}
        />
      )}

      <CreateStaffDialog
        open={createOpen}
        loading={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <EditStaffDialog
        editTarget={editTarget}
        loading={updateMutation.isPending}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </Box>
  );
}
