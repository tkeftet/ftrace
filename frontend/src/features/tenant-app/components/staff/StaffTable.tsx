import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import {
  STAFF_ROLE_LABELS,
  ROLE_COLORS,
  type StaffMember,
} from "@/types/staff.types";

interface StaffTableProps {
  staff: StaffMember[];
  togglePending: boolean;
  onEdit: (member: StaffMember) => void;
  onToggle: (member: StaffMember) => void;
}

/* ── Mobile card ─────────────────────────────────────────────────────────── */
function StaffCard({
  member,
  togglePending,
  onEdit,
  onToggle,
}: {
  member: StaffMember;
  togglePending: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <Box sx={{ px: 2, py: 1.75, display: "flex", alignItems: "center", gap: 1.5 }}>
      {/* Avatar */}
      <Avatar
        sx={{
          width: 42,
          height: 42,
          bgcolor: "primary.main",
          fontWeight: 800,
          fontSize: "1rem",
          flexShrink: 0,
        }}
      >
        {member.name[0].toUpperCase()}
      </Avatar>

      {/* Name + email + chips */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={700} fontSize={14} noWrap>
          {member.name}
        </Typography>
        <Typography fontSize={12} color="text.secondary" noWrap sx={{ mb: 0.75 }}>
          {member.email}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          <Chip
            size="small"
            label={STAFF_ROLE_LABELS[member.role]}
            color={ROLE_COLORS[member.role]}
            sx={{ fontWeight: 700, fontSize: 11, height: 22 }}
          />
          <Chip
            size="small"
            label={member.isActive ? "Active" : "Inactive"}
            color={member.isActive ? "success" : "default"}
            variant={member.isActive ? "filled" : "outlined"}
            sx={{ fontWeight: 700, fontSize: 11, height: 22 }}
          />
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flexShrink: 0 }}>
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#fef3c7",
              color: "#b45309",
              "&:hover": { bgcolor: "#fde68a" },
            }}
          >
            <EditIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={member.isActive ? "Deactivate" : "Reactivate"}>
          <IconButton
            size="small"
            onClick={onToggle}
            disabled={togglePending}
            sx={{
              width: 32,
              height: 32,
              bgcolor: member.isActive ? "#fee2e2" : "#dcfce7",
              color: member.isActive ? "#dc2626" : "#16a34a",
              "&:hover": { bgcolor: member.isActive ? "#fecaca" : "#bbf7d0" },
            }}
          >
            {member.isActive
              ? <BlockIcon sx={{ fontSize: 15 }} />
              : <CheckCircleIcon sx={{ fontSize: 15 }} />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function StaffTable({ staff, togglePending, onEdit, onToggle }: StaffTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (staff.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          gap: 1.5,
        }}
      >
        <PeopleAltIcon sx={{ fontSize: 52, color: "#d6d3d1" }} />
        <Typography fontWeight={700} color="text.secondary">
          No staff members yet
        </Typography>
        <Typography fontSize={13} color="text.disabled">
          Add your first team member to get started.
        </Typography>
      </Box>
    );
  }

  /* ── Mobile: card list ── */
  if (isMobile) {
    return (
      <Paper
        elevation={0}
        sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}
      >
        {staff.map((member, idx) => (
          <Box key={member._id}>
            <StaffCard
              member={member}
              togglePending={togglePending}
              onEdit={() => onEdit(member)}
              onToggle={() => onToggle(member)}
            />
            {idx < staff.length - 1 && <Divider />}
          </Box>
        ))}
      </Paper>
    );
  }

  /* ── Desktop: table ── */
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "grey.50" } }}>
            <TableCell>Member</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member._id} hover>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar
                    sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: "0.85rem" }}
                  >
                    {member.name[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{member.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{member.email}</Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={STAFF_ROLE_LABELS[member.role]}
                  color={ROLE_COLORS[member.role]}
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={member.isActive ? "Active" : "Inactive"}
                  color={member.isActive ? "success" : "default"}
                  variant={member.isActive ? "filled" : "outlined"}
                />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => onEdit(member)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={member.isActive ? "Deactivate" : "Reactivate"}>
                  <IconButton
                    size="small"
                    color={member.isActive ? "error" : "success"}
                    onClick={() => onToggle(member)}
                    disabled={togglePending}
                  >
                    {member.isActive
                      ? <BlockIcon fontSize="small" />
                      : <CheckCircleIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
