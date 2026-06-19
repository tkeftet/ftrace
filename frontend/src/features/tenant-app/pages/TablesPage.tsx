import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import TableBarIcon from "@mui/icons-material/TableBar";
import GridViewIcon from "@mui/icons-material/GridView";
import MapIcon from "@mui/icons-material/Map";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";

import { TableFormDialog } from "../components/tables/TableFormDialog";
import { TableQRCodesDialog } from "../components/tables/TableQRCodesDialog";
import { FloorPlan } from "../components/tables/FloorPlan";
import { FloorFormDialog } from "../components/tables/FloorFormDialog";
import { SectionFormDialog } from "../components/tables/SectionFormDialog";
import { useTables, useDeleteTable } from "../hooks/tables";
import { useSections, useDeleteSection } from "../hooks/sections";
import { useFloors, useDeleteFloor } from "../hooks/floors";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AppSnackbar } from "@/components/common/AppSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useAuthStore } from "@/store/authStore";
import { useCallingTablesStore } from "@/store/callingTablesStore";
import { getTenantSlug } from "@/utils/tenant";
import type { Table } from "@/api/endpoints/table.api";
import type { Section } from "@/api/endpoints/section.api";
import type { Floor } from "@/api/endpoints/floor.api";

type ViewMode = "grid" | "floor";

/* ── CSS keyframes injected once ────────────────────────────────────────── */
const callKeyframes = `
@keyframes tableShake {
  0%,100% { transform: translateX(0); }
  15%      { transform: translateX(-4px); }
  30%      { transform: translateX(4px); }
  45%      { transform: translateX(-3px); }
  60%      { transform: translateX(3px); }
  75%      { transform: translateX(-2px); }
  90%      { transform: translateX(2px); }
}
@keyframes callPulse {
  0%,100% { border-color: #fed7aa; box-shadow: none; }
  50%      { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.25); }
}
@keyframes callBar {
  0%,100% { background: #f97316; }
  50%      { background: #7c3aed; }
}
`;
if (typeof document !== "undefined" && !document.getElementById("call-kf")) {
  const s = document.createElement("style");
  s.id = "call-kf";
  s.textContent = callKeyframes;
  document.head.appendChild(s);
}

/* ── Table Card ─────────────────────────────────────────────────────────── */
function TableCard({
  table,
  canEdit,
  isCalling,
  onEdit,
  onDelete,
}: {
  table: Table;
  canEdit: boolean;
  isCalling: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const isFree = !table.isOccupied;

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "white",
        boxShadow: isCalling ? "0 0 0 3px rgba(124,58,237,0.3)" : "0 1px 4px rgba(0,0,0,0.07)",
        border: "1.5px solid",
        borderColor: isFree ? "#bbf7d0" : "#fed7aa",
        position: "relative",
        height: 130,
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.15s, transform 0.15s",
        animation: isCalling ? "tableShake 0.5s ease 0s 2, callPulse 1s ease-in-out infinite" : "none",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.11)",
          transform: isCalling ? "none" : "translateY(-1px)",
        },
      }}
    >
      {/* Status accent bar */}
      <Box sx={{ height: 6, flexShrink: 0, bgcolor: isFree ? "#22c55e" : "#f97316", animation: isCalling ? "callBar 1s ease-in-out infinite" : "none" }} />

      <Box sx={{ p: 1.75, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
        {/* Top row: name + call badge + context menu */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.5 }}>
          <Typography
            fontWeight={900}
            fontSize={14}
            color="#1e293b"
            sx={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {table.label || `Table ${table.number}`}
          </Typography>
          {isCalling && (
            <Box sx={{ px: 0.75, py: 0.2, borderRadius: 1, bgcolor: "#7c3aed", flexShrink: 0 }}>
              <Typography sx={{ fontSize: 9, fontWeight: 900, color: "white", letterSpacing: 0.5 }}>CALL</Typography>
            </Box>
          )}
          {canEdit && (
            <IconButton
              size="small"
              sx={{
                flexShrink: 0,
                color: "#94a3b8",
                width: 24,
                height: 24,
                mt: -0.25,
                "&:hover": { bgcolor: "#f1f5f9", color: "#475569" },
              }}
              onClick={(e) => {
                e.stopPropagation();
                setMenuAnchor(e.currentTarget);
              }}
            >
              <MoreVertIcon sx={{ fontSize: 15 }} />
            </IconButton>
          )}
        </Box>

        {/* Middle: seats */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <PeopleIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
          <Typography fontSize={12} color="text.secondary" fontWeight={600}>
            {table.capacity ?? "—"} seat{table.capacity !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* Bottom: status badge */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.6,
            px: 1.25,
            py: 0.35,
            borderRadius: 99,
            alignSelf: "flex-start",
            bgcolor: isFree ? "#dcfce7" : "#ffedd5",
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: isFree ? "#22c55e" : "#f97316",
              boxShadow: isFree
                ? "0 0 0 2px rgba(34,197,94,0.25)"
                : "0 0 0 2px rgba(249,115,22,0.25)",
            }}
          />
          <Typography fontSize={11} fontWeight={800} color={isFree ? "#166534" : "#9a3412"}>
            {isFree ? "Free" : "Busy"}
          </Typography>
        </Box>
      </Box>

      {canEdit && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => { setMenuAnchor(null); onEdit(); }}>
            <EditIcon sx={{ mr: 1.5, fontSize: 18 }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchor(null); onDelete(); }} sx={{ color: "error.main" }}>
            <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} /> Delete
          </MenuItem>
        </Menu>
      )}
    </Box>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function TablesPage() {
  const { snackbar, show, close: closeSnackbar } = useSnackbar();
  const { user } = useAuthStore();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  const { callingTables } = useCallingTablesStore();

  const { data: tables = [], isLoading: tablesLoading } = useTables();
  const { isLoading: sectionsLoading } = useSections();
  const { data: floors = [], isLoading: floorsLoading } = useFloors();
  const deleteTable = useDeleteTable();
  const deleteSection = useDeleteSection();
  const deleteFloor = useDeleteFloor();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Table | null>(null);

  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  void setEditingSection;
  const [deleteSectionTarget, setDeleteSectionTarget] = useState<Section | null>(null);

  const [floorDialogOpen, setFloorDialogOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [deleteFloorTarget, setDeleteFloorTarget] = useState<Floor | null>(null);

  const [activeFloor, setActiveFloor] = useState<string>("");

  useEffect(() => {
    if (floors.length === 0) return;
    if (!activeFloor || !floors.find((f) => f._id === activeFloor)) {
      setActiveFloor(floors[0]._id);
    }
  }, [floors, activeFloor]);

  // Floor pill context menu
  const [floorMenuAnchor, setFloorMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuFloor, setMenuFloor] = useState<Floor | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (localStorage.getItem("ftrace_table_view") as ViewMode) ?? "grid",
  );

  const isLoading = tablesLoading || sectionsLoading || floorsLoading;

  const visibleTables = useMemo(
    () => (activeFloor ? tables.filter((t) => t.floorId === activeFloor) : tables),
    [tables, activeFloor],
  );

  const { freeCount, occupiedCount } = useMemo(
    () => ({
      freeCount: visibleTables.filter((t) => !t.isOccupied).length,
      occupiedCount: visibleTables.filter((t) => t.isOccupied).length,
    }),
    [visibleTables],
  );

  const floorStorageKey = `ftrace_floor_${user?.id ?? "default"}_${activeFloor}`;

  const handleDeleteTable = useCallback(() => {
    if (!deleteTarget) return;
    deleteTable.mutate(deleteTarget._id, {
      onSuccess: () => { show("Table deleted.", "success"); setDeleteTarget(null); },
      onError: () => show("Failed to delete table.", "error"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteTarget]);

  const handleDeleteSection = useCallback(() => {
    if (!deleteSectionTarget) return;
    deleteSection.mutate(deleteSectionTarget._id, {
      onSuccess: () => { show(`"${deleteSectionTarget.name}" deleted.`, "success"); setDeleteSectionTarget(null); },
      onError: () => show("Failed to delete section.", "error"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteSectionTarget]);

  const handleDeleteFloor = useCallback(() => {
    if (!deleteFloorTarget) return;
    deleteFloor.mutate(deleteFloorTarget._id, {
      onSuccess: () => {
        show(`"${deleteFloorTarget.name}" deleted.`, "success");
        setDeleteFloorTarget(null);
        setActiveFloor((prev) => (prev === deleteFloorTarget._id ? "" : prev));
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        show(msg ?? "Failed to delete floor.", "error");
        setDeleteFloorTarget(null);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteFloorTarget]);

  const toggleView = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("ftrace_table_view", mode);
  };

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0, bgcolor: "#f8fafc" }}>

      {/* ── Header ── */}
      <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 2.5, pb: 1.5, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography variant="h5" fontWeight={800} color="#b45309">
          Tables
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {tables.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<QrCode2Icon />}
              size="small"
              onClick={() => setQrDialogOpen(true)}
              sx={{
                color: "#b45309",
                borderColor: "#b45309",
                "&:hover": { borderColor: "#92400e", bgcolor: "#fff7ed" },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13,
                px: 2,
                py: 0.85,
              }}
            >
              QR codes
            </Button>
          )}
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => { setEditingTable(null); setDialogOpen(true); }}
              sx={{
                bgcolor: "#b45309",
                "&:hover": { bgcolor: "#92400e" },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13,
                px: 2,
                py: 0.85,
                boxShadow: "0 2px 8px rgba(26,58,92,0.25)",
              }}
            >
              Add Table
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Floor pills + view toggle ── */}
      {(floors.length > 0 || canEdit) && (
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            pb: 1,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* Scrollable pill list */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              gap: 0.75,
              overflowX: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              alignItems: "center",
            }}
          >
            {floors.map((floor) => {
              const isActive = activeFloor === floor._id;
              const count = tables.filter((t) => t.floorId === floor._id).length;
              return (
                <Box
                  key={floor._id}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.25,
                    flexShrink: 0,
                    borderRadius: 2,
                    bgcolor: isActive ? "#b45309" : "white",
                    border: "1.5px solid",
                    borderColor: isActive ? "#b45309" : "#e2e8f0",
                    boxShadow: isActive ? "0 2px 8px rgba(26,58,92,0.2)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <Box
                    onClick={() => setActiveFloor(floor._id)}
                    sx={{
                      px: 1.5,
                      py: 0.65,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <Typography
                      fontSize={13}
                      fontWeight={700}
                      color={isActive ? "white" : "#475569"}
                      sx={{ lineHeight: 1 }}
                    >
                      {floor.name}{" "}
                      <Box component="span" sx={{ fontSize: 11, opacity: 0.7, fontWeight: 600 }}>
                        ({count})
                      </Box>
                    </Typography>
                  </Box>

                  {canEdit && (
                    <IconButton
                      size="small"
                      sx={{
                        mr: 0.25,
                        width: 22,
                        height: 22,
                        color: isActive ? "rgba(255,255,255,0.7)" : "#94a3b8",
                        "&:hover": {
                          bgcolor: isActive ? "rgba(255,255,255,0.15)" : "#f1f5f9",
                          color: isActive ? "white" : "#475569",
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuFloor(floor);
                        setFloorMenuAnchor(e.currentTarget);
                      }}
                    >
                      <MoreVertIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  )}
                </Box>
              );
            })}

            {/* Add floor button */}
            {canEdit && (
              <Tooltip title="Add floor">
                <IconButton
                  size="small"
                  sx={{
                    flexShrink: 0,
                    width: 30,
                    height: 30,
                    border: "1.5px dashed #cbd5e1",
                    borderRadius: 2,
                    color: "#94a3b8",
                    "&:hover": { borderColor: "#b45309", color: "#b45309", bgcolor: "#f0f4f8" },
                  }}
                  onClick={() => { setEditingFloor(null); setFloorDialogOpen(true); }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* View mode toggle */}
          {tables.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexShrink: 0,
                bgcolor: "white",
                border: "1.5px solid #e2e8f0",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {([ { mode: "grid" as ViewMode, icon: <GridViewIcon sx={{ fontSize: 16 }} />, label: "Grid" },
                  { mode: "floor" as ViewMode, icon: <MapIcon sx={{ fontSize: 16 }} />, label: "Floor plan" },
              ]).map(({ mode, icon, label }) => (
                <Tooltip key={mode} title={label}>
                  <IconButton
                    size="small"
                    onClick={() => toggleView(mode)}
                    sx={{
                      borderRadius: 0,
                      px: 1.1,
                      py: 0.65,
                      color: viewMode === mode ? "white" : "#94a3b8",
                      bgcolor: viewMode === mode ? "#b45309" : "transparent",
                      "&:hover": { bgcolor: viewMode === mode ? "#b45309" : "#f1f5f9", color: viewMode === mode ? "white" : "#475569" },
                      transition: "all 0.15s",
                    }}
                  >
                    {icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* ── Stats bar ── */}
      {visibleTables.length > 0 && (
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 1.25, flexShrink: 0, display: "flex", gap: 1.5, alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#22c55e" }} />
            <Typography fontSize={12} fontWeight={700} color="#166534">
              {freeCount} free
            </Typography>
          </Box>
          <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#cbd5e1" }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#f97316" }} />
            <Typography fontSize={12} fontWeight={700} color="#9a3412">
              {occupiedCount} busy
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Floor context menu ── */}
      <Menu
        anchorEl={floorMenuAnchor}
        open={Boolean(floorMenuAnchor)}
        onClose={() => setFloorMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setFloorMenuAnchor(null); setEditingFloor(menuFloor); setFloorDialogOpen(true); }}>
          <EditIcon sx={{ mr: 1.5, fontSize: 18 }} /> Rename
        </MenuItem>
        <MenuItem sx={{ color: "error.main" }} onClick={() => { setFloorMenuAnchor(null); setDeleteFloorTarget(menuFloor); }}>
          <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} /> Delete floor
        </MenuItem>
      </Menu>

      {/* ── Content ── */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {isLoading ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress sx={{ color: "#b45309" }} />
          </Box>
        ) : tables.length === 0 ? (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <TableBarIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 1 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={700}>No tables yet</Typography>
            <Typography variant="body2" color="text.disabled" mb={2}>Add your first table to get started.</Typography>
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setEditingTable(null); setDialogOpen(true); }}
                sx={{ bgcolor: "#b45309", "&:hover": { bgcolor: "#92400e" }, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                Add table
              </Button>
            )}
          </Box>
        ) : visibleTables.length === 0 ? (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <TableBarIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={700}>No tables on this floor</Typography>
            <Typography variant="body2" color="text.disabled" mb={2}>Add a table and assign it to this floor.</Typography>
            {canEdit && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => { setEditingTable(null); setDialogOpen(true); }}
                sx={{ color: "#b45309", borderColor: "#b45309", borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                Add table
              </Button>
            )}
          </Box>
        ) : viewMode === "floor" ? (
          <FloorPlan
            key={floorStorageKey}
            tables={visibleTables}
            canEdit={canEdit}
            onEdit={(table) => { setEditingTable(table); setDialogOpen(true); }}
            onDelete={setDeleteTarget}
            storageKey={floorStorageKey}
          />
        ) : (
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              minHeight: 0,
              px: { xs: 1.5, sm: 2, md: 2.5 },
              pt: 1,
              pb: 3,
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(5, 1fr)",
                xl: "repeat(6, 1fr)",
              },
              gap: { xs: 1, sm: 1.5 },
              alignContent: "start",
              // rows are driven by the card's fixed height — no stretching
              gridAutoRows: "130px",
            }}
          >
            {visibleTables.map((table) => (
              <TableCard
                key={table._id}
                table={table}
                canEdit={canEdit}
                isCalling={callingTables.has(table._id)}
                onEdit={() => { setEditingTable(table); setDialogOpen(true); }}
                onDelete={() => setDeleteTarget(table)}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* ── Dialogs ── */}
      <TableFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editingTable={editingTable}
        defaultFloorId={!editingTable && activeFloor !== "all" ? activeFloor : undefined}
        onSuccess={show}
      />
      <TableQRCodesDialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        tables={tables}
        slug={getTenantSlug()}
      />
      <FloorFormDialog
        open={floorDialogOpen}
        onClose={() => setFloorDialogOpen(false)}
        editingFloor={editingFloor}
        onSuccess={show}
      />
      <SectionFormDialog
        open={sectionDialogOpen}
        onClose={() => setSectionDialogOpen(false)}
        editingSection={editingSection}
        onSuccess={show}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete table"
        message={`Delete Table ${deleteTarget?.number}? This cannot be undone.`}
        onConfirm={handleDeleteTable}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteTable.isPending}
      />
      <ConfirmDialog
        open={!!deleteFloorTarget}
        title="Delete floor"
        message={`Delete floor "${deleteFloorTarget?.name}"? This is only allowed when no tables are assigned to it.`}
        onConfirm={handleDeleteFloor}
        onCancel={() => setDeleteFloorTarget(null)}
        loading={deleteFloor.isPending}
      />
      <ConfirmDialog
        open={!!deleteSectionTarget}
        title="Delete section"
        message={`Delete section "${deleteSectionTarget?.name}"? Tables in it will become unassigned.`}
        onConfirm={handleDeleteSection}
        onCancel={() => setDeleteSectionTarget(null)}
        loading={deleteSection.isPending}
      />
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </Box>
  );
}
