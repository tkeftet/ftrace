/**
 * LiveOrderCard
 *
 * Key improvements:
 *  - Wrapped in `React.memo` so it only re-renders when its own props change.
 *    This is valuable because OrdersPage renders a full grid of these cards
 *    and each `updateStatus` mutation call would otherwise repaint all of them.
 *  - The expand-toggle header is a real <button> (role="button" via Box
 *    component) with a descriptive aria-label so screen readers announce it
 *    properly and keyboard users can trigger it with Enter/Space.
 *  - The info icon button already uses MUI's IconButton (which renders a
 *    <button>), but now carries an aria-label for screen readers.
 */
import { memo, useState } from "react";

if (typeof document !== "undefined" && !document.getElementById("call-kf")) {
  const s = document.createElement("style");
  s.id = "call-kf";
  s.textContent = `
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
  0%,100% { box-shadow: 0 0 0 2.5px rgba(124,58,237,0.15); }
  50%      { box-shadow: 0 0 0 4px rgba(124,58,237,0.4); }
}
@keyframes callBar {
  0%,100% { background: #f97316; }
  50%      { background: #7c3aed; }
}`;
  document.head.appendChild(s);
}
import { Box, Button, Collapse, IconButton, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import type { Order, OrderStatus } from "@/api/endpoints/order.api";
import { STATUS_LABELS, STATUS_BORDER, NEXT_STATUS } from "./orderConstants";
import { OrderDetailModal } from "./OrderDetailModal";

interface LiveOrderCardProps {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  loading: boolean;
  isCalling?: boolean;
}

function LiveOrderCardBase({
  order,
  onStatusChange,
  loading,
  isCalling = false,
}: LiveOrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const table =
    typeof order.table === "string"
      ? { number: "?" as string | number, label: undefined }
      : order.table;
  const next = NEXT_STATUS[order.status];
  const roundCount = (order.rounds?.length ?? 0) || new Set(order.items.map((i) => i.roundNumber ?? 1)).size;
  const isMultiRound = roundCount > 1;

  return (
    <>
      <Box
        sx={{
          borderRadius: 2.5,
          overflow: "hidden",
          bgcolor: "background.paper",
          boxShadow: isCalling ? "0 0 0 2.5px rgba(124,58,237,0.35)" : "0 1px 6px rgba(0,0,0,0.08)",
          border: "1px solid",
          borderColor: isCalling ? "#7c3aed" : "divider",
          borderLeft: `4px solid ${isCalling ? "#7c3aed" : STATUS_BORDER[order.status]}`,
          width: "100%",
          boxSizing: "border-box",
          minWidth: 0,
          animation: isCalling ? "tableShake 0.5s ease 0s 2, callPulse 1s ease-in-out infinite" : "none",
        }}
      >
        {/* Tappable header — rendered as a <button> for full keyboard support */}
        <Box
          component="button"
          type="button"
          aria-expanded={expanded}
          aria-label={`Toggle order details for Table ${table.number}`}
          sx={{
            display: "block",
            width: "100%",
            textAlign: "left",
            background: "none",
            border: "none",
            p: 0,
            px: 2,
            pt: 1.5,
            pb: 1,
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
            "&:focus-visible": {
              outline: "2px solid #b45309",
              outlineOffset: -2,
            },
          }}
          onClick={() => setExpanded((p) => !p)}
        >
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={800}
                  sx={{ flexShrink: 0 }}
                >
                  Table {table.number}
                  {table.label ? ` · ${table.label}` : ""}
                </Typography>
                {isCalling && (
                  <Box sx={{ px: 0.75, py: 0.15, borderRadius: 1, bgcolor: "#7c3aed", flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 900, color: "white", letterSpacing: 0.5 }}>CALL</Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    px: 0.85,
                    py: 0.15,
                    borderRadius: 1,
                    bgcolor: STATUS_BORDER[order.status],
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: 10,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {STATUS_LABELS[order.status]}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {(() => {
                  const totalRounds = new Set(order.items.map((i) => i.roundNumber ?? 1)).size;
                  return totalRounds > 1
                    ? `${order.items.length} items · ${totalRounds} rounds`
                    : `${order.items.length} item${order.items.length !== 1 ? "s" : ""}`;
                })()}
                {" · "}
                <strong>MAD {order.totalAmount.toFixed(2)}</strong>
                {order.customerName ? ` · ${order.customerName}` : ""}
                {order.createdBy ? ` · ${order.createdBy.name}` : ""}
              </Typography>
            </Box>
            {/* Info button + chevron */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.25,
                flexShrink: 0,
              }}
            >
              <IconButton
                size="small"
                aria-label="View order details"
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailOpen(true);
                }}
                sx={{
                  width: 28,
                  height: 28,
                  color: "#94a3b8",
                  "&:hover": {
                    color: "#b45309",
                    bgcolor: "rgba(26,58,92,0.06)",
                  },
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
              <KeyboardArrowDownIcon
                sx={{
                  color: "text.disabled",
                  fontSize: 20,
                  transition: "transform .15s",
                  transform: expanded ? "rotate(180deg)" : "none",
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Expanded item list — grouped by round */}
        <Collapse in={expanded}>
          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "#f8fafc",
            }}
          >
            {(() => {
              const rounds = Array.from(
                new Set(order.items.map((i) => i.roundNumber ?? 1))
              ).sort((a, b) => a - b);

              return rounds.map((round) => {
                const roundItems = order.items.filter(
                  (i) => (i.roundNumber ?? 1) === round
                );
                const allReady = roundItems.every((i) => i.isReady);
                const anyReady = roundItems.some((i) => i.isReady);
                const roundStatus = allReady
                  ? "ready"
                  : anyReady
                  ? "partial"
                  : "preparing";

                const statusColor =
                  roundStatus === "ready"
                    ? "#059669"
                    : roundStatus === "partial"
                    ? "#d97706"
                    : "#64748b";
                const statusLabel =
                  roundStatus === "ready"
                    ? "✓ Ready"
                    : roundStatus === "partial"
                    ? "Partially ready"
                    : "Preparing…";

                return (
                  <Box key={round}>
                    {/* Round header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        py: 0.75,
                        bgcolor: roundStatus === "ready" ? "#f0fdf4" : "#f8fafc",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: 0.6,
                          color: "#94a3b8",
                        }}
                      >
                        Round {round}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                          bgcolor: `${statusColor}18`,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: statusColor,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: statusColor,
                          }}
                        >
                          {statusLabel}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Items in this round */}
                    <Box sx={{ px: 2, pt: 0.5, pb: 0.75 }}>
                      {roundItems.map((item) => (
                        <Box
                          key={item._id}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 0.4,
                            minWidth: 0,
                            opacity: item.isReady ? 0.55 : 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              mr: 1,
                              textDecoration: item.isReady
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {item.quantity}× {item.name}
                            {item.notes ? ` — ${item.notes}` : ""}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              flexShrink: 0,
                              fontWeight: 600,
                              color: item.isReady ? "#94a3b8" : "text.secondary",
                            }}
                          >
                            MAD {(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              });
            })()}
          </Box>
        </Collapse>

        {/* Action buttons */}
        {order.status !== "cancelled" && order.status !== "paid" && (
          <Box sx={{ px: 2, py: 1.25, display: "flex", gap: 1 }}>
            {isMultiRound ? (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setDetailOpen(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  py: 0.9,
                  fontSize: 13,
                  borderColor: "#b45309",
                  color: "#b45309",
                  "&:hover": { bgcolor: "rgba(180,83,9,0.06)", borderColor: "#92400e" },
                }}
              >
                Manage rounds →
              </Button>
            ) : (
              <>
                {next && (
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    onClick={() => onStatusChange(order._id, next)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      py: 0.9,
                      fontSize: 13,
                      bgcolor: next === "paid" ? "#059669" : "#b45309",
                      "&:hover": { bgcolor: next === "paid" ? "#047857" : "#92400e" },
                    }}
                  >
                    {next === "paid" ? "💳 Mark Paid" : `${STATUS_LABELS[next]} →`}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  disabled={loading}
                  onClick={() => onStatusChange(order._id, "cancelled")}
                  sx={{
                    flexShrink: 0,
                    minWidth: 72,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>

      <OrderDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        order={order}
      />
    </>
  );
}

/**
 * Memoized export: prevents re-renders when sibling cards' status changes.
 * The `loading` prop is shared across all cards (it reflects mutation pending
 * state), so without memo every card would flash a disabled state every time
 * any single status update is in flight.
 */
export const LiveOrderCard = memo(LiveOrderCardBase);
