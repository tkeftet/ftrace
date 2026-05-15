import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { Order, OrderStatus } from "@/api/endpoints/order.api";
import { STATUS_LABELS, STATUS_BORDER, STATUS_BG, NEXT_STATUS } from "./orderConstants";
import { useUpdateRoundStatus } from "../../hooks/orders";
import { extractError } from "@/utils/extractError";
import { useSnackbar } from "@/hooks/useSnackbar";
import { AppSnackbar } from "@/components/common/AppSnackbar";

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  order: Order;
}

export function OrderDetailModal({ open, onClose, order }: OrderDetailModalProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const updateRound = useUpdateRoundStatus();
  const { snackbar, show, close: closeSnackbar } = useSnackbar();
  const [pendingRound, setPendingRound] = useState<number | null>(null);

  const table =
    typeof order.table === "string"
      ? { number: "?", label: undefined }
      : order.table;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Use rounds array from backend; fall back to deriving from items for old orders
  const roundNumbers: number[] = order.rounds?.length
    ? order.rounds.map((r) => r.roundNumber).sort((a, b) => a - b)
    : Array.from(new Set(order.items.map((i) => i.roundNumber ?? 1))).sort((a, b) => a - b);

  const getRoundStatus = (roundNumber: number): OrderStatus => {
    const stored = order.rounds?.find((r) => r.roundNumber === roundNumber);
    if (stored) return stored.status;
    // fallback: derive from isReady
    const items = order.items.filter((i) => (i.roundNumber ?? 1) === roundNumber);
    if (items.every((i) => i.isReady)) return "ready";
    if (items.some((i) => i.isReady)) return "preparing";
    return "pending";
  };

  const isMultiRound = roundNumbers.length > 1;
  const history = (order.statusHistory ?? []).filter(
    (e, i, arr) => i === 0 || e.status !== arr[i - 1].status
  );

  const handleRoundStatus = (roundNumber: number, status: OrderStatus) => {
    setPendingRound(roundNumber);
    updateRound.mutate(
      { id: order._id, roundNumber, status },
      {
        onError: (err) => show(extractError(err), "error"),
        onSettled: () => setPendingRound(null),
      }
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xs"
        fullScreen={fullScreen}
        PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3, overflow: "hidden" } }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            bgcolor: "#b45309",
            px: 2,
            pt: { xs: 3.5, sm: 2 },
            pb: 1.5,
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={900} fontSize={16} color="white" lineHeight={1.2}>
              Table {table.number}
              {table.label ? ` · ${table.label}` : ""}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5, flexWrap: "wrap" }}>
              <Box sx={{ px: 0.9, py: 0.15, borderRadius: 1, bgcolor: "rgba(255,255,255,0.18)" }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "white" }}>
                  {STATUS_LABELS[order.status]}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
                {fmt(order.createdAt)}
                {order.customerName ? ` · ${order.customerName}` : ""}
                {order.createdBy ? ` · ${order.createdBy.name}` : " · Self-order"}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "white", bgcolor: "rgba(255,255,255,0.12)", mt: -0.25 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ── Scrollable body ── */}
        <Box sx={{ overflowY: "auto", maxHeight: { xs: "100%", sm: "75vh" } }}>

          {/* ── Rounds ── */}
          <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
            {roundNumbers.map((roundNumber) => {
              const roundStatus = getRoundStatus(roundNumber);
              const roundItems = order.items.filter((i) => (i.roundNumber ?? 1) === roundNumber);
              const nextRoundStatus = NEXT_STATUS[roundStatus];
              const statusColor = STATUS_BORDER[roundStatus];
              const isLast = roundNumber === Math.max(...roundNumbers);

              return (
                <Box key={roundNumber} sx={{ mb: 1.5 }}>
                  {/* Round header row */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                    <Typography
                      sx={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.7, color: "#94a3b8" }}
                    >
                      {isMultiRound ? `Round ${roundNumber}` : "Items"}
                    </Typography>
                    <Box sx={{ flex: 1, height: 1, bgcolor: "#e2e8f0" }} />
                    {/* Status badge */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.4,
                        px: 0.9,
                        py: 0.2,
                        borderRadius: 1,
                        bgcolor: STATUS_BG[roundStatus],
                        border: "1px solid",
                        borderColor: `${statusColor}44`,
                      }}
                    >
                      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: statusColor }} />
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: statusColor }}>
                        {STATUS_LABELS[roundStatus]}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Items card */}
                  <Box
                    sx={{
                      borderRadius: 1.5,
                      bgcolor: roundStatus === "served" || roundStatus === "paid" ? "#f0fdf4" : roundStatus === "ready" ? "#f0fdf4" : isLast ? "#fafafa" : "#f8fafc",
                      border: "1px solid",
                      borderColor: roundStatus === "served" || roundStatus === "ready" ? "#bbf7d0" : `${statusColor}30`,
                      overflow: "hidden",
                      mb: 0.75,
                    }}
                  >
                    {roundItems.map((item, idx) => (
                      <Box
                        key={item._id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          px: 1.25,
                          py: 0.6,
                          borderBottom: idx < roundItems.length - 1 ? "1px solid #e2e8f0" : "none",
                          opacity: item.isReady ? 0.5 : 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 1,
                            bgcolor: item.isReady ? "#e2e8f0" : "#fef3c7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            mr: 1,
                          }}
                        >
                          <Typography sx={{ fontSize: 10, fontWeight: 900, color: item.isReady ? "#94a3b8" : "#92400e" }}>
                            {item.quantity}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: 13,
                            textDecoration: item.isReady ? "line-through" : "none",
                            color: item.isReady ? "#94a3b8" : "text.primary",
                          }}
                        >
                          {item.name}
                          {item.notes && (
                            <Box component="span" sx={{ fontSize: 11, color: "#94a3b8", fontWeight: 400, ml: 0.5 }}>
                              · {item.notes}
                            </Box>
                          )}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0, ml: 1 }}>
                          <Box sx={{ px: 0.5, py: 0.1, borderRadius: 0.75, bgcolor: item.target === "bar" ? "rgba(37,99,235,0.08)" : "rgba(217,119,6,0.08)" }}>
                            <Typography sx={{ fontSize: 9, fontWeight: 700, color: item.target === "bar" ? "#1d4ed8" : "#92400e" }}>
                              {item.target === "bar" ? "Bar" : "Kit"}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, minWidth: 56, textAlign: "right", color: item.isReady ? "#94a3b8" : "#b45309" }}>
                            MAD {(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Per-round status actions (only for multi-round orders) */}
                  {isMultiRound && roundStatus !== "paid" && roundStatus !== "cancelled" && (
                    <Box sx={{ display: "flex", gap: 0.75 }}>
                      {nextRoundStatus && (
                        <Button
                          size="small"
                          variant="contained"
                          disabled={pendingRound === roundNumber}
                          onClick={() => handleRoundStatus(roundNumber, nextRoundStatus)}
                          sx={{
                            flex: 1,
                            borderRadius: 1.5,
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: 12,
                            py: 0.6,
                            bgcolor: nextRoundStatus === "served" ? "#059669" : "#b45309",
                            "&:hover": { bgcolor: nextRoundStatus === "served" ? "#047857" : "#92400e" },
                          }}
                        >
                          {pendingRound === roundNumber ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            `${STATUS_LABELS[nextRoundStatus]} →`
                          )}
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={pendingRound === roundNumber}
                        onClick={() => handleRoundStatus(roundNumber, "cancelled")}
                        sx={{
                          borderRadius: 1.5,
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: 12,
                          py: 0.6,
                          minWidth: 64,
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              );
            })}

            {/* Total */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 1.25,
                py: 0.75,
                bgcolor: "#fff7ed",
                borderRadius: 1.5,
                border: "1px solid #fde68a",
                mb: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Total</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#b45309" }}>
                MAD {order.totalAmount.toFixed(2)}
              </Typography>
            </Box>

            {/* Mark Paid — shown when all rounds are served (multi-round) or for single-round served */}
            {order.status === "served" && (
              <Button
                fullWidth
                variant="contained"
                disabled={updateRound.isPending}
                onClick={() => {
                  if (isMultiRound) {
                    roundNumbers.forEach((rn) => handleRoundStatus(rn, "paid"));
                  }
                  onClose();
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  py: 1,
                  bgcolor: "#059669",
                  "&:hover": { bgcolor: "#047857" },
                  mb: 1,
                }}
              >
                💳 Mark Paid
              </Button>
            )}
          </Box>

          {/* ── Status history — horizontal flow ── */}
          {history.length > 0 && (
            <Box sx={{ borderTop: "1px solid #f1f5f9", px: 2, pt: 1.25, pb: 2 }}>
              <Typography
                sx={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.7, color: "#94a3b8", mb: 1 }}
              >
                Status history
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  overflowX: "auto",
                  pb: 0.5,
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {history.map((entry, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", flexShrink: 0 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 68 }}>
                      <Box
                        sx={{
                          px: 0.9,
                          py: 0.35,
                          borderRadius: 1.5,
                          bgcolor: STATUS_BG[entry.status],
                          border: "1.5px solid",
                          borderColor: `${STATUS_BORDER[entry.status]}55`,
                          mb: 0.4,
                        }}
                      >
                        <Typography sx={{ fontSize: 10, fontWeight: 800, color: STATUS_BORDER[entry.status], whiteSpace: "nowrap" }}>
                          {STATUS_LABELS[entry.status]}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 9, color: "#94a3b8", textAlign: "center", lineHeight: 1.3 }}>
                        {fmt(entry.changedAt)}
                      </Typography>
                      <Typography sx={{ fontSize: 9, color: "#b45309", fontWeight: 600, textAlign: "center", lineHeight: 1.3, maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.changedBy ? entry.changedBy.name : "Guest"}
                      </Typography>
                    </Box>
                    {idx < history.length - 1 && (
                      <Box sx={{ display: "flex", alignItems: "center", mt: 0.6, mx: 0.15 }}>
                        <ArrowForwardIcon sx={{ fontSize: 12, color: "#cbd5e1" }} />
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Dialog>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </>
  );
}
