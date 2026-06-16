import { Fragment, useRef, useState, useCallback } from "react";
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
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useParsePdfMenu, useConfirmMenuImport } from "../../hooks/menu";
import type {
  ExtractedCategory,
  ExtractedItem,
} from "@/api/endpoints/menu.api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (createdCategories: string[], createdItems: string[]) => void;
}

type Step = "upload" | "review" | "success";
type DragSource = { ci: number; ii: number };
// insertAt = index before which to insert (0 = top of list, items.length = bottom)
type DropTarget = { ci: number; insertAt: number };

export default function MenuImportDialog({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [fileDragging, setFileDragging] = useState(false);
  const [categories, setCategories] = useState<ExtractedCategory[]>([]);
  const [successData, setSuccessData] = useState<{
    createdCategories: string[];
    reusedCategories: string[];
    createdItems: string[];
  } | null>(null);

  const [dragSource, setDragSource] = useState<DragSource | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const parseMutation = useParsePdfMenu();
  const confirmMutation = useConfirmMenuImport();

  const handleClose = () => {
    if (parseMutation.isPending || confirmMutation.isPending) return;
    onClose();
    setTimeout(() => {
      setStep("upload");
      setCategories([]);
      setSuccessData(null);
      setDragSource(null);
      setDropTarget(null);
      parseMutation.reset();
      confirmMutation.reset();
    }, 300);
  };

  /* ── File upload ── */
  const ACCEPTED_TYPES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);

  const processFile = useCallback(
    (file: File) => {
      if (!file || !ACCEPTED_TYPES.has(file.type)) return;
      parseMutation.mutate(file, {
        onSuccess: (data) => { setCategories(data.categories); setStep("review"); },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parseMutation],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFileDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  /* ── Category / item helpers ── */
  const updateCategoryName = (ci: number, v: string) =>
    setCategories((p) => p.map((c, i) => (i === ci ? { ...c, categoryName: v } : c)));

  const removeCategory = (ci: number) =>
    setCategories((p) => p.filter((_, i) => i !== ci));

  const addCategory = () =>
    setCategories((p) => [...p, { categoryName: "New Category", items: [] }]);

  const updateItem = (ci: number, ii: number, field: keyof ExtractedItem, v: string | number) =>
    setCategories((p) =>
      p.map((c, i) =>
        i !== ci ? c : { ...c, items: c.items.map((it, j) => (j !== ii ? it : { ...it, [field]: v })) },
      ),
    );

  const removeItem = (ci: number, ii: number) =>
    setCategories((p) =>
      p.map((c, i) => (i !== ci ? c : { ...c, items: c.items.filter((_, j) => j !== ii) })),
    );

  const addItem = (ci: number) =>
    setCategories((p) =>
      p.map((c, i) =>
        i !== ci ? c : { ...c, items: [...c.items, { name: "", description: "", price: 0, target: "kitchen" as const }] },
      ),
    );

  /* ── Drag & drop ── */
  const handleItemDragStart = (e: React.DragEvent, ci: number, ii: number) => {
    setDragSource({ ci, ii });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", categories[ci].items[ii].name);
  };

  const handleItemDragEnd = () => {
    setDragSource(null);
    setDropTarget(null);
  };

  // Called while hovering over an item — top half means "insert before", bottom half "insert after"
  const handleItemDragOver = (e: React.DragEvent, ci: number, ii: number) => {
    if (!dragSource) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const insertAt = e.clientY < rect.top + rect.height / 2 ? ii : ii + 1;
    setDropTarget({ ci, insertAt });
  };

  // Called while hovering over the empty drop zone at the bottom of a category
  const handleEndZoneDragOver = (e: React.DragEvent, ci: number) => {
    if (!dragSource) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDropTarget({ ci, insertAt: categories[ci].items.length });
  };

  const handleCatDragLeave = (e: React.DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDropTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragSource || !dropTarget) { setDragSource(null); setDropTarget(null); return; }

    const { ci: srcCi, ii: srcIi } = dragSource;
    const { ci: tgtCi, insertAt } = dropTarget;

    setCategories((prev) => {
      const next = prev.map((c) => ({ ...c, items: [...c.items] }));
      const [moved] = next[srcCi].items.splice(srcIi, 1);

      // After removing from source, adjust insertAt if moving within the same category
      // and the source was before the insertion point
      let adjusted = insertAt;
      if (srcCi === tgtCi && srcIi < insertAt) adjusted--;

      const safe = Math.max(0, Math.min(adjusted, next[tgtCi].items.length));
      next[tgtCi].items.splice(safe, 0, moved);
      return next;
    });

    setDragSource(null);
    setDropTarget(null);
  };

  /* ── Confirm ── */
  const handleConfirm = () => {
    confirmMutation.mutate(categories, {
      onSuccess: (data) => {
        setSuccessData({
          createdCategories: data.createdCategories,
          reusedCategories: data.reusedCategories ?? [],
          createdItems: data.createdItems,
        });
        setStep("success");
        onSuccess(data.createdCategories, data.createdItems);
      },
    });
  };

  /* ── Helpers ── */
  const isIndicatorActive = (ci: number, pos: number) =>
    dropTarget?.ci === ci && dropTarget?.insertAt === pos;

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
        {step === "upload" && "Import Menu"}
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
                <Typography color="text.secondary">Extracting menu with AI…</Typography>
              </Stack>
            ) : (
              <>
                <Box
                  onDragOver={(e) => { e.preventDefault(); setFileDragging(true); }}
                  onDragLeave={() => setFileDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    width: "100%", maxWidth: 420, border: "2px dashed",
                    borderColor: fileDragging ? "primary.main" : "divider",
                    borderRadius: 2, p: 5, textAlign: "center", cursor: "pointer",
                    bgcolor: fileDragging ? "action.hover" : "background.default",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                  }}
                >
                  <UploadFileIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                  <Typography variant="body1" fontWeight={600}>Drop your menu here</Typography>
                  <Typography variant="body2" color="text.secondary">
                    PDF, Word (.docx), or image (JPG, PNG, WebP)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">or click to browse</Typography>
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {parseMutation.isError && (
                  <Typography color="error" variant="body2" textAlign="center">
                    {(parseMutation.error as { response?: { data?: { error?: string } } })
                      ?.response?.data?.error ?? "Failed to extract menu. Please try again."}
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
              <Box
                key={ci}
                onDragLeave={handleCatDragLeave}
                onDrop={handleDrop}
                sx={{
                  borderRadius: 2,
                  border: "2px solid",
                  borderColor:
                    dropTarget?.ci === ci && dragSource?.ci !== ci
                      ? "primary.main"
                      : "transparent",
                  bgcolor:
                    dropTarget?.ci === ci && dragSource?.ci !== ci
                      ? "primary.50"
                      : "transparent",
                  transition: "border-color 0.15s, background-color 0.15s",
                  p: dropTarget?.ci === ci && dragSource?.ci !== ci ? 1 : 0,
                }}
              >
                {ci > 0 && !(dropTarget?.ci === ci && dragSource?.ci !== ci) && (
                  <Divider sx={{ mb: 2 }} />
                )}

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
                    <IconButton size="small" color="error" onClick={() => removeCategory(ci)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Items with positional drop indicators */}
                <Stack spacing={0} pl={1}>
                  {/* Indicator before first item */}
                  <Box sx={{
                    height: 3, borderRadius: 1, mx: 1, mb: 0.25,
                    bgcolor: isIndicatorActive(ci, 0) ? "primary.main" : "transparent",
                    transition: "background-color 0.1s",
                  }} />

                  {cat.items.map((item, ii) => {
                    const isBeingDragged = dragSource?.ci === ci && dragSource?.ii === ii;
                    return (
                      <Fragment key={ii}>
                        {/* Card per item — looks good on both mobile and desktop */}
                        <Box
                          draggable
                          onDragStart={(e) => handleItemDragStart(e, ci, ii)}
                          onDragEnd={handleItemDragEnd}
                          onDragOver={(e) => handleItemDragOver(e, ci, ii)}
                          sx={{
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: isBeingDragged ? "primary.main" : "divider",
                            borderRadius: 1.5,
                            px: 1.5,
                            pt: 1,
                            pb: 1.5,
                            opacity: isBeingDragged ? 0.35 : 1,
                            cursor: "grab",
                            "&:active": { cursor: "grabbing" },
                            transition: "opacity 0.15s, border-color 0.15s",
                            userSelect: "none",
                          }}
                        >
                          {/* Row 1: drag handle + name + delete */}
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Tooltip title="Drag to reorder or move to another category">
                              <DragIndicatorIcon
                                fontSize="small"
                                sx={{ color: "text.disabled", flexShrink: 0, cursor: "grab" }}
                              />
                            </Tooltip>
                            <TextField
                              label="Name"
                              value={item.name}
                              size="small"
                              sx={{ flex: 1 }}
                              onChange={(e) => updateItem(ci, ii, "name", e.target.value)}
                            />
                            <Tooltip title="Remove item">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeItem(ci, ii)}
                                sx={{ flexShrink: 0 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>

                          {/* Row 2: price — indented to align with name */}
                          <Box sx={{ pl: 3.5, mt: 1 }}>
                            <TextField
                              label="Price"
                              type="number"
                              value={item.price}
                              size="small"
                              sx={{ width: 110 }}
                              inputProps={{ min: 0, step: 0.01 }}
                              onChange={(e) =>
                                updateItem(ci, ii, "price", parseFloat(e.target.value) || 0)
                              }
                            />
                          </Box>
                        </Box>

                        {/* Positional drop indicator after this item */}
                        <Box sx={{
                          height: 3, borderRadius: 1, mx: 1, mt: 0.25, mb: 0.25,
                          bgcolor: isIndicatorActive(ci, ii + 1) ? "primary.main" : "transparent",
                          transition: "background-color 0.1s",
                        }} />
                      </Fragment>
                    );
                  })}

                  {/* End drop zone — catches drops below the last item */}
                  <Box
                    onDragOver={(e) => handleEndZoneDragOver(e, ci)}
                    sx={{ minHeight: 20, borderRadius: 1 }}
                  />

                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => addItem(ci)}
                    sx={{ alignSelf: "flex-start", mt: 0.5 }}
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
            <Stack spacing={0.5} alignItems="center">
              {successData.createdCategories.length > 0 && (
                <Typography color="text.secondary">
                  {successData.createdCategories.length} new{" "}
                  {successData.createdCategories.length === 1 ? "category" : "categories"} created
                </Typography>
              )}
              {successData.reusedCategories.length > 0 && (
                <Typography color="text.secondary">
                  {successData.reusedCategories.length} existing{" "}
                  {successData.reusedCategories.length === 1 ? "category" : "categories"} reused
                </Typography>
              )}
              <Typography color="text.secondary">
                {successData.createdItems.length}{" "}
                {successData.createdItems.length === 1 ? "item" : "items"} added
              </Typography>
            </Stack>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        {step === "upload" && (
          <Button onClick={handleClose} disabled={parseMutation.isPending}>Cancel</Button>
        )}

        {step === "review" && (
          <>
            <Button onClick={handleClose} disabled={confirmMutation.isPending}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={confirmMutation.isPending || categories.length === 0}
              startIcon={confirmMutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {confirmMutation.isPending ? "Importing…" : "Confirm & Import"}
            </Button>
          </>
        )}

        {step === "success" && (
          <Button variant="contained" onClick={handleClose}>Done</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
