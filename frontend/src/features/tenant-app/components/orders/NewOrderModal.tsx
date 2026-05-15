import React from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  Slide,
  Typography,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import CloseIcon from "@mui/icons-material/Close";
import type { Table } from "@/api/endpoints/table.api";
import type { MenuItem } from "@/api/endpoints/menu.api";
import type { CartItem } from "./orderConstants";
import { MenuBrowser } from "../menu/MenuBrowser";

const SlideUp = React.forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement }
>(function SlideUp(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
  table: Table | undefined;
  cart: CartItem[];
  onAdd: (item: MenuItem) => void;
  onRemove: (id: string) => void;
  cartCount: number;
  cartTotal: number;
  onViewCart: () => void;
}

export function NewOrderModal({
  open,
  onClose,
  table,
  cart,
  onAdd,
  onRemove,
  cartCount,
  cartTotal,
  onViewCart,
}: NewOrderModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={SlideUp}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          bgcolor: "#f8fafc",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: "#b45309",
            px: 2,
            pt: { xs: 3, sm: 2 },
            pb: 1.5,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.12)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
              mr: 0.5,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              sx={{ color: "white", lineHeight: 1.2 }}
            >
              Table {table?.number}
              {table?.label ? ` · ${table.label}` : ""}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.65)" }}
            >
              {table?.capacity} seat{table?.capacity !== 1 ? "s" : ""}
              {" · "}
              <Box
                component="span"
                sx={{
                  color: table?.isOccupied ? "#fdba74" : "#86efac",
                  fontWeight: 600,
                }}
              >
                {table?.isOccupied ? "Occupied" : "Free"}
              </Box>
            </Typography>
          </Box>
          {cartCount > 0 && (
            <Box
              sx={{
                bgcolor: "#f59e0b",
                borderRadius: "50%",
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(245,158,11,0.5)",
              }}
            >
              <Typography
                variant="caption"
                fontWeight={900}
                sx={{ color: "white", fontSize: 13, lineHeight: 1 }}
              >
                {cartCount}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Scrollable menu */}
        <Box sx={{ flex: 1, overflowY: "auto", bgcolor: "background.paper" }}>
          {table ? (
            <MenuBrowser cart={cart} onAdd={onAdd} onRemove={onRemove} />
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={28} />
            </Box>
          )}
        </Box>

        {/* Review Order bar */}
        {cartCount > 0 && (
          <Box
            sx={{
              flexShrink: 0,
              px: 2,
              pt: 1.5,
              pb: { xs: 3, sm: 2 },
              bgcolor: "background.paper",
              borderTop: "1px solid",
              borderColor: "divider",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.09)",
            }}
          >
            <Box
              onClick={onViewCart}
              sx={{
                height: 54,
                borderRadius: 2.5,
                bgcolor: "#b45309",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(26,58,92,0.3)",
                WebkitTapHighlightColor: "transparent",
                "&:active": { opacity: 0.9 },
              }}
            >
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.35,
                  minWidth: 32,
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" fontWeight={800} sx={{ color: "white" }}>
                  {cartCount}
                </Typography>
              </Box>
              <Typography fontWeight={700} sx={{ color: "white", fontSize: 15 }}>
                Review Order
              </Typography>
              <Typography fontWeight={800} sx={{ color: "white", fontSize: 15 }}>
                MAD {cartTotal.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
