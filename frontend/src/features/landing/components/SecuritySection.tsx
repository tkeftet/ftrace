import { Box, Container, Grid, Paper, Switch, Typography } from "@mui/material";
import RouterIcon from "@mui/icons-material/Router";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SyncIcon from "@mui/icons-material/Sync";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import type { SvgIconProps } from "@mui/material";
import type { ComponentType } from "react";

interface Protocol {
  Icon: ComponentType<SvgIconProps>;
  label: string;
  enabled: boolean;
}

interface SecurityFeature {
  title: string;
  description: string;
}

const PROTOCOLS: Protocol[] = [
  { Icon: RouterIcon, label: "Hardware Router", enabled: true },
  { Icon: AdminPanelSettingsIcon, label: "Role-Based Access", enabled: true },
  { Icon: SyncIcon, label: "Sync Management", enabled: false },
];

const SEC_FEATURES: SecurityFeature[] = [
  {
    title: "Network Fortitude",
    description:
      "Advanced router integration ensuring your POS stays live even during local outages.",
  },
  {
    title: "Granular Roles",
    description:
      "Define precise permissions for servers, managers, and owners across any location.",
  },
];

export function SecuritySection() {
  return (
    <Box sx={{ bgcolor: "#0B1437", py: { xs: 8, md: 14 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
          {/* ── Left: security protocol card ── */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "white",
                maxWidth: 360,
                mx: { xs: "auto", md: 0 },
              }}
              elevation={0}
            >
              {/* Card header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2.5,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="#0B1437"
                  fontSize="0.9rem"
                >
                  Security Protocol
                </Typography>
                <Box
                  sx={{
                    bgcolor: "#DCFCE7",
                    color: "#15803D",
                    px: 1.5,
                    py: 0.4,
                    borderRadius: 1,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  ACTIVE
                </Box>
              </Box>

              {/* Protocol rows */}
              {PROTOCOLS.map(({ Icon, label, enabled }) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1.5,
                    borderTop: "1px solid #F1F5F9",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "#F1F5F9",
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon sx={{ fontSize: 16, color: "#475569" }} />
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="#0B1437"
                    >
                      {label}
                    </Typography>
                  </Box>
                  <Switch
                    size="small"
                    defaultChecked={enabled}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#2563EB",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          bgcolor: "#2563EB",
                        },
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* ── Right: copy ── */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography
              component="h2"
              sx={{
                fontWeight: 800,
                color: "white",
                lineHeight: 1.15,
                mb: 2.5,
                fontSize: { xs: "1.9rem", md: "2.6rem" },
                letterSpacing: "-0.01em",
              }}
            >
              Seamless Control.
              <br />
              Zero Compromise.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.75,
                mb: 5,
                maxWidth: 480,
              }}
            >
              Precision engineering for high-stakes environments. Manage every
              layer of your operation from user permissions to network
              infrastructure through a single, secure gateway.
            </Typography>

            <Grid container spacing={4}>
              {SEC_FEATURES.map(({ title, description }, i) => (
                <Grid size={{ xs: 12, sm: 6 }} key={title}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "rgba(37,99,235,0.15)",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                    }}
                  >
                    {i === 0 ? (
                      <NetworkCheckIcon
                        sx={{ fontSize: 20, color: "#93C5FD" }}
                      />
                    ) : (
                      <ManageAccountsIcon
                        sx={{ fontSize: 20, color: "#93C5FD" }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="white"
                    mb={0.75}
                    fontSize="0.95rem"
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}
                  >
                    {description}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
