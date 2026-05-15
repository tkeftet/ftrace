import { Box, Paper, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

interface StatCardProps {
  label: string;
  value: string | number;
  Icon: SvgIconComponent;
}

export function StatCard({ label, value, Icon }: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        flex: 1,
        minWidth: 0,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Top row: icon + label */}
      <Box display="flex" alignItems="center" gap={1} mb={0.75}>
        <Box
          sx={{
            width: { xs: 28, sm: 36 },
            height: { xs: 28, sm: 36 },
            border: "2px solid",
            borderColor: "primary.main",
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: { xs: 16, sm: 20 } }} />
        </Box>
        <Typography
          color="text.secondary"
          textTransform="uppercase"
          fontWeight={600}
          sx={{
            fontSize: { xs: "0.6rem", sm: "0.7rem" },
            letterSpacing: 0.8,
            lineHeight: 1.3,
          }}
        >
          {label}
        </Typography>
      </Box>
      {/* Value */}
      <Typography
        fontWeight={700}
        color="text.primary"
        sx={{ fontSize: { xs: "1.25rem", sm: "1.75rem" }, lineHeight: 1.1 }}
      >
        {value}
      </Typography>
    </Paper>
  );
}
