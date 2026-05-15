/**
 * TableOrderPage — Customer-facing self-order page.
 * POS-style layout: menu grid on the left, live order panel on the right.
 * On mobile the order panel collapses into a bottom drawer.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  publicApi,
  type PublicMenuItem,
  type PublicOrder,
} from "@/api/endpoints/public.api";
import { useSessionStore } from "@/store/sessionStore";
import { getTenantSlug } from "@/utils/tenant";
import { extractError } from "@/utils/extractError";
import { randomUUID } from "@/utils/uuid";

/* ── Types ───────────────────────────────────────────── */
interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}

interface MenuData {
  categories: { _id: string; name: string }[];
  items: PublicMenuItem[];
  tenantName: string;
  currency: string;
}

/* ── Shared format helper ────────────────────────────── */
const fmt = (n: number, currency = "") => `${currency} ${n.toFixed(2)}`.trim();

/* ════════════════════════════════════════════════════════
   ORDER PANEL  (used both in the sidebar and the drawer)
════════════════════════════════════════════════════════ */
function OrderPanel({
  cart,
  menu,
  customerName,
  setCustomerName,
  onAdd,
  onRemove,
  onDelete,
  onSubmit,
  submitting,
  submitError,
}: {
  cart: CartItem[];
  menu: MenuData | null;
  customerName: string;
  setCustomerName: (v: string) => void;
  onAdd: (item: PublicMenuItem) => void;
  onRemove: (id: string) => void;
  onDelete: (id: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
}) {
  const currency = menu?.currency ?? "";
  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "white",
      }}
    >
      {/* Panel header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: "1px solid #f1f5f9",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
        }}
      >
        <ReceiptLongIcon sx={{ color: "#b45309", fontSize: 22 }} />
        <Typography fontWeight={900} fontSize={16} color="#b45309">
          Current Order
        </Typography>
        {cartCount > 0 && (
          <Box
            sx={{
              ml: "auto",
              bgcolor: "#b45309",
              color: "white",
              borderRadius: 99,
              px: 1.25,
              py: 0.1,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {cartCount} item{cartCount !== 1 ? "s" : ""}
          </Box>
        )}
      </Box>

      {/* Item list */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1 }}>
        {cart.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 1.5,
              opacity: 0.45,
              py: 4,
            }}
          >
            <ReceiptLongIcon sx={{ fontSize: 40, color: "#94a3b8" }} />
            <Typography fontSize={13} color="text.secondary" textAlign="center">
              Tap items to add them
            </Typography>
          </Box>
        ) : (
          cart.map((item, idx) => (
            <Box key={item.menuItemId}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 1.25,
                }}
              >
                {/* Qty stepper */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    bgcolor: "#f8fafc",
                    borderRadius: 2,
                    p: "3px",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => onRemove(item.menuItemId)}
                    sx={{
                      width: 26,
                      height: 26,
                      bgcolor: "white",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <RemoveIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                  <Typography
                    fontWeight={800}
                    fontSize={13}
                    minWidth={20}
                    textAlign="center"
                  >
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const mi = menu?.items.find(
                        (i) => i._id === item.menuItemId,
                      );
                      if (mi) onAdd(mi);
                    }}
                    sx={{
                      width: 26,
                      height: 26,
                      bgcolor: "#b45309",
                      color: "white",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      "&:hover": { bgcolor: "#92400e" },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Box>

                {/* Name + price */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700} fontSize={13} noWrap>
                    {item.name}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    {fmt(item.price, currency)} × {item.quantity}
                  </Typography>
                </Box>

                {/* Line total */}
                <Typography
                  fontWeight={800}
                  fontSize={13}
                  color="#b45309"
                  flexShrink={0}
                >
                  {fmt(item.price * item.quantity, currency)}
                </Typography>

                {/* Delete */}
                <IconButton
                  size="small"
                  onClick={() => onDelete(item.menuItemId)}
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
              {idx < cart.length - 1 && (
                <Divider sx={{ borderColor: "#f8fafc" }} />
              )}
            </Box>
          ))
        )}
      </Box>

      {/* Footer: name + total + CTA */}
      {cart.length > 0 && (
        <Box
          sx={{
            px: 2,
            pb: 2.5,
            pt: 1.5,
            borderTop: "1px solid #f1f5f9",
            flexShrink: 0,
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Your name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            sx={{
              mb: 1.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#f8fafc",
              },
            }}
          />

          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
          >
            <Typography color="text.secondary" fontSize={13} fontWeight={600}>
              Total
            </Typography>
            <Typography fontWeight={900} fontSize={17} color="#b45309">
              {fmt(cartTotal, currency)}
            </Typography>
          </Box>

          {submitError && (
            <Typography color="error" fontSize={12} mb={1} display="block">
              {submitError}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onSubmit}
            disabled={submitting}
            sx={{
              bgcolor: "#b45309",
              "&:hover": { bgcolor: "#92400e" },
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: "none",
              fontSize: 15,
              py: 1.3,
              boxShadow: "0 4px 14px rgba(26,58,92,0.3)",
            }}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Place Order"
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   ITEM TILE  — full-card image with text overlay
   Name + price always visible regardless of card width.
════════════════════════════════════════════════════════ */
function ItemTile({
  item,
  qty,
  currency,
  onAdd,
  onRemove,
}: {
  item: PublicMenuItem;
  qty: number;
  currency: string;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const inCart = qty > 0;
  return (
    <Box
      onClick={onAdd}
      sx={{
        position: "relative",
        borderRadius: 2.5,
        overflow: "hidden",
        cursor: "pointer",
        height: 150,
        border: "2.5px solid",
        borderColor: inCart ? "#b45309" : "transparent",
        boxShadow: inCart
          ? "0 0 0 3px rgba(180,83,9,0.18), 0 2px 10px rgba(0,0,0,0.12)"
          : "0 1px 5px rgba(0,0,0,0.09)",
        transition: "transform .13s, box-shadow .13s",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        "&:active": { transform: "scale(0.96)" },
      }}
    >
      {/* Background: real image or warm placeholder */}
      {item.image ? (
        <Box
          component="img"
          src={item.image}
          alt={item.name}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RestaurantIcon sx={{ fontSize: 38, color: "#fcd34d" }} />
        </Box>
      )}

      {/* Gradient overlay — ensures text is always readable */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.04) 30%, rgba(0,0,0,0.72) 100%)",
        }}
      />

      {/* Qty badge — top right */}
      {inCart && (
        <Box
          sx={{
            position: "absolute",
            top: 7,
            right: 7,
            bgcolor: "#b45309",
            color: "white",
            borderRadius: "50%",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 900,
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        >
          {qty}
        </Box>
      )}

      {/* Remove button — top left */}
      {inCart && (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          sx={{
            position: "absolute",
            top: 7,
            left: 7,
            width: 24,
            height: 24,
            bgcolor: "rgba(255,255,255,0.88)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            "&:hover": { bgcolor: "white" },
          }}
        >
          <RemoveIcon sx={{ fontSize: 13, color: "#b45309" }} />
        </Box>
      )}

      {/* Name + price pinned to the bottom */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          px: 1.25,
          pb: 1.1,
          pt: 0.5,
        }}
      >
        <Typography
          fontWeight={700}
          fontSize={12}
          lineHeight={1.3}
          color="white"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          {item.name}
        </Typography>
        <Typography
          fontWeight={900}
          fontSize={13}
          color="white"
          mt={0.4}
          sx={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
        >
          {fmt(item.price, currency)}
        </Typography>
      </Box>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   MY ORDER VIEW
════════════════════════════════════════════════════════ */
const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  ready: "#10b981",
  served: "#64748b",
  paid: "#059669",
  cancelled: "#ef4444",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Order received",
  confirmed: "Confirmed",
  preparing: "Being prepared",
  ready: "Ready!",
  served: "Served",
  paid: "Paid",
  cancelled: "Cancelled",
};

function MyOrderView({
  order,
  currency,
  onOrderMore,
}: {
  order: PublicOrder | null;
  currency: string;
  onOrderMore: () => void;
}) {
  if (!order) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          p: 4,
          bgcolor: "#f8fafc",
        }}
      >
        <ReceiptLongIcon sx={{ fontSize: 52, color: "#cbd5e1" }} />
        <Typography fontWeight={700} color="text.secondary" textAlign="center">
          No active order yet.
        </Typography>
        <Box
          onClick={onOrderMore}
          sx={{
            px: 3,
            py: 1.1,
            borderRadius: 99,
            bgcolor: "#b45309",
            cursor: "pointer",
          }}
        >
          <Typography fontWeight={700} fontSize={14} color="white">
            Browse menu
          </Typography>
        </Box>
      </Box>
    );
  }

  const roundNumbers = order.rounds?.length
    ? order.rounds.map((r) => r.roundNumber).sort((a, b) => a - b)
    : Array.from(new Set(order.items.map((i) => i.roundNumber ?? 1))).sort(
        (a, b) => a - b,
      );

  const getRoundStatus = (rn: number) => {
    const stored = order.rounds?.find((r) => r.roundNumber === rn);
    return stored?.status ?? "pending";
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "#f8fafc",
      }}
    >
      {/* Overall status banner */}
      <Box
        sx={{
          mx: 2,
          mt: 1.5,
          mb: 1,
          px: 2,
          py: 1.25,
          borderRadius: 2.5,
          bgcolor: `${STATUS_COLOR[order.status] ?? "#94a3b8"}15`,
          border: "1.5px solid",
          borderColor: `${STATUS_COLOR[order.status] ?? "#94a3b8"}40`,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            flexShrink: 0,
            bgcolor: STATUS_COLOR[order.status] ?? "#94a3b8",
            boxShadow: `0 0 0 3px ${STATUS_COLOR[order.status] ?? "#94a3b8"}30`,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            fontWeight={800}
            fontSize={14}
            sx={{ color: STATUS_COLOR[order.status] ?? "#94a3b8" }}
          >
            {STATUS_LABEL[order.status] ?? order.status}
          </Typography>
          <Typography fontSize={11} color="text.secondary">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""} · MAD{" "}
            {order.totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* Rounds */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 2 }}>
        {roundNumbers.map((rn) => {
          const roundStatus = getRoundStatus(rn);
          const roundItems = order.items.filter(
            (i) => (i.roundNumber ?? 1) === rn,
          );
          const color = STATUS_COLOR[roundStatus] ?? "#94a3b8";
          const label = STATUS_LABEL[roundStatus] ?? roundStatus;

          return (
            <Box key={rn} sx={{ mb: 1.5 }}>
              {/* Round header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  mb: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                    color: "#94a3b8",
                  }}
                >
                  {roundNumbers.length > 1 ? `Round ${rn}` : "Your order"}
                </Typography>
                <Box sx={{ flex: 1, height: 1, bgcolor: "#e2e8f0" }} />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.4,
                    px: 0.8,
                    py: 0.2,
                    borderRadius: 1,
                    bgcolor: `${color}15`,
                    border: "1px solid",
                    borderColor: `${color}30`,
                  }}
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      bgcolor: color,
                    }}
                  />
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color }}>
                    {label}
                  </Typography>
                </Box>
              </Box>

              {/* Items */}
              <Box
                sx={{
                  borderRadius: 2,
                  bgcolor: "white",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                }}
              >
                {roundItems.map((item, idx) => (
                  <Box
                    key={item._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 1.5,
                      py: 0.85,
                      borderBottom:
                        idx < roundItems.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                      opacity: item.isReady ? 0.5 : 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: 1,
                        bgcolor: item.isReady ? "#f1f5f9" : "#fef3c7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        mr: 1.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 900,
                          color: item.isReady ? "#94a3b8" : "#92400e",
                        }}
                      >
                        {item.quantity}
                      </Typography>
                    </Box>
                    <Typography
                      fontWeight={600}
                      fontSize={14}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        textDecoration: item.isReady ? "line-through" : "none",
                        color: item.isReady ? "#94a3b8" : "text.primary",
                      }}
                      noWrap
                    >
                      {item.name}
                      {item.notes && (
                        <Box
                          component="span"
                          sx={{
                            fontSize: 12,
                            color: "#94a3b8",
                            fontWeight: 400,
                            ml: 0.5,
                          }}
                        >
                          · {item.notes}
                        </Box>
                      )}
                    </Typography>
                    <Typography
                      fontWeight={700}
                      fontSize={13}
                      sx={{
                        color: item.isReady ? "#94a3b8" : "#b45309",
                        ml: 1,
                        flexShrink: 0,
                      }}
                    >
                      {fmt(item.price * item.quantity, currency)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}

        {/* Total + add more */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 1.5,
            py: 0.9,
            bgcolor: "#fff7ed",
            borderRadius: 2,
            border: "1px solid #fde68a",
            mb: 1.5,
          }}
        >
          <Typography fontWeight={700} fontSize={13} color="#92400e">
            Total
          </Typography>
          <Typography fontWeight={900} fontSize={14} color="#b45309">
            MAD {order.totalAmount.toFixed(2)}
          </Typography>
        </Box>

        <Box
          onClick={onOrderMore}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            py: 1.1,
            borderRadius: 2.5,
            bgcolor: "#b45309",
            cursor: "pointer",
          }}
        >
          <AddIcon sx={{ color: "white", fontSize: 18 }} />
          <Typography fontWeight={700} fontSize={14} color="white">
            Order more
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */
export default function TableOrderPage() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId") ?? "";
  const slug = getTenantSlug() ?? "";
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const { session, setSession, isExpired } = useSessionStore();
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [menuLoading, setMenuLoading] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [wasMerged, setWasMerged] = useState(false);
  const [activeView, setActiveView] = useState<"menu" | "order">("menu");
  const [currentOrder, setCurrentOrder] = useState<PublicOrder | null>(null);
  const [waiterCalled, setWaiterCalled] = useState(false);

  // Keep session in a ref so fetchCurrentOrder never changes identity
  const sessionRef = useRef(session); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { sessionRef.current = session; });

  const fetchCurrentOrder = useCallback(() => {
    if (!slug || !sessionRef.current) return;
    publicApi
      .getMyOrder(slug)
      .then((res) => {
        setCurrentOrder((prev) => {
          const next = res.data;
          // Skip re-render when nothing meaningful changed
          if (!next && !prev) return prev;
          if (!next || !prev) return next;
          if (
            prev._id === next._id &&
            prev.status === next.status &&
            prev.totalAmount === next.totalAmount &&
            prev.items.length === next.items.length
          ) return prev;
          return next;
        });
      })
      .catch(() => {});
  }, [slug]); // stable — slug never changes after mount

  /* ── Session ─────────────────────────────────────── */
  useEffect(() => {
    if (!tableId || !slug) return;
    if (session && !isExpired() && session.tableId === tableId) return;
    setScanning(true);
    setScanError(null);
    publicApi
      .scanQr(slug, tableId)
      .then((res) => {
        const s = res.data.session;
        setSession({
          sessionToken: res.data.sessionToken,
          sessionId: s.sessionId,
          tenantId: s.tenantId,
          tableId: s.tableId,
          tableNumber: s.tableNumber,
          tableLabel: s.tableLabel,
          expiresAt: s.expiresAt,
        });
      })
      .catch((err) => setScanError(extractError(err)))
      .finally(() => setScanning(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, slug]);

  /* ── Menu ────────────────────────────────────────── */
  useEffect(() => {
    if (!slug) return;
    setMenuLoading(true);
    publicApi
      .getMenu(slug)
      .then((res) => {
        const d = res.data;
        setMenu({
          categories: d.categories,
          items: d.items,
          tenantName: d.tenant.name,
          currency: d.tenant.currency,
        });
        setActiveCategory(d.categories[0]?._id ?? null);
      })
      .catch(() => {})
      .finally(() => setMenuLoading(false));
  }, [slug]);

  /* ── Poll current order every 15 s ──────────────── */
  const hasSession = !!session;
  useEffect(() => {
    if (!hasSession) return;
    fetchCurrentOrder();
    const id = setInterval(fetchCurrentOrder, 15_000);
    return () => clearInterval(id);
  }, [hasSession, fetchCurrentOrder]);

  /* ── Cart helpers ────────────────────────────────── */
  const addItem = (item: PublicMenuItem) =>
    setCart((prev) => {
      const hit = prev.find((c) => c.menuItemId === item._id);
      if (hit)
        return prev.map((c) =>
          c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      return [
        ...prev,
        {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          notes: "",
        },
      ];
    });

  const removeItem = (id: string) =>
    setCart((prev) => {
      const hit = prev.find((c) => c.menuItemId === id);
      if (!hit) return prev;
      return hit.quantity === 1
        ? prev.filter((c) => c.menuItemId !== id)
        : prev.map((c) =>
            c.menuItemId === id ? { ...c, quantity: c.quantity - 1 } : c,
          );
    });

  const deleteItem = (id: string) =>
    setCart((prev) => prev.filter((c) => c.menuItemId !== id));

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  /* ── Submit ──────────────────────────────────────── */
  const handleSubmit = async () => {
    if (cart.length === 0 || !tableId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await publicApi.placeOrder({
        tableId,
        customerName: customerName.trim() || undefined,
        nonce: randomUUID(),
        items: cart.map((c) => ({
          menuItemId: c.menuItemId,
          quantity: c.quantity,
          notes: c.notes || undefined,
        })),
      });
      setCart([]);
      setCartOpen(false);
      setWasMerged(res.data.merged);
      setOrderPlaced(true);
      fetchCurrentOrder();
      setTimeout(() => {
        setOrderPlaced(false);
        setActiveView("order");
      }, 2500);
    } catch (err) {
      setSubmitError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCallWaiter = async () => {
    if (waiterCalled || !slug) return;
    try {
      await publicApi.callWaiter(slug);
      setWaiterCalled(true);
      setTimeout(() => setWaiterCalled(false), 30_000);
    } catch {
      // silent fail
    }
  };

  const orderPanelProps = {
    cart,
    menu,
    customerName,
    setCustomerName,
    onAdd: addItem,
    onRemove: removeItem,
    onDelete: deleteItem,
    onSubmit: handleSubmit,
    submitting,
    submitError,
  };

  /* ── Guard states ────────────────────────────────── */
  if (!tableId || !slug)
    return (
      <Splash
        icon="🚫"
        title="Invalid QR Code"
        sub="Ask staff for a new one."
      />
    );
  if (scanning) return <Splash loading title="Opening your table…" />;
  if (scanError)
    return (
      <Splash
        icon="⚠️"
        title="Cannot open table"
        sub={scanError}
        color="#dc2626"
      >
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{
            bgcolor: "#b45309",
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Try again
        </Button>
      </Splash>
    );

  /* ── Order success ───────────────────────────────── */
  if (orderPlaced)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f0fdf4",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          gap: 2.5,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            bgcolor: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 52, color: "#16a34a" }} />
        </Box>
        <Typography variant="h5" fontWeight={900} color="#14532d">
          {wasMerged ? "Items added!" : "Order placed!"}
        </Typography>
        <Typography color="#4b7c5e" maxWidth={300}>
          {wasMerged
            ? "Added to your existing order. Staff has been notified."
            : "Your order is being prepared. Sit back and relax!"}
        </Typography>
        <Button
          onClick={() => setOrderPlaced(false)}
          variant="contained"
          sx={{
            mt: 1,
            bgcolor: "#16a34a",
            "&:hover": { bgcolor: "#15803d" },
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 700,
            px: 4,
            py: 1.2,
          }}
        >
          Order more
        </Button>
      </Box>
    );

  /* ── Visible items ───────────────────────────────── */
  const visibleItems = activeCategory
    ? (menu?.items ?? []).filter((i) => {
        const cat = i.category;
        return typeof cat === "string"
          ? cat === activeCategory
          : cat._id === activeCategory;
      })
    : (menu?.items ?? []);
  /* ── Main POS render ─────────────────────────────── */
  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        overflow: "hidden",
      }}
    >
      {/* ── Header bar ───────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 3 },
          pt: { xs: 2.5, sm: 1.75 },
          pb: 1.5,
          background: "linear-gradient(135deg, #b45309 0%, #92400e 100%)",
          flexShrink: 0,
          gap: 2,
        }}
      >
        {/* Left: brand name + subtitle */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            fontWeight={900}
            fontSize={18}
            color="white"
            lineHeight={1.1}
            noWrap
          >
            {menu?.tenantName ?? "Menu"}
          </Typography>
          <Typography
            fontSize={11}
            sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 500, mt: 0.2 }}
          >
            Self-order menu
          </Typography>
        </Box>

        {/* Table chip */}
        <Box
          sx={{
            flexShrink: 0,
            bgcolor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(4px)",
            border: "1.5px solid rgba(255,255,255,0.25)",
            borderRadius: 2.5,
            px: 1.75,
            py: 0.75,
            textAlign: "center",
            minWidth: 64,
          }}
        >
          <Typography
            sx={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 9,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              lineHeight: 1,
            }}
          >
            Table
          </Typography>
          <Typography
            sx={{
              color: "white",
              fontWeight: 900,
              fontSize: 17,
              lineHeight: 1.15,
              mt: 0.2,
            }}
          >
            {session?.tableNumber ?? "—"}
          </Typography>
          {session?.tableLabel && (
            <Typography
              sx={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 9,
                fontWeight: 600,
                lineHeight: 1,
                mt: 0.15,
              }}
            >
              {session.tableLabel}
            </Typography>
          )}
        </Box>

        {/* Call waiter bell button */}
        <Box
          onClick={handleCallWaiter}
          sx={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.25,
            cursor: waiterCalled ? "default" : "pointer",
            opacity: waiterCalled ? 0.7 : 1,
            bgcolor: waiterCalled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.15)",
            border: "1.5px solid",
            borderColor: waiterCalled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.3)",
            borderRadius: 2.5,
            px: 1.25,
            py: 0.75,
            transition: "all .2s",
            userSelect: "none",
            "&:active": { transform: waiterCalled ? "none" : "scale(0.93)" },
          }}
        >
          <NotificationsIcon
            sx={{
              fontSize: 20,
              color: waiterCalled ? "rgba(255,255,255,0.5)" : "white",
              animation: waiterCalled ? "none" : undefined,
            }}
          />
          <Typography sx={{ fontSize: 9, fontWeight: 800, color: waiterCalled ? "rgba(255,255,255,0.5)" : "white", letterSpacing: 0.5, lineHeight: 1 }}>
            {waiterCalled ? "Sent!" : "Call"}
          </Typography>
        </Box>
      </Box>

      {/* ── Tab switcher ─────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          bgcolor: "white",
          borderBottom: "1px solid #e2e8f0",
          flexShrink: 0,
          px: 1,
        }}
      >
        {(["menu", "order"] as const).map((v) => {
          const isActive = activeView === v;
          const orderStatusLabel = currentOrder
            ? (STATUS_LABEL[currentOrder.status] ?? currentOrder.status)
            : null;
          return (
            <Box
              key={v}
              onClick={() => setActiveView(v)}
              sx={{
                px: 2,
                py: 1.1,
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                userSelect: "none",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2.5,
                  borderRadius: "2px 2px 0 0",
                  bgcolor: isActive ? "#b45309" : "transparent",
                  transition: "background .15s",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isActive ? "#b45309" : "#94a3b8",
                  transition: "color .15s",
                }}
              >
                {v === "menu" ? "Menu" : "My Order"}
              </Typography>
              {v === "order" && orderStatusLabel && (
                <Box
                  sx={{
                    px: 0.9,
                    py: 0.15,
                    borderRadius: 99,
                    bgcolor: isActive ? "#b4530918" : "#f1f5f9",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: isActive ? "#b45309" : "#94a3b8",
                    }}
                  >
                    {orderStatusLabel}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* ── Body: menu left + order right ────────────── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          bgcolor: "#f8fafc",
        }}
      >
        {/* ── My Order view ────────────────────────── */}
        {activeView === "order" && (
          <MyOrderView
            order={currentOrder}
            currency={menu?.currency ?? ""}
            onOrderMore={() => setActiveView("menu")}
          />
        )}

        {/* ── Left: category tabs + item grid ──────── */}
        <Box
          sx={{
            flex: 1,
            display: activeView === "menu" ? "flex" : "none",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Category tabs */}
          {menu && (
            <Box
              sx={{
                position: "relative",
                flexShrink: 0,
                bgcolor: "white",
                borderBottom: "1px solid #e9ecef",
              }}
            >
              {/* Right-edge fade hint */}
              <Box
                sx={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 48,
                  background: "linear-gradient(to right, transparent, white)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  gap: 0.75,
                  px: 1.5,
                  pr: 6,
                  py: 1,
                  overflowX: "auto",
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
              >
                {menu.categories.map((cat) => {
                  const active = activeCategory === cat._id;
                  return (
                    <Box
                      key={cat._id}
                      onClick={() => setActiveCategory(cat._id)}
                      sx={{
                        flexShrink: 0,
                        px: 2.25,
                        py: 0.75,
                        borderRadius: 99,
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 14,
                        bgcolor: active ? "#b45309" : "#f1f5f9",
                        color: active ? "white" : "#64748b",
                        transition: "all .13s",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat.name}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Item grid */}
          {menuLoading ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress sx={{ color: "#b45309" }} />
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: { xs: 1.25, md: 2 },
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: { xs: 1, md: 1.25 },
                alignContent: "start",
              }}
            >
              {visibleItems.map((item) => (
                <ItemTile
                  key={item._id}
                  item={item}
                  qty={
                    cart.find((c) => c.menuItemId === item._id)?.quantity ?? 0
                  }
                  currency={menu?.currency ?? ""}
                  onAdd={() => addItem(item)}
                  onRemove={() => removeItem(item._id)}
                />
              ))}
              {visibleItems.length === 0 && (
                <Box
                  sx={{
                    gridColumn: "1/-1",
                    textAlign: "center",
                    pt: 8,
                    color: "text.secondary",
                    fontSize: 14,
                  }}
                >
                  No items in this category.
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* ── Right: order panel (desktop) ─────────── */}
        {isDesktop && (
          <Box
            sx={{
              width: 300,
              flexShrink: 0,
              borderLeft: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <OrderPanel {...orderPanelProps} />
          </Box>
        )}
      </Box>

      {/* ── Mobile: sticky cart bar ───────────────── */}
      {!isDesktop && cartCount > 0 && (
        <Box
          sx={{
            flexShrink: 0,
            px: 2,
            pt: 1.5,
            pb: { xs: 3, sm: 2 },
            bgcolor: "background.paper",
            borderTop: "1px solid #e2e8f0",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.09)",
          }}
          onClick={() => setCartOpen(true)}
        >
          <Box
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
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{ color: "white" }}
              >
                {cartCount}
              </Typography>
            </Box>
            <Typography fontWeight={700} sx={{ color: "white", fontSize: 15 }}>
              View Order
            </Typography>
            <Typography fontWeight={800} sx={{ color: "white", fontSize: 15 }}>
              {fmt(cartTotal, menu?.currency ?? "")}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Mobile: cart drawer ───────────────────── */}
      {!isDesktop && (
        <Drawer
          anchor="bottom"
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          PaperProps={{ sx: { borderRadius: "20px 20px 0 0", height: "80vh" } }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", pt: 1.25 }}>
            <Box
              sx={{
                width: 36,
                height: 4,
                borderRadius: 99,
                bgcolor: "#e2e8f0",
              }}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <OrderPanel {...orderPanelProps} />
          </Box>
        </Drawer>
      )}
    </Box>
  );
}

/* ── Splash helper ───────────────────────────────────── */
function Splash({
  icon,
  title,
  sub,
  color,
  loading,
  children,
}: {
  icon?: string;
  title: string;
  sub?: string;
  color?: string;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        textAlign: "center",
        gap: 2,
        bgcolor: "#F0F2F5",
      }}
    >
      {loading && <CircularProgress sx={{ color: "#b45309" }} />}
      {icon && <Typography fontSize={48}>{icon}</Typography>}
      <Typography variant="h6" fontWeight={800} color={color ?? "#b45309"}>
        {title}
      </Typography>
      {sub && (
        <Typography color="text.secondary" maxWidth={300} fontSize={14}>
          {sub}
        </Typography>
      )}
      {children}
    </Box>
  );
}
