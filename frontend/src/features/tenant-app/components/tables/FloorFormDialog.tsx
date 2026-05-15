import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { extractError } from "@/utils/extractError";
import { useCreateFloor, useUpdateFloor } from "../../hooks/floors";
import type { Floor } from "@/api/endpoints/floor.api";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});
type FormValues = z.infer<typeof schema>;

interface FloorFormDialogProps {
  open: boolean;
  onClose: () => void;
  editingFloor: Floor | null;
  onSuccess: (msg: string) => void;
}

export function FloorFormDialog({
  open,
  onClose,
  editingFloor,
  onSuccess,
}: FloorFormDialogProps) {
  const createFloor = useCreateFloor();
  const updateFloor = useUpdateFloor();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const handleEnter = () => {
    reset({ name: editingFloor?.name ?? "" });
  };

  const onSubmit = (data: FormValues) => {
    if (editingFloor) {
      updateFloor.mutate(
        { id: editingFloor._id, name: data.name },
        {
          onSuccess: () => {
            onSuccess("Floor updated.");
            onClose();
          },
          onError: (err) => onSuccess(extractError(err)),
        },
      );
    } else {
      createFloor.mutate(
        { name: data.name },
        {
          onSuccess: () => {
            onSuccess("Floor added.");
            onClose();
          },
          onError: (err) => onSuccess(extractError(err)),
        },
      );
    }
  };

  const isPending = createFloor.isPending || updateFloor.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      TransitionProps={{ onEnter: handleEnter }}
    >
      <DialogTitle fontWeight={800}>
        {editingFloor ? "Edit Floor" : "Add Floor"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Floor name *"
                placeholder="e.g. Main Hall, Terrace, Rooftop…"
                size="small"
                fullWidth
                autoFocus
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isPending}
          onClick={handleSubmit(onSubmit)}
          sx={{ bgcolor: "#b45309", "&:hover": { bgcolor: "#92400e" } }}
        >
          {isPending ? <CircularProgress size={18} color="inherit" /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
