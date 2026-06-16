import { useCallback, useEffect, useState } from "react";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Snackbar,
  Alert,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { TenantSidebar, TENANT_DRAWER_WIDTH } from "./TenantSidebar";
import { TenantTopbar } from "./TenantTopbar";
import { TENANT_NAV_ITEMS } from "./tenantNavItems";
import { useAuthStore } from "@/store/authStore";
import type { StaffRole } from "@/types/staff.types";
import { useStaffSocket } from "@/hooks/useStaffSocket";
import { useCallingTablesStore } from "@/store/callingTablesStore";
import { useNotificationsStore } from "@/store/notificationsStore";
import { playCallSound } from "@/utils/playCallSound";
import { orderKeys } from "@/api/queryKeys";

export function TenantDashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const showBottomNav = useMediaQuery(theme.breakpoints.down("lg"));
  const location = useLocation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role) as StaffRole | undefined;

  const queryClient = useQueryClient();
  const { addCall, removeCall } = useCallingTablesStore();
  const { fetch: fetchNotifications, prepend } = useNotificationsStore();
  const [callAlert, setCallAlert] = useState<string | null>(null);

  // Load existing notifications once on mount
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useStaffSocket(useCallback((event, data) => {
    if (event === "order:created" || event === "order:updated" || event === "order:item-ready") {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    } else if (event === "waiter:call") {
      const { tableId, tableNumber, tableLabel } = data as {
        tableId: string; tableNumber?: number; tableLabel?: string;
      };
      const msg = `Table ${tableNumber ?? "?"}${tableLabel ? ` · ${tableLabel}` : ""} is calling for the waiter`;
      playCallSound();
      setCallAlert(msg + "!");
      addCall(tableId);
      setTimeout(() => removeCall(tableId), 10_000);
      // Prepend a synthetic notification so the bell shows it immediately
      prepend({ _id: `call-${Date.now()}`, message: msg, isRead: false, createdAt: new Date().toISOString(), targetRole: "waiter" });
    } else if (event === "notification") {
      const { message, orderId } = data as { message: string; orderId?: string };
      prepend({ _id: `notif-${Date.now()}`, message, orderId, isRead: false, createdAt: new Date().toISOString(), targetRole: "" });
      // Re-fetch to get the real DB id so mark-read works
      fetchNotifications();
    }
  }, [queryClient, addCall, removeCall, prepend, fetchNotifications]));

  const visibleNavItems = TENANT_NAV_ITEMS.filter(
    (item) => role && item.allowedRoles.includes(role),
  );

  // Only Dashboard / Orders / Menu / Tables appear in the mobile bottom nav
  const bottomNavItems = visibleNavItems.filter((item) => item.showInBottomNav);

  const currentNavIndex = bottomNavItems.findIndex(
    (item) => item.path === location.pathname,
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <TenantTopbar onMenuClick={() => setMobileOpen(true)} />

      {!showBottomNav && (
        <TenantSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      )}

      {/* Page content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${TENANT_DRAWER_WIDTH}px)` },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "background.default",
        }}
      >
        <Toolbar sx={{ flexShrink: 0 }} />
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            minHeight: 0,
            pb: { xs: 7, lg: 0 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Waiter call alert — always visible regardless of current page */}
      <Snackbar
        open={!!callAlert}
        autoHideDuration={8000}
        onClose={() => setCallAlert(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          variant="filled"
          onClose={() => setCallAlert(null)}
          sx={{ fontWeight: 700, fontSize: 14, bgcolor: "#7c3aed", "& .MuiAlert-icon": { fontSize: 22 } }}
          icon="🔔"
        >
          {callAlert}
        </Alert>
      </Snackbar>

      {/* Bottom Navigation (mobile) */}
      {showBottomNav && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: "appBar",
          }}
          elevation={3}
        >
          <BottomNavigation
            value={currentNavIndex >= 0 ? currentNavIndex : false}
            onChange={(_, newValue: number) =>
              navigate(bottomNavItems[newValue].path)
            }
          >
            {bottomNavItems.map(({ label, icon: Icon }) => (
              <BottomNavigationAction
                key={label}
                label={label}
                icon={<Icon />}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
