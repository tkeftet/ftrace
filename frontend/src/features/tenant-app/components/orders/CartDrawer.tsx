import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  SwipeableDrawer,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { CartItem } from "./orderConstants";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  tableLabel: string;
  customerName: string;
  onCustomerNameChange: (v: string) => void;
  onQtyChange: (id: string, delta: number) => void;
  onNotesChange: (id: string, v: string) => void;
  onRemove: (id: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function CartDrawer({
  open,
  onClose,
  cart,
  tableLabel,
  customerName,
  onCustomerNameChange,
  onQtyChange,
  onNotesChange,
  onRemove,
  onSubmit,
  loading,
}: CartDrawerProps) {
  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      // onOpen is required by the SwipeableDrawer API but we disable swipe-to-open
      // so this is intentionally a no-op.
      onOpen={() => undefined}
      disableSwipeToOpen
      sx={{ zIndex: 1400 }}
    >
      <Box
        sx={{
          borderRadius: "20px 20px 0 0",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {/* Drag handle */}
        <Box
          sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}
        >
          <Box
            sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: "grey.300" }}
          />
        </Box>

        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            pb: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Your Order
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {tableLabel}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: "#b45309",
              color: "white",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" fontWeight={800}>
              MAD {total.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Scrollable items */}
        <Box sx={{ maxHeight: "42vh", overflowY: "auto" }}>
          {cart.map((item) => (
            <Box
              key={item.menuItemId}
              sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={700}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    MAD {item.price.toFixed(2)} × {item.quantity} ={" "}
                    <strong>MAD {(item.price * item.quantity).toFixed(2)}</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    aria-label={`Decrease quantity of ${item.name}`}
                    onClick={() => onQtyChange(item.menuItemId, -1)}
                    disabled={item.quantity <= 1}
                    sx={{ width: 30, height: 30 }}
                  >
                    <RemoveIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Typography
                    variant="body2"
                    fontWeight={800}
                    aria-label={`Quantity: ${item.quantity}`}
                    sx={{ minWidth: 22, textAlign: "center" }}
                  >
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label={`Increase quantity of ${item.name}`}
                    onClick={() => onQtyChange(item.menuItemId, 1)}
                    sx={{ width: 30, height: 30 }}
                  >
                    <AddIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => onRemove(item.menuItemId)}
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: "#fee2e2",
                      color: "#ef4444",
                      borderRadius: 1.5,
                      "&:hover": { bgcolor: "#fecaca" },
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
              <TextField
                size="small"
                placeholder="Add a note…"
                value={item.notes}
                onChange={(e) => onNotesChange(item.menuItemId, e.target.value)}
                fullWidth
                sx={{
                  mt: 1,
                  "& .MuiInputBase-input": { fontSize: 12, py: 0.6 },
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Customer name + submit */}
        <Box sx={{ px: 2.5, pt: 2, pb: 3 }}>
          <TextField
            label="Customer name (optional)"
            size="small"
            fullWidth
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || cart.length === 0}
            onClick={onSubmit}
            sx={{
              height: 54,
              fontWeight: 800,
              fontSize: 16,
              borderRadius: 2.5,
              bgcolor: "#b45309",
              "&:hover": { bgcolor: "#92400e" },
              textTransform: "none",
            }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              `Place Order · MAD ${total.toFixed(2)}`
            )}
          </Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
}
