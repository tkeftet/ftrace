import { Box, Typography } from "@mui/material";
import { ProfileCard } from "../components/settings/ProfileCard";
import { SecurityCard } from "../components/settings/SecurityCard";
import { AppSnackbar } from "@/components/common/AppSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";

export default function SettingsPage() {
  const { snackbar, show, close } = useSnackbar();

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Settings</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage your profile and account security.
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, alignItems: "start" }}>
        <ProfileCard onSuccess={(msg) => show(msg, "success")} onError={(msg) => show(msg, "error")} />
        <SecurityCard onSuccess={(msg) => show(msg, "success")} onError={(msg) => show(msg, "error")} />
      </Box>

      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={close} />
    </Box>
  );
}
