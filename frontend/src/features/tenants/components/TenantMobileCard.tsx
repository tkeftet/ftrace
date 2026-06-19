import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { Tenant } from "../types";
import { resolveOwner } from "../utils";
import { TenantAvatar } from "./TenantAvatar";

interface Props {
  tenant: Tenant;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onVisit: (slug: string) => void;
}

export function TenantMobileCard({
  tenant,
  onDelete,
  onView,
  onEdit,
  onVisit,
}: Props) {
  const owner = resolveOwner(tenant.owner);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ pb: "12px !important" }}>
        <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
          <TenantAvatar name={tenant.name} />
          <Box flex={1} minWidth={0}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
                lineHeight={1.2}
                noWrap
              >
                {tenant.name}
              </Typography>
              <Chip
                label={tenant.isActive ? "ACTIVE" : "INACTIVE"}
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: tenant.isActive ? "#e8f5e9" : "#f5f5f5",
                  color: tenant.isActive ? "#2e7d32" : "#757575",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  height: 20,
                  flexShrink: 0,
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" noWrap>
              {tenant.slug}
            </Typography>
            {owner && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                display="block"
              >
                {owner.name} • {owner.email}
              </Typography>
            )}
          </Box>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon fontSize="small" />}
            onClick={() => onVisit(tenant.slug)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              color: "success.main",
              borderColor: "success.light",
            }}
          >
            Visit
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon fontSize="small" />}
            onClick={() => onView(tenant._id)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              color: "primary.main",
              borderColor: "primary.light",
            }}
          >
            View
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<EditIcon fontSize="small" />}
            onClick={() => onEdit(tenant._id)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              color: "text.secondary",
              borderColor: "divider",
            }}
          >
            Edit
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<DeleteIcon fontSize="small" />}
            onClick={() => onDelete(tenant._id)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              color: "error.main",
              borderColor: "error.light",
            }}
          >
            Delete
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
