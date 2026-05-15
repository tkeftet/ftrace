import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { DRAWER_WIDTH } from "./Sidebar";
import { useAuthStore } from "@/store/authStore";

interface Props {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: Props) {
  const user = useAuthStore((s) => s.user);
  const avatarLetter = user?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { lg: `${DRAWER_WIDTH}px` },
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { lg: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
          FullTrace
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <IconButton size="small">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {user?.name ?? "Profile"}
          </Typography>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: "primary.main",
              cursor: "pointer",
            }}
          >
            {avatarLetter}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
