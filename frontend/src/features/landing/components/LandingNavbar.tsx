import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CutleryIcon from "@mui/icons-material/RestaurantMenu";


import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/router/routes";

const NAV_LINKS = ["Solutions", "Features", "Pricing"];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isLoginPage = pathname === ROUTES.LOGIN;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 64 }}>
          {/* Logo — always navigates home */}
          <Typography
            variant="h6"
            onClick={() => navigate(ROUTES.HOME)}
            sx={{
              fontWeight: 700,
              color: "#0B1437",
              letterSpacing: "-0.01em",
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 6 },
              cursor: "pointer",
              userSelect: "none",
              "&:hover": { opacity: 0.75 },
              transition: "opacity 0.15s",
            }}
          >
            <Box component="span" sx={{ display: "inline-flex", mr: 0.5 }}>
            <CutleryIcon sx={{ color: "#0B1437", fontSize: 22, mr: 0.5 }} />

            Full Trace
            </Box>
          </Typography>

          {/* Desktop nav links — only on landing */}
          {!isMobile && !isLoginPage && (
            <Box sx={{ display: "flex", gap: 0.5, flexGrow: 1 }}>
              {NAV_LINKS.map((link) => (
                <Button
                  key={link}
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    "&:hover": { color: "#0B1437" },
                  }}
                >
                  {link}
                </Button>
              ))}
            </Box>
          )}

          {/* Spacer when on login page so CTAs are right-aligned */}
          {!isMobile && isLoginPage && <Box sx={{ flexGrow: 1 }} />}

          {/* Desktop CTAs */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              {isLoginPage ? (
                <Button
                  startIcon={
                    <ArrowBackIcon sx={{ fontSize: "16px !important" }} />
                  }
                  onClick={() => navigate(ROUTES.HOME)}
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    "&:hover": { color: "#0B1437" },
                  }}
                >
                  Back to Home
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => navigate(ROUTES.LOGIN)}
                    sx={{
                      color: "text.secondary",
                      fontWeight: 500,
                      "&:hover": { color: "#0B1437" },
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate(ROUTES.LOGIN)}
                    sx={{
                      bgcolor: "#0B1437",
                      "&:hover": { bgcolor: "#152054" },
                      borderRadius: 2,
                      px: 3,
                      fontWeight: 600,
                      boxShadow: "none",
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ color: "#0B1437" }}
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight={700} color="#0B1437">
            Full Trace
          </Typography>
          <IconButton
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <List>
          {!isLoginPage &&
            NAV_LINKS.map((link) => (
              <ListItem key={link} disablePadding>
                <ListItemButton onClick={() => setMobileOpen(false)}>
                  <ListItemText
                    primary={link}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
        </List>

        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 2,
          }}
        >
          {isLoginPage ? (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ArrowBackIcon />}
              sx={{ fontWeight: 600 }}
              onClick={() => {
                setMobileOpen(false);
                navigate(ROUTES.HOME);
              }}
            >
              Back to Home
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                fullWidth
                sx={{ fontWeight: 600 }}
                onClick={() => {
                  setMobileOpen(false);
                  navigate(ROUTES.LOGIN);
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "#0B1437",
                  "&:hover": { bgcolor: "#152054" },
                  fontWeight: 600,
                  boxShadow: "none",
                }}
                onClick={() => {
                  setMobileOpen(false);
                  navigate(ROUTES.LOGIN);
                }}
              >
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}
