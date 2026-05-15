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
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useLocation, useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "./navItems";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/router/routes";

export const DRAWER_WIDTH = 240;

const SIDEBAR_BG = "#162447";
const ACTIVE_COLOR = "#4fc3f7";

const navItemSx = {
  borderRadius: 1,
  mb: 0.5,
  color: "rgba(255,255,255,0.65)",
  borderLeft: "3px solid transparent",
  pl: "13px",
  "& .MuiListItemIcon-root": { color: "rgba(255,255,255,0.45)", minWidth: 36 },
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.9)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(79,195,247,0.1)",
    color: "white",
    borderLeft: `3px solid ${ACTIVE_COLOR}`,
    "& .MuiListItemIcon-root": { color: ACTIVE_COLOR },
    "&:hover": { backgroundColor: "rgba(79,195,247,0.15)" },
  },
};

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
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
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          color="white"
          letterSpacing={0.5}
        >
          TenantPro
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}
        >
          Executive Suite
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* Nav Items */}
      <List sx={{ flex: 1, px: 1, pt: 1 }}>
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
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

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* Help + Logout */}
      <List sx={{ px: 1, py: 1 }}>
        <ListItemButton sx={{ ...navItemSx, mb: 0 }}>
          <ListItemIcon>
            <HelpOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Help"
            primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
          />
        </ListItemButton>
        <ListItemButton onClick={handleLogout} sx={{ ...navItemSx, mb: 0 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
          />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop lg+ — permanent */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: SIDEBAR_BG,
            border: "none",
          },
        }}
        open
      >
        {content}
      </Drawer>

      {/* xs–md — temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, bgcolor: SIDEBAR_BG },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}
