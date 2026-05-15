import { Box, Container, Link, Typography } from "@mui/material";

const FOOTER_LINKS = [
  "Privacy Policy",
  "Terms of Service",
  "Cookie Policy",
  "Security",
  "Contact Us",
];

export function LandingFooter() {
  return (
    <Box
      component="footer"
      sx={{ bgcolor: "white", borderTop: "1px solid", borderColor: "divider" }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            py: { xs: 4, md: 5 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          {/* Brand */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="#0B1437"
              mb={0.5}
            >
              FullTrace
            </Typography>
            <Typography variant="caption" color="text.secondary">
              © 2026 FullTrace. All rights reserved.
            </Typography>
          </Box>

          {/* Links */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, md: 3.5 },
            }}
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link}
                href="#"
                underline="hover"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.8rem",
                  "&:hover": { color: "#0B1437" },
                  transition: "color 0.15s",
                }}
              >
                {link}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
