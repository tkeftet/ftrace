import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import LanguageIcon from "@mui/icons-material/Language";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TagIcon from "@mui/icons-material/Tag";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { useGetTenant } from "../hooks";
import { useSnackbar } from "@/hooks/useSnackbar";
import { TenantPlanChip } from "../components/TenantPlanChip";
import { TenantStatusBadge } from "../components/TenantStatusBadge";
import { TenantDialog } from "../components/TenantDialog";
import { AppSnackbar } from "@/components/common/AppSnackbar";
import { getAvatarColor } from "../utils";
import type { TenantOwner } from "../types";

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <Box display="flex" alignItems="flex-start" gap={2} py={1.5}>
      <Box
        sx={{
          color: "primary.main",
          mt: 0.25,
          flexShrink: 0,
          display: "flex",
        }}
      >
        {icon}
      </Box>
      <Box flex={1} minWidth={0}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          letterSpacing={0.8}
          textTransform="uppercase"
          display="block"
        >
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={500} mt={0.25}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tenant, isLoading, isError } = useGetTenant(id ?? "");
  const [openEdit, setOpenEdit] = useState(false);
  const { snackbar, show, close } = useSnackbar();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !tenant) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, textTransform: "none" }}
        >
          Back
        </Button>
        <Typography color="error">Failed to load tenant details.</Typography>
      </Container>
    );
  }

  const bgColor = getAvatarColor(tenant.name);
  const initials = tenant.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const owner =
    tenant.owner && typeof tenant.owner === "object"
      ? (tenant.owner as TenantOwner)
      : null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Back */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, textTransform: "none", fontWeight: 600 }}
      >
        Back to Tenants
      </Button>

      {/* Header card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          mb: 3,
        }}
      >
        {/* Coloured banner */}
        <Box sx={{ height: 96, bgcolor: bgColor, opacity: 0.18 }} />

        {/* Avatar — overlaps banner */}
        <Box sx={{ px: 4, mt: -5 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: bgColor,
              fontSize: "1.8rem",
              fontWeight: 800,
              border: "3px solid",
              borderColor: "background.paper",
              boxShadow: 2,
            }}
          >
            {initials}
          </Avatar>
        </Box>

        {/* Content below avatar */}
        <Box sx={{ px: 4, pt: 1.5, pb: 3 }}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            gap={2}
          >
            {/* Name, slug, chips */}
            <Box>
              <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
                {tenant.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.disabled"
                fontFamily="monospace"
                mt={0.4}
                mb={1.5}
              >
                # {tenant.slug}
              </Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                <TenantPlanChip plan={tenant.plan} />
                <TenantStatusBadge isActive={tenant.isActive} />
              </Stack>
            </Box>

            {/* Edit button */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon fontSize="small" />}
              onClick={() => setOpenEdit(true)}
              sx={{
                flexShrink: 0,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Edit
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Details grid */}
      <Grid container spacing={3}>
        {/* Left column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 3,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              mb={1}
              color="text.secondary"
              letterSpacing={0.5}
              textTransform="uppercase"
            >
              Identity
            </Typography>
            <Divider sx={{ mb: 0.5 }} />
            <DetailRow
              icon={<TagIcon fontSize="small" />}
              label="Slug"
              value={tenant.slug}
            />
            <Divider />
            <DetailRow
              icon={<PersonIcon fontSize="small" />}
              label="Owner Name"
              value={owner?.name ?? "—"}
            />
            <Divider />
            <DetailRow
              icon={<EmailIcon fontSize="small" />}
              label="Owner Email"
              value={owner?.email ?? "—"}
            />
            <Divider />
            <DetailRow
              icon={<AttachMoneyIcon fontSize="small" />}
              label="Currency"
              value={tenant.currency}
            />
          </Paper>
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 3,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              mb={1}
              color="text.secondary"
              letterSpacing={0.5}
              textTransform="uppercase"
            >
              Configuration
            </Typography>
            <Divider sx={{ mb: 0.5 }} />
            <DetailRow
              icon={<LanguageIcon fontSize="small" />}
              label="Timezone"
              value={tenant.timezone}
            />
            <Divider />
            <DetailRow
              icon={<CalendarTodayIcon fontSize="small" />}
              label="Created At"
              value={format(new Date(tenant.createdAt), "PPP")}
            />
            <Divider />
            <DetailRow
              icon={<CalendarTodayIcon fontSize="small" />}
              label="Last Updated"
              value={format(new Date(tenant.updatedAt), "PPP")}
            />
          </Paper>
        </Grid>
      </Grid>

      <TenantDialog
        mode="edit"
        open={openEdit}
        tenant={tenant}
        onClose={() => setOpenEdit(false)}
        onSuccess={() => {
          setOpenEdit(false);
          show("Tenant updated successfully.");
        }}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </Container>
  );
}
