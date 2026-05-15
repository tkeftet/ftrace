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
import { useCreateSection, useUpdateSection } from "../../hooks/sections";
import type { Section } from "@/api/endpoints/section.api";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});
type FormValues = z.infer<typeof schema>;

interface SectionFormDialogProps {
  open: boolean;
  onClose: () => void;
  editingSection: Section | null;
  onSuccess: (msg: string) => void;
}

export function SectionFormDialog({
  open,
  onClose,
  editingSection,
  onSuccess,
}: SectionFormDialogProps) {
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();

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
    reset({ name: editingSection?.name ?? "" });
  };

  const onSubmit = (data: FormValues) => {
    if (editingSection) {
      updateSection.mutate(
        { id: editingSection._id, name: data.name },
        {
          onSuccess: () => {
            onSuccess("Section updated.");
            onClose();
          },
          onError: (err) => onSuccess(extractError(err)),
        },
      );
    } else {
      createSection.mutate(
        { name: data.name },
        {
          onSuccess: () => {
            onSuccess("Section added.");
            onClose();
          },
          onError: (err) => onSuccess(extractError(err)),
        },
      );
    }
  };

  const isPending = createSection.isPending || updateSection.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      TransitionProps={{ onEnter: handleEnter }}
    >
      <DialogTitle fontWeight={800}>
        {editingSection ? "Edit Section" : "Add Section"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Section name *"
                placeholder="e.g. Ground Floor, Terrace, Garden…"
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
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          sx={{ bgcolor: "#b45309", "&:hover": { bgcolor: "#92400e" } }}
        >
          {isPending ? (
            <CircularProgress size={18} />
          ) : editingSection ? (
            "Save"
          ) : (
            "Add"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
