import { useRef, useState, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useParsePdfMenu, useConfirmMenuImport } from "../../hooks/menu";
import type {
  ExtractedCategory,
  ExtractedItem,
} from "@/api/endpoints/menu.api"; // type-only

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (createdCategories: string[], createdItems: string[]) => void;
}

type Step = "upload" | "review" | "success";

export default function MenuImportDialog({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [categories, setCategories] = useState<ExtractedCategory[]>([]);
  const [successData, setSuccessData] = useState<{
    createdCategories: string[];
    createdItems: string[];
  } | null>(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const parseMutation = useParsePdfMenu();
  const confirmMutation = useConfirmMenuImport();

  const handleClose = () => {
    if (parseMutation.isPending || confirmMutation.isPending) return;
    onClose();
    // reset after close animation
    setTimeout(() => {
      setStep("upload");
      setCategories([]);
      setSuccessData(null);
      parseMutation.reset();
      confirmMutation.reset();
    }, 300);
  };

  const processFile = useCallback(
    (file: File) => {
      if (!file || file.type !== "application/pdf") return;
      parseMutation.mutate(file, {
        onSuccess: (data) => {
          setCategories(data.categories);
          setStep("review");
        },
      });
    },
    [parseMutation],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Category helpers
  const updateCategoryName = (ci: number, value: string) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === ci ? { ...c, categoryName: value } : c)),
    );
  };

  const removeCategory = (ci: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== ci));
  };

  const addCategory = () => {
    setCategories((prev) => [
      ...prev,
      { categoryName: "New Category", items: [] },
    ]);
  };

  // Item helpers
  const updateItem = (
    ci: number,
    ii: number,
    field: keyof ExtractedItem,
    value: string | number,
  ) => {
    setCategories((prev) =>
      prev.map((c, i) =>
        i !== ci
          ? c
          : {
              ...c,
              items: c.items.map((item, j) =>
                j !== ii ? item : { ...item, [field]: value },
              ),
            },
      ),
    );
  };

  const removeItem = (ci: number, ii: number) => {
    setCategories((prev) =>
      prev.map((c, i) =>
        i !== ci ? c : { ...c, items: c.items.filter((_, j) => j !== ii) },
      ),
    );
  };

  const addItem = (ci: number) => {
    const newItem: ExtractedItem = {
      name: "",
      description: "",
      price: 0,
      target: "kitchen",
    };
    setCategories((prev) =>
      prev.map((c, i) =>
        i !== ci ? c : { ...c, items: [...c.items, newItem] },
      ),
    );
  };

  const handleConfirm = () => {
    confirmMutation.mutate(categories, {
      onSuccess: (data) => {
        setSuccessData({
          createdCategories: data.createdCategories,
          createdItems: data.createdItems,
        });
        setStep("success");
        onSuccess(data.createdCategories, data.createdItems);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: { minHeight: fullScreen ? undefined : 420 } }}
    >
      <DialogTitle>
        {step === "upload" && "Import Menu from PDF"}
        {step === "review" && "Review Extracted Menu"}
        {step === "success" && "Import Complete"}
      </DialogTitle>

      <DialogContent dividers>
        {/* ── STEP 1: Upload ── */}
        {step === "upload" && (
          <Stack alignItems="center" spacing={3} py={3}>
            {parseMutation.isPending ? (
              <Stack alignItems="center" spacing={2}>
                <CircularProgress size={56} />
                <Typography color="text.secondary">
                  Extracting menu with AI…
                </Typography>
              </Stack>
            ) : (
              <>
                <Box
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    width: "100%",
                    maxWidth: 420,
                    border: "2px dashed",
                    borderColor: dragging ? "primary.main" : "divider",
                    borderRadius: 2,
                    p: 5,
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: dragging ? "action.hover" : "background.default",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <UploadFileIcon
                    sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                  />
                  <Typography variant="body1" fontWeight={600}>
                    Drop your PDF here
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to browse
                  </Typography>
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {parseMutation.isError && (
                  <Typography color="error" variant="body2">
                    Failed to extract menu. Make sure the PDF has readable text.
                  </Typography>
                )}
              </>
            )}
          </Stack>
        )}

        {/* ── STEP 2: Review ── */}
        {step === "review" && (
          <Stack spacing={3}>
            {categories.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={2}>
                No categories extracted. Add them manually below.
              </Typography>
            )}

            {categories.map((cat, ci) => (
              <Box key={ci}>
                {ci > 0 && <Divider sx={{ mb: 2 }} />}
                {/* Category header */}
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <TextField
                    label="Category name"
                    value={cat.categoryName}
                    size="small"
                    sx={{ flex: 1 }}
                    onChange={(e) => updateCategoryName(ci, e.target.value)}
                  />
                  <Tooltip title="Remove category">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeCategory(ci)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Items */}
                <Stack spacing={1} pl={2}>
                  {cat.items.map((item, ii) => (
                    <Stack
                      key={ii}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ sm: "center" }}
                    >
                      <TextField
                        label="Name"
                        value={item.name}
                        size="small"
                        sx={{ flex: 2 }}
                        onChange={(e) =>
                          updateItem(ci, ii, "name", e.target.value)
                        }
                      />
                      <TextField
                        label="Description"
                        value={item.description}
                        size="small"
                        sx={{ flex: 3 }}
                        onChange={(e) =>
                          updateItem(ci, ii, "description", e.target.value)
                        }
                      />
                      <TextField
                        label="Price"
                        type="number"
                        value={item.price}
                        size="small"
                        sx={{ width: 90 }}
                        inputProps={{ min: 0, step: 0.01 }}
                        onChange={(e) =>
                          updateItem(
                            ci,
                            ii,
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                      <Select
                        value={item.target}
                        size="small"
                        sx={{ width: 110 }}
                        onChange={(e) =>
                          updateItem(
                            ci,
                            ii,
                            "target",
                            e.target.value as "bar" | "kitchen",
                          )
                        }
                      >
                        <MenuItem value="kitchen">Kitchen</MenuItem>
                        <MenuItem value="bar">Bar</MenuItem>
                      </Select>
                      <Tooltip title="Remove item">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeItem(ci, ii)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ))}

                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => addItem(ci)}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Add item
                  </Button>
                </Stack>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addCategory}
              sx={{ alignSelf: "flex-start" }}
            >
              Add category
            </Button>

            {confirmMutation.isError && (
              <Typography color="error" variant="body2">
                Import failed. Please try again.
              </Typography>
            )}
          </Stack>
        )}

        {/* ── STEP 3: Success ── */}
        {step === "success" && successData && (
          <Stack alignItems="center" spacing={2} py={3}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64 }} />
            <Typography variant="h6">Menu imported successfully!</Typography>
            <Typography color="text.secondary">
              {successData.createdCategories.length} categor
              {successData.createdCategories.length === 1
                ? "y"
                : "ies"} and {successData.createdItems.length} item
              {successData.createdItems.length === 1 ? "" : "s"} added.
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        {step === "upload" && (
          <Button onClick={handleClose} disabled={parseMutation.isPending}>
            Cancel
          </Button>
        )}

        {step === "review" && (
          <>
            <Button onClick={handleClose} disabled={confirmMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={confirmMutation.isPending || categories.length === 0}
              startIcon={
                confirmMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              {confirmMutation.isPending ? "Importing…" : "Confirm & Import"}
            </Button>
          </>
        )}

        {step === "success" && (
          <Button variant="contained" onClick={handleClose}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
