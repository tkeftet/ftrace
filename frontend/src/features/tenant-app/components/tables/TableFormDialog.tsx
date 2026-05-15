import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { extractError } from "@/utils/extractError";
import { useUpdateTable, useTables } from "../../hooks/tables";
import { useFloors } from "../../hooks/floors";
import { tableApi } from "@/api/endpoints/table.api";
import { tableKeys } from "@/api/queryKeys";
import type { Table } from "@/api/endpoints/table.api";

// ── Edit schema (single table) ─────────────────────────────────────────────
const editSchema = z.object({
  number: z.number().int().min(1, "Must be ≥ 1"),
  label: z.string().optional(),
  capacity: z.number().int().min(1, "Must be ≥ 1").max(10, "Max 10 seats"),
  floorId: z.string().min(1, "Floor is required"),
});
type EditForm = z.infer<typeof editSchema>;

// ── Add schema (bulk) ──────────────────────────────────────────────────────
const addSchema = z.object({
  count: z.number().int().min(1, "At least 1").max(100, "Max 100 at a time"),
  capacity: z.number().int().min(1, "Must be ≥ 1").max(10, "Max 10 seats"),
  floorId: z.string().min(1, "Floor is required"),
});
type AddForm = z.infer<typeof addSchema>;

interface TableFormDialogProps {
  open: boolean;
  onClose: () => void;
  editingTable: Table | null;
  defaultFloorId?: string;
  onSuccess: (msg: string) => void;
}

export function TableFormDialog({
  open,
  onClose,
  editingTable,
  defaultFloorId,
  onSuccess,
}: TableFormDialogProps) {
  const qc = useQueryClient();
  const updateTable = useUpdateTable();
  const { data: tables = [] } = useTables();
  const { data: floors = [] } = useFloors();
  const [isBulkPending, setIsBulkPending] = useState(false);

  // ── Edit form ──────────────────────────────────────────────────────────
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { number: 1, label: "", capacity: 4, floorId: "" },
  });

  // ── Add form ───────────────────────────────────────────────────────────
  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAdd,
    watch: watchAdd,
    formState: { errors: addErrors },
  } = useForm<AddForm>({
    resolver: zodResolver(addSchema),
    defaultValues: { count: 1, capacity: 4, floorId: "" },
  });

  const watchedCount = watchAdd("count");
  const watchedFloorId = watchAdd("floorId");

  // Floor from the form value (pre-filled from active tab, but user can change)
  const selectedFloor = floors.find((f) => f._id === watchedFloorId);

  // Preview: generate names continuing from the highest existing suffix for this floor
  const preview = useMemo(() => {
    if (!selectedFloor || !(watchedCount >= 1)) return [];
    const prefix = selectedFloor.name;
    const existingLabels = new Set(
      tables.map((t) => t.label?.trim().toLowerCase()).filter(Boolean) as string[],
    );
    const existingForFloor = tables.filter((t) =>
      t.label?.toLowerCase().startsWith(prefix.toLowerCase() + " - "),
    );
    const maxSuffix =
      existingForFloor.length > 0
        ? Math.max(
            ...existingForFloor.map((t) => {
              const n = parseInt(t.label!.split(" - ").pop()!, 10);
              return isNaN(n) ? 0 : n;
            }),
          )
        : 0;
    return Array.from({ length: watchedCount }, (_, i) => {
      const name = `${prefix} - ${maxSuffix + i + 1}`;
      return { name, conflict: existingLabels.has(name.toLowerCase()) };
    });
  }, [selectedFloor, watchedCount, tables]);

  const hasConflicts = preview.some((p) => p.conflict);

  // ── Reset forms when dialog opens ─────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (editingTable) {
      resetEdit({
        number: editingTable.number,
        label: editingTable.label ?? "",
        capacity: editingTable.capacity,
        floorId: editingTable.floorId ?? "",
      });
    } else {
      resetAdd({ count: 1, capacity: 4, floorId: defaultFloorId ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Edit submit ────────────────────────────────────────────────────────
  const onEditSubmit = (data: EditForm) => {
    updateTable.mutate(
      {
        id: editingTable!._id,
        payload: {
          number: data.number,
          label: data.label?.trim() || undefined,
          capacity: data.capacity,
          floorId: data.floorId,
        },
      },
      {
        onSuccess: () => { onSuccess("Table updated."); onClose(); },
        onError: (err) => onSuccess(extractError(err)),
      },
    );
  };

  // ── Bulk add submit ────────────────────────────────────────────────────
  const onAddSubmit = async (data: AddForm) => {
    if (hasConflicts) {
      onSuccess("Some generated names already exist.");
      return;
    }
    setIsBulkPending(true);
    try {
      const maxNum = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) : 0;
      await Promise.all(
        preview.map((row, i) =>
          tableApi.create({
            number: maxNum + i + 1,
            label: row.name,
            capacity: data.capacity,
            floorId: data.floorId,
          }),
        ),
      );
      qc.invalidateQueries({ queryKey: tableKeys.list() });
      onSuccess(`${preview.length} table${preview.length > 1 ? "s" : ""} added.`);
      onClose();
    } catch (err) {
      onSuccess(extractError(err));
    } finally {
      setIsBulkPending(false);
    }
  };

  const isPending = updateTable.isPending || isBulkPending;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle fontWeight={800}>
        {editingTable ? "Edit Table" : "Add Tables"}
      </DialogTitle>

      {editingTable ? (
        /* ── EDIT MODE ── */
        <>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <Controller
                name="number"
                control={editControl}
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    label="Table number *"
                    type="number"
                    size="small"
                    error={!!editErrors.number}
                    helperText={editErrors.number?.message}
                    onChange={(e) => onChange(Number(e.target.value))}
                  />
                )}
              />
              <Controller
                name="label"
                control={editControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Label (optional)"
                    size="small"
                    placeholder="e.g. Terrace, VIP…"
                  />
                )}
              />
              <Controller
                name="capacity"
                control={editControl}
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    label="Seats *"
                    type="number"
                    size="small"
                    error={!!editErrors.capacity}
                    helperText={editErrors.capacity?.message}
                    onChange={(e) => onChange(Number(e.target.value))}
                    inputProps={{ min: 1, max: 10, step: 1 }}
                  />
                )}
              />
              <Controller
                name="floorId"
                control={editControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Floor *"
                    size="small"
                    error={!!editErrors.floorId}
                    helperText={editErrors.floorId?.message}
                    disabled={floors.length === 0}
                  >
                    <MenuItem value="">Select a floor</MenuItem>
                    {floors.map((f) => (
                      <MenuItem key={f._id} value={f._id}>{f.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button
              variant="contained"
              disabled={isPending}
              onClick={handleEditSubmit(onEditSubmit)}
              sx={{ bgcolor: "#b45309", "&:hover": { bgcolor: "#92400e" } }}
            >
              {isPending ? <CircularProgress size={18} color="inherit" /> : "Save"}
            </Button>
          </DialogActions>
        </>
      ) : (
        /* ── ADD MODE ── */
        <>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Controller
                  name="count"
                  control={addControl}
                  render={({ field: { onChange, ...field } }) => (
                    <TextField
                      {...field}
                      label="Number of tables *"
                      type="number"
                      size="small"
                      fullWidth
                      error={!!addErrors.count}
                      helperText={addErrors.count?.message}
                      onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
                      inputProps={{ min: 1, max: 100, step: 1 }}
                    />
                  )}
                />
                <Controller
                  name="capacity"
                  control={addControl}
                  render={({ field: { onChange, ...field } }) => (
                    <TextField
                      {...field}
                      label="Seats *"
                      type="number"
                      size="small"
                      sx={{ width: 100 }}
                      error={!!addErrors.capacity}
                      helperText={addErrors.capacity?.message}
                      onChange={(e) => onChange(Number(e.target.value))}
                      inputProps={{ min: 1, max: 10, step: 1 }}
                    />
                  )}
                />
              </Box>

              <Controller
                name="floorId"
                control={addControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Floor *"
                    size="small"
                    error={!!addErrors.floorId}
                    helperText={addErrors.floorId?.message}
                    disabled={floors.length === 0}
                  >
                    <MenuItem value="">Select a floor</MenuItem>
                    {floors.map((f) => (
                      <MenuItem key={f._id} value={f._id}>{f.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />

              {/* Preview chips */}
              {preview.length > 0 && (
                <>
                  <Divider />
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    Tables to be created
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {preview.map((p) => (
                      <Chip
                        key={p.name}
                        label={p.name}
                        size="small"
                        color={p.conflict ? "error" : "default"}
                        variant={p.conflict ? "filled" : "outlined"}
                      />
                    ))}
                  </Box>
                  {hasConflicts && (
                    <Typography variant="caption" color="error">
                      Red names already exist and cannot be created.
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button
              variant="contained"
              disabled={isPending || hasConflicts || preview.length === 0}
              onClick={handleAddSubmit(onAddSubmit)}
              sx={{ bgcolor: "#b45309", "&:hover": { bgcolor: "#92400e" } }}
            >
              {isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                `Add ${preview.length} Table${preview.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
