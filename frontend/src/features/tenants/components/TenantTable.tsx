import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import type { Tenant } from "../types";
import { resolveOwner } from "../utils";
import { TenantAvatar } from "./TenantAvatar";
import { TenantPlanChip } from "./TenantPlanChip";
import { TenantStatusBadge } from "./TenantStatusBadge";

const COLUMNS = [
  "Tenant Name",
  "Plan",
  "Owner",
  "Created",
  "Status",
  "Actions",
];

interface Props {
  tenants: Tenant[];
  page: number;
  total: number;
  pages: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function TenantTable({
  tenants,
  page,
  total,
  pages,
  onPageChange,
  onDelete,
  onView,
  onEdit,
}: Props) {
  const startIndex = page * 10 + 1;
  const endIndex = Math.min(page * 10 + tenants.length, total);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "background.default" }}>
              {COLUMNS.map((h) => (
                <TableCell
                  key={h}
                  align={h === "Actions" ? "right" : "left"}
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    py: 1.5,
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" py={4}>
                    No tenants found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => {
                const owner = resolveOwner(tenant.owner);
                return (
                  <TableRow
                    key={tenant._id}
                    hover
                    sx={{ "&:last-child td": { border: 0 } }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <TenantAvatar name={tenant.name} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {tenant.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tenant.slug}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <TenantPlanChip plan={tenant.plan} />
                    </TableCell>

                    <TableCell>
                      {owner ? (
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {owner.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {owner.email}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <TenantStatusBadge isActive={tenant.isActive} />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        size="small"
                        title="View details"
                        sx={{ color: "primary.main", mr: 0.5 }}
                        onClick={() => onView(tenant._id)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: "text.secondary", mr: 0.5 }}
                        title="Edit tenant"
                        onClick={() => onEdit(tenant._id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(tenant._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {startIndex}–{endIndex} of {total} tenants in portfolio
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<NavigateBeforeIcon />}
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="small"
            endIcon={<NavigateNextIcon />}
            disabled={page >= pages - 1}
            onClick={() => onPageChange(page + 1)}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Next
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
