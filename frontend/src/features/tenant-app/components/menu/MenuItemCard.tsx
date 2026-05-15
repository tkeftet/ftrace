import { Box, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
import RestaurantIcon from "@mui/icons-material/Restaurant";

import type { MenuItem as IMenuItem } from "@/api/endpoints/menu.api";

export interface MenuItemCardProps {
  item: IMenuItem;
  // Order mode
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  // Admin mode
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MenuItemCard({
  item,
  quantity = 0,
  onAdd,
  onRemove,
  onEdit,
  onDelete,
}: MenuItemCardProps) {
  const inCart = quantity > 0;
  const isBar = item.target === "bar";

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "white",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxShadow: inCart
          ? "0 4px 16px rgba(26,58,92,0.18)"
          : "0 1px 4px rgba(0,0,0,0.08)",
        border: "1.5px solid",
        borderColor: inCart ? "#b45309" : "rgba(0,0,0,0.05)",
        transition: "box-shadow .18s, border-color .18s",
        WebkitTapHighlightColor: "transparent",
        opacity: item.isAvailable === false ? 0.6 : 1,
      }}
    >
      {/* Image area — fixed height so all cards stay the same size */}
      {item.image ? (
        <Box
          component="img"
          src={item.image}
          alt={item.name}
          sx={{ width: "100%", height: 90, objectFit: "cover", flexShrink: 0, display: "block" }}
        />
      ) : (
        <Box
          sx={{
            height: 90,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isBar
              ? "linear-gradient(135deg,#dbeafe,#eff6ff)"
              : "linear-gradient(135deg,#fef3c7,#fffbeb)",
          }}
        >
          <RestaurantIcon sx={{ fontSize: 32, color: isBar ? "#93c5fd" : "#fcd34d" }} />
        </Box>
      )}

      <Box
        sx={{
          p: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.4,
        }}
      >
        {/* Station badge */}
        <Box
          sx={{
            display: "inline-flex",
            px: 0.6,
            py: 0.15,
            borderRadius: 0.75,
            bgcolor: isBar ? "rgba(37,99,235,0.09)" : "rgba(217,119,6,0.09)",
            alignSelf: "flex-start",
          }}
        >
          <Typography
            sx={{
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: isBar ? "#1d4ed8" : "#92400e",
              lineHeight: 1.4,
            }}
          >
            {isBar ? "Bar" : "Kitchen"}
          </Typography>
        </Box>

        {/* Name */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 12,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flex: 1,
          }}
        >
          {item.name}
        </Typography>

        {/* Price row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 0.25,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 12, color: "#b45309" }}>
            MAD {item.price.toFixed(2)}
          </Typography>
          {item.isAvailable === false && (
            <Typography sx={{ fontSize: 8, fontWeight: 700, color: "#dc2626" }}>
              ✕
            </Typography>
          )}
        </Box>

        {/* ── Order mode ── */}
        {onAdd && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.25 }}>
            {inCart ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <IconButton
                  size="small"
                  onClick={onRemove}
                  sx={{
                    width: 22,
                    height: 22,
                    bgcolor: "#fee2e2",
                    p: 0,
                    "&:hover": { bgcolor: "#fecaca" },
                  }}
                >
                  <RemoveIcon sx={{ fontSize: 12, color: "#dc2626" }} />
                </IconButton>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 12,
                    minWidth: 14,
                    textAlign: "center",
                  }}
                >
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={onAdd}
                  sx={{
                    width: 22,
                    height: 22,
                    bgcolor: "#b45309",
                    color: "white",
                    p: 0,
                    "&:hover": { bgcolor: "#92400e" },
                  }}
                >
                  <AddIcon sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                size="small"
                onClick={onAdd}
                sx={{
                  width: 26,
                  height: 26,
                  bgcolor: "#b45309",
                  color: "white",
                  p: 0,
                  "&:hover": { bgcolor: "#92400e" },
                  "&:active": { transform: "scale(0.9)" },
                  transition: "transform .1s",
                }}
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>
        )}

        {/* ── Admin mode ── */}
        {(onEdit || onDelete) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 0.25,
              pt: 0.4,
              borderTop: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {onEdit && (
              <IconButton
                size="small"
                onClick={onEdit}
                sx={{
                  width: 26,
                  height: 26,
                  color: "#b45309",
                  p: 0,
                  "&:hover": { bgcolor: "rgba(26,58,92,0.08)" },
                }}
              >
                <EditIcon sx={{ fontSize: 13 }} />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{
                  width: 26,
                  height: 26,
                  color: "#ef4444",
                  p: 0,
                  "&:hover": { bgcolor: "rgba(239,68,68,0.08)" },
                }}
              >
                <DeleteIcon sx={{ fontSize: 13 }} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
