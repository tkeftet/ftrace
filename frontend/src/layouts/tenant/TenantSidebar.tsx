 import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation, useNavigate } from "react-router-dom";
import { TENANT_NAV_ITEMS } from "./tenantNavItems";
import { useAuthStore } from "@/store/authStore";
import { getTenantSlug } from "@/utils/tenant";
import { ROUTES } from "@/router/routes";
import type { StaffRole } from "@/types/staff.types";

export const TENANT_DRAWER_WIDTH = 240;

const SIDEBAR_BG = "#0f172a";
const ACTIVE_COLOR = "#fbbf24";

const navItemSx = {
  borderRadius: 1,
  mb: 0.5,
  color: "rgba(255,255,255,0.65)",
  borderLeft: "3px solid transparent",
  pl: "13px",
  "& .MuiListItemIcon-root": { color: "rgba(255,255,255,0.4)", minWidth: 36 },
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.9)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(251,191,36,0.12)",
    color: "white",
    borderLeft: `3px solid ${ACTIVE_COLOR}`,
    "& .MuiListItemIcon-root": { color: ACTIVE_COLOR },
    "&:hover": { backgroundColor: "rgba(251,191,36,0.18)" },
  },
};

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
}

export function TenantSidebar({ mobileOpen, onClose }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const role = useAuthStore((s) => s.user?.role) as StaffRole | undefined;
  const slug = getTenantSlug();

  const visibleNavItems = TENANT_NAV_ITEMS.filter(
    (item) => role && item.allowedRoles.includes(role),
  );

  const handleLogout = () => {
    logout();
    navigate(ROUTES.TENANT_LOGIN);
  };

  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: SIDEBAR_BG,
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          color="white"
          letterSpacing={0.5}
        >
          FullTrace
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: ACTIVE_COLOR,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            fontWeight: 600,
          }}
        >
          {slug ?? "Tenant"}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1, pt: 1 }}>
        {visibleNavItems.map(({ label, icon: Icon, path }) => (
          <ListItemButton
            key={path}
            selected={location.pathname === path}
            onClick={() => {
              navigate(path);
              onClose();
            }}
            sx={navItemSx}
          >
            <ListItemIcon>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={label}
              primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Logout */}
      <List sx={{ px: 1, py: 1 }}>
        <ListItemButton onClick={handleLogout} sx={{ ...navItemSx, mb: 0 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
          />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { lg: TENANT_DRAWER_WIDTH }, flexShrink: { lg: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: TENANT_DRAWER_WIDTH,
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        {content}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            width: TENANT_DRAWER_WIDTH,
            boxSizing: "border-box",
            border: "none",
          },
        }}
        open
      >
        {content}
      </Drawer>
    </Box>
  );
}
