import { Box, Container, Typography } from "@mui/material";
import { LoginFormCard } from "../components/LoginFormCard";
import { LandingFooter } from "../../landing/components/LandingFooter";
import { LandingNavbar } from "../../landing/components/LandingNavbar";

export function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#EEF2F7",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top brand bar ── */}
      <LandingNavbar />

      {/* ── Main content ── */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 4, md: 6 },
          px: 2,
        }}
      >
        <Container maxWidth="sm" disableGutters>
          {/* Brand headline */}
          <Typography
            component="h1"
            align="center"
            sx={{
              fontWeight: 800,
              color: "#0B1437",
              fontSize: { xs: "2.4rem", sm: "3rem" },
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              mb: 2,
            }}
          >
            FullTrace
          </Typography>

          <Typography
            align="center"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.95rem", sm: "1rem" },
              lineHeight: 1.7,
              mb: 5,
              maxWidth: 380,
              mx: "auto",
            }}
          >
            Access your architectural portfolio and executive dashboard.
          </Typography>

          {/* Auth card */}
          <LoginFormCard />
        </Container>
      </Box>

      {/* ── Footer ── */}
      <LandingFooter />
    </Box>
  );
}

export default LoginPage;
