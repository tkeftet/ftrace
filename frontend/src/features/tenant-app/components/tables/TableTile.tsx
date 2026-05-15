import { useState } from "react";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { Table } from "@/api/endpoints/table.api";

interface TableTileProps {
  table: Table;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  /** When true: shows grab cursor, hides context menu */
  isArranging?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

function ChairTop({ isFree }: { isFree: boolean }) {
  return (
    <Box
      sx={{
        width: 18,
        height: 11,
        borderRadius: "4px 4px 1px 1px",
        bgcolor: isFree ? "#4ade80" : "#fb923c",
        border: "1.5px solid",
        borderColor: isFree ? "#16a34a" : "#ea580c",
        boxShadow: "0 -1px 3px rgba(0,0,0,0.12)",
      }}
    />
  );
}

function ChairBottom({ isFree }: { isFree: boolean }) {
  return (
    <Box
      sx={{
        width: 18,
        height: 11,
        borderRadius: "1px 1px 4px 4px",
        bgcolor: isFree ? "#4ade80" : "#fb923c",
        border: "1.5px solid",
        borderColor: isFree ? "#16a34a" : "#ea580c",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}
    />
  );
}

function ChairSide({ isFree }: { isFree: boolean }) {
  return (
    <Box
      sx={{
        width: 11,
        height: 22,
        borderRadius: "3px",
        bgcolor: isFree ? "#4ade80" : "#fb923c",
        border: "1.5px solid",
        borderColor: isFree ? "#16a34a" : "#ea580c",
        boxShadow: "1px 0 3px rgba(0,0,0,0.12)",
      }}
    />
  );
}

export function TableTile({
  table,
  canEdit,
  onEdit,
  onDelete,
  isArranging = false,
  onMouseDown,
  onTouchStart,
}: TableTileProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const isFree = !table.isOccupied;
  const capacity = Math.max(table.capacity || 4, 1);

  // Distribute chairs: top + bottom take up to 4 each (max 8 without sides).
  // Side chairs only appear for capacity > 8, one on each side per extra pair.
  const sideCount = Math.max(0, Math.floor((capacity - 8) / 2));
  const remaining = capacity - sideCount * 2;
  const topCount = Math.min(Math.ceil(remaining / 2), 4);
  const bottomCount = Math.min(Math.floor(remaining / 2), 4);
  const hasSideChairs = sideCount > 0;

  return (
    <Box
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      sx={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
        cursor: isArranging ? "grab" : "default",
        "&:active": isArranging ? { cursor: "grabbing" } : {},
      }}
    >
      {/* Top chairs */}
      <Box sx={{ display: "flex", gap: 0.6, pb: 0.4 }}>
        {Array.from({ length: topCount }).map((_, i) => (
          <ChairTop key={i} isFree={isFree} />
        ))}
      </Box>

      {/* Table row: optional left chair + surface + optional right chair */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
        {hasSideChairs && <ChairSide isFree={isFree} />}

        {/* Table surface */}
        <Box
          sx={{
            position: "relative",
            width: 94,
            minHeight: 80,
            borderRadius: "8px",
            background: isFree
              ? "linear-gradient(160deg, #f0fdf4 0%, #bbf7d0 100%)"
              : "linear-gradient(160deg, #fff7ed 0%, #fed7aa 100%)",
            border: "2.5px solid",
            borderColor: isFree ? "#22c55e" : "#f97316",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isFree
              ? "0 3px 10px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.7)"
              : "0 3px 10px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.7)",
            py: 1.25,
          }}
        >
          {/* Edit menu button — hidden when arranging */}
          {canEdit && !isArranging && (
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: 2,
                right: 2,
                bgcolor: "rgba(255,255,255,0.75)",
                width: 20,
                height: 20,
                "&:hover": { bgcolor: "rgba(255,255,255,1)" },
              }}
              onClick={(e) => {
                e.stopPropagation();
                setMenuAnchor(e.currentTarget);
              }}
            >
              <MoreVertIcon sx={{ fontSize: 12 }} />
            </IconButton>
          )}

          {/* Table name / label */}
          <Typography
            fontWeight={900}
            sx={{
              fontSize: table.label && table.label.length > 12 ? 12 : 16,
              lineHeight: 1.3,
              color: isFree ? "#065f46" : "#7c2d12",
              textAlign: "center",
              maxWidth: 82,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
              letterSpacing: "-0.3px",
              textShadow: isFree
                ? "0 1px 0 rgba(255,255,255,0.8)"
                : "0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            {table.label || `Table ${table.number}`}
          </Typography>

          {/* Status badge */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.6 }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: isFree ? "#22c55e" : "#f97316",
              }}
            />
            <Typography
              sx={{
                fontSize: 9,
                fontWeight: 700,
                color: isFree ? "#15803d" : "#c2410c",
                lineHeight: 1,
              }}
            >
              {isFree ? "Free" : "Busy"}
            </Typography>
          </Box>
        </Box>

        {hasSideChairs && <ChairSide isFree={isFree} />}
      </Box>

      {/* Bottom chairs */}
      <Box sx={{ display: "flex", gap: 0.6, pt: 0.4 }}>
        {Array.from({ length: bottomCount }).map((_, i) => (
          <ChairBottom key={i} isFree={isFree} />
        ))}
      </Box>

      {/* Context menu */}
      {canEdit && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              onEdit();
            }}
          >
            <EditIcon sx={{ mr: 1.5, fontSize: 18 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              onDelete();
            }}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
            Delete
          </MenuItem>
        </Menu>
      )}
    </Box>
  );
}
