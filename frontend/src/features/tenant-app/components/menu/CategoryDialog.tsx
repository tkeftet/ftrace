import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MenuCategory } from "@/api/endpoints/menu.api";
import { categorySchema, type CategoryForm } from "../../schemas/menuSchemas";

interface CategoryDialogProps {
  open: boolean;
  editing: MenuCategory | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryForm) => void;
}

export function CategoryDialog({
  open,
  editing,
  loading,
  onClose,
  onSubmit,
}: CategoryDialogProps) {
  const { control, handleSubmit, reset } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: editing?.name ?? "",
      displayOrder: editing?.displayOrder ?? 0,
    },
    values: {
      name: editing?.name ?? "",
      displayOrder: editing?.displayOrder ?? 0,
    },
  });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Box
          component="form"
          id="cat-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Category name"
                fullWidth
                autoFocus
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{ mb: 2 }}
              />
            )}
          />
          <Controller
            name="displayOrder"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? 0}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : parseInt(e.target.value, 10),
                  )
                }
                label="Display order"
                type="number"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="cat-form"
          variant="contained"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={18} />
          ) : editing ? (
            "Save"
          ) : (
            "Create"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
