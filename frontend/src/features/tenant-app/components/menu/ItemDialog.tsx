import { useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import type { MenuItem as IMenuItem } from "@/api/endpoints/menu.api";
import { itemSchema, type ItemForm } from "../../schemas/menuSchemas";

/* ── Image compression ───────────────────────────────────────────────────── */
function compressImage(file: File, maxPx = 700, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Dialog ──────────────────────────────────────────────────────────────── */
interface ItemDialogProps {
  open: boolean;
  editing: IMenuItem | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: ItemForm) => void;
}

export function ItemDialog({ open, editing, loading, onClose, onSubmit }: ItemDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { control, handleSubmit, reset, watch, setValue } = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: editing?.name ?? "",
      description: editing?.description ?? "",
      price: editing?.price ?? 0,
      target: editing?.target ?? "kitchen",
      preparationTime: editing?.preparationTime ?? undefined,
      image: editing?.image ?? undefined,
    },
    values: {
      name: editing?.name ?? "",
      description: editing?.description ?? "",
      price: editing?.price ?? 0,
      target: editing?.target ?? "kitchen",
      preparationTime: editing?.preparationTime ?? undefined,
      image: editing?.image ?? undefined,
    },
  });

  const imageValue = watch("image");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setValue("image", compressed, { shouldDirty: true });
    } catch {
      // silently ignore corrupt files
    }
    e.target.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>{editing ? "Edit Item" : "New Item"}</DialogTitle>

      <DialogContent sx={{ pt: "16px !important" }}>
        <Box component="form" id="item-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2}>

            {/* ── Image picker ── */}
            <Grid size={12}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              {imageValue ? (
                <Box sx={{ position: "relative", width: "100%" }}>
                  <Box
                    component="img"
                    src={imageValue}
                    alt="preview"
                    sx={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1.5px solid #e7e5e4",
                      display: "block",
                      cursor: "pointer",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setValue("image", undefined, { shouldDirty: true })}
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      bgcolor: "rgba(0,0,0,0.55)",
                      color: "white",
                      width: 26,
                      height: 26,
                      "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 0.5, color: "text.secondary", textAlign: "center" }}
                  >
                    Click image to replace
                  </Typography>
                </Box>
              ) : (
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    width: "100%",
                    height: 120,
                    border: "2px dashed #e7e5e4",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.75,
                    cursor: "pointer",
                    bgcolor: "#fffbf5",
                    "&:hover": { borderColor: "#b45309", bgcolor: "#fef3c7" },
                    transition: "all 0.15s",
                  }}
                >
                  <AddPhotoAlternateIcon sx={{ fontSize: 28, color: "#d6d3d1" }} />
                  <Typography fontSize={13} color="text.secondary" fontWeight={600}>
                    Add photo (optional)
                  </Typography>
                  <Typography fontSize={11} color="text.disabled">
                    Auto-compressed · JPEG · max 700 px
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* ── Name ── */}
            <Grid size={12}>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Item name"
                    fullWidth
                    autoFocus
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            {/* ── Description ── */}
            <Grid size={12}>
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            {/* ── Price ── */}
            <Grid size={6}>
              <Controller
                name="price"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))
                    }
                    label="Price"
                    type="number"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      },
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            {/* ── Target ── */}
            <Grid size={6}>
              <Controller
                name="target"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Prepared by"
                    select
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="kitchen">Kitchen</MenuItem>
                    <MenuItem value="bar">Bar</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* ── Prep time ── */}
            <Grid size={6}>
              <Controller
                name="preparationTime"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                      )
                    }
                    label="Prep time (min)"
                    type="number"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          type="submit"
          form="item-form"
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: "#b45309", "&:hover": { bgcolor: "#92400e" } }}
        >
          {loading ? <CircularProgress size={18} color="inherit" /> : editing ? "Save" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
