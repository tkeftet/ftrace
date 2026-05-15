import { Box, Typography } from "@mui/material";

interface Props {
  isActive: boolean;
}

export function TenantStatusBadge({ isActive }: Props) {
  return (
    <Box display="flex" alignItems="center" gap={0.75}>
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: isActive ? "success.main" : "text.disabled",
        }}
      />
      <Typography
        variant="body2"
        color={isActive ? "success.main" : "text.disabled"}
        fontWeight={500}
      >
        {isActive ? "Active" : "Inactive"}
      </Typography>
    </Box>
  );
}
