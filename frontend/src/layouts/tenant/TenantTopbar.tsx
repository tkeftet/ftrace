import { useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Popover,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useLocation, useNavigate } from "react-router-dom";
import { TENANT_DRAWER_WIDTH } from "./TenantSidebar";
import { TENANT_NAV_ITEMS } from "./tenantNavItems";
import { useAuthStore } from "@/store/authStore";
import { getTenantSlug } from "@/utils/tenant";
import { ROUTES } from "@/router/routes";
import type { StaffRole } from "@/types/staff.types";
import { useNotificationsStore } from "@/store/notificationsStore";

interface Props {
  onMenuClick: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function TenantTopbar({ onMenuClick }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const slug = getTenantSlug();
  const avatarLetter = user?.name?.[0]?.toUpperCase() ?? "?";
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);

  const { items: notifications, unreadCount, markRead, markAllRead } = useNotificationsStore();

  const role = user?.role as StaffRole | undefined;

  const profileMenuItems = TENANT_NAV_ITEMS.filter(
    (item) => !item.showInBottomNav && role && item.allowedRoles.includes(role),
  );

  const bottomNavPaths = TENANT_NAV_ITEMS.filter((i) => i.showInBottomNav).map(
    (i) => i.path,
  );
  const isOffBottomNav =
    isMobile && !bottomNavPaths.includes(location.pathname);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate(ROUTES.TENANT_LOGIN);
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { lg: `calc(100% - ${TENANT_DRAWER_WIDTH}px)` },
        ml: { lg: `${TENANT_DRAWER_WIDTH}px` },
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar>
        {isMobile ? (
          isOffBottomNav ? (
            <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          ) : null
        ) : (
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { lg: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={600} lineHeight={1}>
            {slug ?? "Dashboard"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Staff Portal
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {/* Notification bell */}
          <IconButton
            size="small"
            onClick={(e) => setNotifAnchor(e.currentTarget)}
          >
            <Badge badgeContent={unreadCount} color="error" max={9}>
              {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
            </Badge>
          </IconButton>

          {/* Profile button */}
          <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#b45309", fontSize: "0.875rem", fontWeight: 700 }}>
              {avatarLetter}
            </Avatar>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              {user?.name ?? "Staff"}
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      {/* ── Notification panel ── */}
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.75,
              width: { xs: "calc(100vw - 16px)", sm: 360 },
              maxHeight: 480,
              display: "flex",
              flexDirection: "column",
              borderRadius: 2.5,
              boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Panel header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f1f5f9",
            flexShrink: 0,
          }}
        >
          <Typography fontWeight={800} fontSize={15}>
            Notifications
            {unreadCount > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 0.9,
                  py: 0.15,
                  borderRadius: 99,
                  bgcolor: "#b45309",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 800,
                  verticalAlign: "middle",
                }}
              >
                {unreadCount}
              </Box>
            )}
          </Typography>
          {unreadCount > 0 && (
            <IconButton
              size="small"
              onClick={() => markAllRead()}
              sx={{ color: "#b45309" }}
              title="Mark all read"
            >
              <DoneAllIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Notification list */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 5,
                gap: 1.5,
                color: "#94a3b8",
              }}
            >
              <NotificationsNoneIcon sx={{ fontSize: 40 }} />
              <Typography fontSize={13} fontWeight={600}>
                No notifications yet
              </Typography>
            </Box>
          ) : (
            notifications.map((n, idx) => (
              <Box
                key={n._id}
                onClick={() => { if (!n.isRead) markRead(n._id); }}
                sx={{
                  px: 2,
                  py: 1.25,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.25,
                  cursor: n.isRead ? "default" : "pointer",
                  bgcolor: n.isRead ? "transparent" : "#fef9f0",
                  borderBottom: idx < notifications.length - 1 ? "1px solid #f8fafc" : "none",
                  transition: "background .15s",
                  "&:hover": { bgcolor: n.isRead ? "#f8fafc" : "#fef3e0" },
                }}
              >
                {/* Unread dot */}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: n.isRead ? "transparent" : "#b45309",
                    flexShrink: 0,
                    mt: 0.65,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    fontSize={13}
                    fontWeight={n.isRead ? 500 : 700}
                    color={n.isRead ? "text.secondary" : "text.primary"}
                    sx={{ lineHeight: 1.4 }}
                  >
                    {n.message}
                  </Typography>
                  <Typography fontSize={11} color="#94a3b8" mt={0.3}>
                    {timeAgo(n.createdAt)}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Popover>

      {/* Profile dropdown menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: { mt: 0.5, minWidth: 180 } } }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography variant="body2" fontWeight={700}>
            {user?.name ?? "Staff"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: "capitalize" }}
          >
            {user?.role}
          </Typography>
        </Box>

        <Divider />

        {profileMenuItems.map((item) => {
          const Icon = item.icon === PeopleIcon ? PeopleIcon : SettingsIcon;
          return (
            <MenuItem
              key={item.path}
              onClick={() => { setAnchorEl(null); navigate(item.path); }}
              sx={{ py: 1.25 }}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              {item.label}
            </MenuItem>
          );
        })}

        {profileMenuItems.length > 0 && <Divider />}

        <MenuItem onClick={handleLogout} sx={{ py: 1.25, color: "error.main" }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
