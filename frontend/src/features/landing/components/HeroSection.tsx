import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import BarChartIcon from "@mui/icons-material/BarChart";

export function HeroSection() {
  return (
    <Box
      sx={{
        bgcolor: "white",
        pt: { xs: 8, md: 12 },
        pb: { xs: 10, md: 14 },
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
          {/* ── Left column ── */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Status badge */}
            <Chip
              icon={
                <FiberManualRecordIcon
                  sx={{
                    fontSize: "10px !important",
                    color: "#16a34a !important",
                  }}
                />
              }
              label="SYSTEM STATUS: OPTIMAL"
              size="small"
              sx={{
                mb: 3,
                bgcolor: "#f0fdf4",
                color: "#16a34a",
                fontWeight: 700,
                fontSize: "0.68rem",
                letterSpacing: "0.06em",
                border: "1px solid #bbf7d0",
                height: 28,
              }}
            />

            {/* Headline */}
            <Typography
              component="h1"
              sx={{
                fontWeight: 800,
                color: "#0B1437",
                lineHeight: 1.08,
                fontSize: { xs: "2.6rem", sm: "3rem", md: "3.6rem" },
                letterSpacing: "-0.02em",
              }}
            >
              The Architecture
              <br />
              of{" "}
              <Box component="span" sx={{ color: "#2563EB" }}>
                Modern Dining.
              </Box>
            </Typography>

            {/* Sub-text */}
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                mt: 3,
                mb: 4,
                maxWidth: 450,
                lineHeight: 1.75,
                fontSize: "1rem",
              }}
            >
              FullTrace orchestrates the complexities of restaurant management
              through a unified, high-performance interface designed for the
              digital architect.
            </Typography>

            {/* CTAs */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#0B1437",
                  "&:hover": { bgcolor: "#152054" },
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  borderRadius: 2,
                  boxShadow: "none",
                  fontSize: "0.95rem",
                }}
              >
                Get Started
              </Button>
              <Button
                variant="text"
                size="large"
                sx={{
                  color: "#0B1437",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  "&:hover": { bgcolor: "transparent", opacity: 0.7 },
                }}
              >
                Request a Demo
              </Button>
            </Box>
          </Grid>

          {/* ── Right column: image + floating card ── */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ position: "relative" }}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80"
              alt="Modern restaurant interior"
              sx={{
                width: "100%",
                height: { xs: 280, sm: 360, md: 440 },
                objectFit: "cover",
                borderRadius: 3,
                display: "block",
              }}
            />

            {/* Floating analytics card */}
            <Paper
              elevation={6}
              sx={{
                position: "absolute",
                bottom: { xs: -28, md: -32 },
                left: { xs: 16, md: 24 },
                p: 2,
                borderRadius: 2.5,
                minWidth: 190,
                bgcolor: "white",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
              >
                <Box
                  sx={{
                    bgcolor: "#EFF6FF",
                    borderRadius: 1,
                    p: 0.5,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <BarChartIcon sx={{ color: "#2563EB", fontSize: 18 }} />
                </Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="#0B1437"
                  letterSpacing="0.02em"
                >
                  Real-time Pulse
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 6,
                  bgcolor: "#E2E8F0",
                  borderRadius: 3,
                  mb: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: "72%",
                    height: "100%",
                    bgcolor: "#2563EB",
                    borderRadius: 3,
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                Active Orders: 142/h
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
