import { Box, Container, Grid, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface Tenant {
  label: string;
  img: string;
}

const TENANTS: Tenant[] = [
  {
    label: "Tenant A: Fine Dining",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
  },
  {
    label: "Tenant B: Artisan Cafe",
    img: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80",
  },
  {
    label: "Tenant C: Urban Bistro",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
  },
];

const BULLETS = [
  "Isolated data layers for each tenant dashboard.",
  "Custom branding and localized menu control.",
  "Aggregate reporting for enterprise-level insights.",
];

export function MultiTenantSection() {
  return (
    <Box sx={{ bgcolor: "white", py: { xs: 8, md: 14 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
          {/* ── Left: copy ── */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              component="h2"
              sx={{
                fontWeight: 800,
                color: "#0B1437",
                lineHeight: 1.15,
                mb: 2.5,
                fontSize: { xs: "1.9rem", md: "2.5rem" },
                letterSpacing: "-0.01em",
              }}
            >
              Multi-Tenant Power.
              <br />
              Individual Sovereignty.
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.75, mb: 4 }}
            >
              Scale your restaurant group or franchise effortlessly. Each
              location enjoys a tailored, independent environment while
              maintaining global administrative oversight.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {BULLETS.map((bullet) => (
                <Box
                  key={bullet}
                  sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
                >
                  <CheckCircleIcon
                    sx={{
                      color: "#2563EB",
                      mt: 0.1,
                      flexShrink: 0,
                      fontSize: 20,
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    lineHeight={1.7}
                  >
                    {bullet}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* ── Right: 2×2 image grid ── */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={2}>
              {TENANTS.map((tenant) => (
                <Grid size={6} key={tenant.label}>
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: 2.5,
                      overflow: "hidden",
                      lineHeight: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={tenant.img}
                      alt={tenant.label}
                      sx={{
                        width: "100%",
                        height: { xs: 140, sm: 170, md: 190 },
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {/* Label overlay */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.55))",
                        p: 1.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "white", fontWeight: 700 }}
                      >
                        {tenant.label}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}

              {/* Uptime stat tile */}
              <Grid size={6}>
                <Box
                  sx={{
                    height: { xs: 140, sm: 170, md: 190 },
                    bgcolor: "#F8FAFC",
                    borderRadius: 2.5,
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "2rem", md: "2.6rem" },
                      color: "#0B1437",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    99.9%
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      letterSpacing: "0.1em",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                    }}
                  >
                    UPTIME GUARANTEED
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
