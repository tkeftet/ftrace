/**
 * OrdersPage
 *
 * Responsibilities after refactor:
 *  - Layout and composition of order-related UI panels.
 *  - Delegates all cart mutations to the `useCartManager` hook.
 *  - Memoizes derived data (activeOrders, filteredOrders, selectedTable) with
 *    `useMemo` so expensive filters don't re-run on every keystroke.
 */
import { useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { TablePills } from "../components/orders/TablePills";
import { CartDrawer } from "../components/orders/CartDrawer";
import { NewOrderModal } from "../components/orders/NewOrderModal";
import { LiveOrderCard } from "../components/orders/LiveOrderCard";
import { StatusFilterBar } from "../components/orders/StatusFilterBar";

import { useTables } from "../hooks/tables";
import { useFloors } from "../hooks/floors";
import {
  useOrders,
  useCreateOrder,
  useUpdateOrderStatus,
  useCartManager,
} from "../hooks/orders";
import { AppSnackbar } from "@/components/common/AppSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";
import { extractError } from "@/utils/extractError";
import type { OrderStatus } from "@/api/endpoints/order.api";
import { useCallingTablesStore } from "@/store/callingTablesStore";

export default function OrdersPage() {
  const { snackbar, show, close: closeSnackbar } = useSnackbar();

  const { data: tables = [], isLoading: loadingTables } = useTables();
  const { data: floors = [] } = useFloors();
  const { data: orders = [], isLoading: loadingOrders } = useOrders();

  // New Order tab — auto-selects first floor, no "All"
  const [activeFloorId, setActiveFloorId] = useState<string>("");

  useEffect(() => {
    if (floors.length === 0) return;
    if (!activeFloorId || !floors.find((f) => f._id === activeFloorId)) {
      setActiveFloorId(floors[0]._id);
    }
  }, [floors, activeFloorId]);

  const floorTables = useMemo(
    () => (activeFloorId ? tables.filter((t) => t.floorId === activeFloorId) : tables),
    [tables, activeFloorId],
  );

  // Live tab — "all" floors by default
  const [liveFloorId, setLiveFloorId] = useState<string>("all");
  const createOrder = useCreateOrder();
  const updateStatus = useUpdateOrderStatus();

  // Cart state fully owned by the dedicated hook — no inline mutation logic here.
  const {
    cart,
    customerName,
    setCustomerName,
    addToCart,
    removeOne: removeOneFromCart,
    changeQty,
    changeNotes,
    removeFromCart,
    clearCart,
    total: cartTotal,
    count: cartCount,
  } = useCartManager();

  const { callingTables } = useCallingTablesStore();

  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  // Memoized derived data prevents redundant array scans on every render.
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "paid" && o.status !== "cancelled"),
    [orders],
  );
  const filteredOrders = useMemo(() => {
    let result = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);
    if (liveFloorId !== "all") {
      result = result.filter((o) => {
        const tableId = typeof o.table === "string" ? o.table : o.table._id;
        return tables.find((t) => t._id === tableId)?.floorId === liveFloorId;
      });
    }
    return result;
  }, [orders, statusFilter, liveFloorId, tables]);
  const selectedTable = useMemo(
    () => tables.find((t) => t._id === selectedTableId),
    [tables, selectedTableId],
  );

  const handleSubmit = () => {
    if (!selectedTableId || cart.length === 0) return;
    createOrder.mutate(
      {
        tableId: selectedTableId,
        customerName: customerName.trim() || undefined,
        items: cart.map((c) => ({
          menuItemId: c.menuItemId,
          quantity: c.quantity,
          notes: c.notes || undefined,
        })),
      },
      {
        onSuccess: (result) => {
          show(
            result.merged
              ? "Items added to the existing order."
              : "Order placed!",
            "success",
          );
          clearCart();
          setSelectedTableId(null);
          setCartOpen(false);
          setNewOrderOpen(false);
          setActiveTab(1);
        },
        onError: (err) => show(extractError(err), "error"),
      },
    );
  };

  const handleStatusChange = (id: string, status: OrderStatus) => {
    updateStatus.mutate(
      { id, status },
      { onError: (err) => show(extractError(err), "error") },
    );
  };

  return (
    <Box sx={{ pb: 2, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Box
        sx={{ px: { xs: 2, sm: 2.5, md: 3 }, pt: { xs: 2, sm: 2.5 }, pb: 1.5 }}
      >
        <Typography variant="h5" fontWeight={800} sx={{ color: "#b45309" }}>
          Orders
        </Typography>
        {activeOrders.length > 0 && (
          <Typography
            variant="caption"
            sx={{ color: "#f59e0b", fontWeight: 700 }}
          >
            {activeOrders.length} active order
            {activeOrders.length !== 1 ? "s" : ""}
          </Typography>
        )}
      </Box>

      <Box sx={{ px: { xs: 2, sm: 2.5, md: 3 }, mb: 2, maxWidth: 500 }}>
        <Box
          sx={{
            display: "flex",
            bgcolor: "#e2e8f0",
            borderRadius: 2.5,
            p: "4px",
            gap: "4px",
          }}
        >
          {(
            [
              { label: "New Order", idx: 0 },
              {
                label: `Live${activeOrders.length > 0 ? ` (${activeOrders.length})` : ""}`,
                idx: 1,
              },
            ] as const
          ).map(({ label, idx }) => (
            <Button
              key={idx}
              fullWidth
              onClick={() => setActiveTab(idx)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                py: 0.8,
                fontSize: 14,
                boxShadow:
                  activeTab === idx ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                bgcolor: activeTab === idx ? "#fff" : "transparent",
                color: activeTab === idx ? "#b45309" : "#64748b",
                "&:hover": {
                  bgcolor: activeTab === idx ? "#fff" : "rgba(255,255,255,0.5)",
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Box>

      {activeTab === 0 && (
        <Box>
          {/* Floor filter buttons */}
          {floors.length > 0 && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                px: { xs: 2, sm: 2.5, md: 3 },
                mb: 1.5,
                flexWrap: "wrap",
              }}
            >
              {floors.map((floor) => {
                const isActive = activeFloorId === floor._id;
                const count = tables.filter((t) => t.floorId === floor._id).length;
                return (
                  <Button
                    key={floor._id}
                    size="small"
                    onClick={() => setActiveFloorId(floor._id)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      px: 1.75,
                      py: 0.5,
                      bgcolor: isActive ? "#b45309" : "#e2e8f0",
                      color: isActive ? "#fff" : "#475569",
                      boxShadow: isActive ? "0 2px 8px rgba(26,58,92,0.25)" : "none",
                      "&:hover": {
                        bgcolor: isActive ? "#92400e" : "#cbd5e1",
                      },
                    }}
                  >
                    {floor.name}
                    <Box
                      component="span"
                      sx={{
                        ml: 0.75,
                        fontSize: 11,
                        opacity: 0.75,
                        fontWeight: 600,
                      }}
                    >
                      ({count})
                    </Box>
                  </Button>
                );
              })}
            </Box>
          )}

          <Box sx={{ px: { xs: 2, sm: 2.5, md: 3 }, mb: 0.25 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                fontSize: 11,
              }}
            >
              Select table
            </Typography>
          </Box>

          {loadingTables ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : tables.length === 0 ? (
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No tables configured. Add tables first.
              </Typography>
            </Box>
          ) : floorTables.length === 0 ? (
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No tables on this floor.
              </Typography>
            </Box>
          ) : (
            <TablePills
              tables={floorTables}
              selected={selectedTableId}
              onSelect={(id) => {
                setSelectedTableId(id);
                setNewOrderOpen(true);
              }}
            />
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Floor filter — All + individual floors */}
          {floors.length > 0 && (
            <Box
              sx={{
                display: "flex",
                gap: 0.75,
                px: { xs: 2, sm: 2.5, md: 3 },
                mb: 1.5,
                flexWrap: "wrap",
              }}
            >
              {[{ _id: "all", name: "All" }, ...floors].map((floor) => {
                const isActive = liveFloorId === floor._id;
                const count =
                  floor._id === "all"
                    ? orders.filter((o) => o.status !== "paid" && o.status !== "cancelled").length
                    : orders.filter((o) => {
                        const tableId = typeof o.table === "string" ? o.table : o.table._id;
                        return tables.find((t) => t._id === tableId)?.floorId === floor._id;
                      }).length;
                return (
                  <Button
                    key={floor._id}
                    size="small"
                    onClick={() => setLiveFloorId(floor._id)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      px: 1.75,
                      py: 0.5,
                      bgcolor: isActive ? "#b45309" : "#e2e8f0",
                      color: isActive ? "#fff" : "#475569",
                      boxShadow: isActive ? "0 2px 8px rgba(180,83,9,0.25)" : "none",
                      "&:hover": { bgcolor: isActive ? "#92400e" : "#cbd5e1" },
                    }}
                  >
                    {floor.name}
                    <Box component="span" sx={{ ml: 0.75, fontSize: 11, opacity: 0.75, fontWeight: 600 }}>
                      ({count})
                    </Box>
                  </Button>
                );
              })}
            </Box>
          )}

          <StatusFilterBar value={statusFilter} onChange={setStatusFilter} />
          <Box
            sx={{
              px: 2,
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 1.5,
              alignItems: "start",
            }}
          >
            {loadingOrders ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : filteredOrders.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <ReceiptLongIcon
                  sx={{ fontSize: 56, color: "#cbd5e1", mb: 1 }}
                />
                <Typography variant="body1" color="text.secondary">
                  No orders here.
                </Typography>
              </Box>
            ) : (
              filteredOrders.map((order) => {
                const tableId = typeof order.table === "string" ? order.table : order.table._id;
                return (
                  <LiveOrderCard
                    key={order._id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    loading={updateStatus.isPending}
                    isCalling={callingTables.has(tableId)}
                  />
                );
              })
            )}
          </Box>
        </Box>
      )}

      <NewOrderModal
        open={newOrderOpen}
        onClose={() => {
          setNewOrderOpen(false);
          if (cart.length === 0) setSelectedTableId(null);
        }}
        table={selectedTable}
        cart={cart}
        onAdd={addToCart}
        onRemove={removeOneFromCart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onViewCart={() => setCartOpen(true)}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        tableLabel={
          selectedTable
            ? `Table ${selectedTable.number}${selectedTable.label ? ` · ${selectedTable.label}` : ""}`
            : ""
        }
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        onQtyChange={changeQty}
        onNotesChange={changeNotes}
        onRemove={removeFromCart}
        onSubmit={handleSubmit}
        loading={createOrder.isPending}
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
