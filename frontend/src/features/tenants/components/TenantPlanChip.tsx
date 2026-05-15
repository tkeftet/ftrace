import { Chip } from "@mui/material";
import type { Tenant } from "../types";

const PLAN_COLORS: Record<string, { bg: string; color: string }> = {
  free: { bg: "#f0f0f0", color: "#555555" },
  starter: { bg: "#e3f2fd", color: "#1565c0" },
  pro: { bg: "#e8f5e9", color: "#2e7d32" },
  enterprise: { bg: "#fce4ec", color: "#c62828" },
};

interface Props {
  plan: Tenant["plan"];
}

export function TenantPlanChip({ plan }: Props) {
  const colors = PLAN_COLORS[plan] ?? { bg: "#f0f0f0", color: "#555" };
  return (
    <Chip
      label={plan.toUpperCase()}
      size="small"
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        fontWeight: 700,
        fontSize: "0.65rem",
        height: 22,
        borderRadius: 1,
      }}
    />
  );
}
