import { Box, Typography } from "@mui/material";
import { useAuthStore } from "@/store/authStore";

export default function TenantDashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Welcome back, {user?.name} 👋
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Here's what's happening at your restaurant today.
      </Typography>
    </Box>
  );
}
