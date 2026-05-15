import { Box, Typography } from "@mui/material";
import type { OrderStatus } from "@/api/endpoints/order.api";
import { STATUS_LABELS, STATUS_FILTER_LIST } from "./orderConstants";

interface StatusFilterBarProps {
  value: OrderStatus | "all";
  onChange: (v: OrderStatus | "all") => void;
}

/**
 * StatusFilterBar
 *
 * Each chip is rendered as a <button> (via Box component="button") so that:
 *  - It is keyboard-focusable and activatable with Enter/Space.
 *  - Screen readers announce it as interactive.
 *  - aria-pressed communicates the selected state.
 * The `type="button"` attribute prevents accidental form submission if this
 * is ever embedded inside a <form>.
 */
export function StatusFilterBar({ value, onChange }: StatusFilterBarProps) {
  return (
    <Box
      component="nav"
      aria-label="Filter orders by status"
      sx={{ display: "flex", flexWrap: "wrap", gap: 1, px: 2, pb: 2 }}
    >
      {STATUS_FILTER_LIST.map((s) => {
        const active = value === s;
        return (
          <Box
            key={s}
            component="button"
            type="button"
            aria-pressed={active}
            onClick={() => onChange(s)}
            sx={{
              px: 1.5,
              py: 0.55,
              borderRadius: 10,
              cursor: "pointer",
              border: "1.5px solid",
              borderColor: active ? "#b45309" : "divider",
              bgcolor: active ? "#b45309" : "background.paper",
              transition: "all .12s",
              WebkitTapHighlightColor: "transparent",
              // Preserve button focus ring for keyboard navigation
              "&:focus-visible": {
                outline: "2px solid #b45309",
                outlineOffset: 2,
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: active ? "#fff" : "text.secondary",
                whiteSpace: "nowrap",
              }}
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
