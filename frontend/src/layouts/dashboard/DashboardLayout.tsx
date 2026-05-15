import { useState } from "react";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, DRAWER_WIDTH } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NAV_ITEMS } from "./navItems";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const showBottomNav = useMediaQuery(theme.breakpoints.down("lg"));
  const location = useLocation();
  const navigate = useNavigate();

  const currentNavIndex = NAV_ITEMS.findIndex(
    (item) => item.path === location.pathname,
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Topbar onMenuClick={() => setMobileOpen(true)} />

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Page content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: "100vh",
          backgroundColor: "background.default",
          pb: { xs: 7, sm: 0 },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Bottom Navigation (xs–md) */}
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
              navigate(NAV_ITEMS[newValue].path)
            }
          >
            {NAV_ITEMS.map(({ label, icon: Icon }) => (
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
