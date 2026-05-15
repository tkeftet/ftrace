import { Box, Button, Container, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { getTenantSlug } from "@/utils/tenant";

const LANDING_URL =
  import.meta.env.VITE_LANDING_URL ||
  ("http://localhost:5173" as string | undefined);

function getLandingHref(): string {
  if (LANDING_URL) return LANDING_URL;

  const { protocol, hostname } = window.location;
  const base = import.meta.env.VITE_BASE_DOMAIN as string | undefined;

  if (base) return `${protocol}//${base}`;

  // localhost: strip the subdomain (e.g. foo.localhost → localhost)
  const parts = hostname.split(".");
  if (parts.length > 1) {
    const root = parts.slice(1).join(".");
    return `${protocol}//${root}`;
  }
  return "/";
}

export function TenantNotFound() {
  const slug = getTenantSlug();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#EEF2F7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center" }}>
          <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />

          <Typography
            variant="h4"
            fontWeight={800}
            color="#0B1437"
            gutterBottom
          >
            Tenant not found
          </Typography>

          {slug && (
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 1 }}>
              <strong>"{slug}"</strong> doesn't match any active workspace.
            </Typography>
          )}

          <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
            Double-check the URL or contact the workspace owner. If you think
            this is a mistake, reach out to support.
          </Typography>

          <Button
            variant="contained"
            size="large"
            href={getLandingHref()}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            Go to homepage
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default TenantNotFound;
