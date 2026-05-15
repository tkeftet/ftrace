import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import TableBarIcon from "@mui/icons-material/TableBar";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import type { SvgIconProps } from "@mui/material";
import type { ComponentType } from "react";

interface Feature {
  Icon: ComponentType<SvgIconProps>;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    Icon: RestaurantMenuIcon,
    title: "Dynamic Menus",
    description:
      "Update offerings globally in real-time. Automated inventory syncing ensures your guests only see what's ready to serve.",
  },
  {
    Icon: TableBarIcon,
    title: "Table Intelligence",
    description:
      "Sophisticated floor plan mapping with heatmaps and occupancy analytics to optimize turnover rates.",
  },
  {
    Icon: AccountTreeIcon,
    title: "Order Orchestration",
    description:
      "Intelligent routing of orders across multiple kitchens and prep stations for maximum efficiency.",
  },
];

export function FeaturesSection() {
  return (
    <Box sx={{ bgcolor: "#F8FAFC", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        {/* Section header */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: "#0B1437",
            mb: 1.5,
            fontSize: { xs: "1.9rem", md: "2.4rem" },
          }}
        >
          Unified Operations
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 7, maxWidth: 460, lineHeight: 1.75 }}
        >
          One command center for your entire ecosystem. Eliminate friction
          between front-of-house, kitchen, and administrative layers.
        </Typography>

        {/* Feature cards */}
        <Grid container spacing={3}>
          {FEATURES.map(({ Icon, title, description }) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={title}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 3,
                  height: "100%",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3.5 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "#EFF6FF",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2.5,
                    }}
                  >
                    <Icon sx={{ fontSize: 26, color: "#2563EB" }} />
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="#0B1437"
                    mb={1}
                    fontSize="1.05rem"
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    lineHeight={1.75}
                  >
                    {description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
