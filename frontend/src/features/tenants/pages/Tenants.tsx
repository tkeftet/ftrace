import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Fab,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BusinessIcon from "@mui/icons-material/Business";

import { useTenants, useDeleteTenant } from "../hooks";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getTenantLoginUrl } from "@/utils/tenant";
import type { Tenant } from "../types";

import { StatCard } from "@/components/common/StatCard";
import { AppSnackbar } from "@/components/common/AppSnackbar";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TenantTable } from "../components/TenantTable";
import { TenantMobileCard } from "../components/TenantMobileCard";
import { TenantSearchBar } from "../components/TenantSearchBar";
import { TenantDialog } from "../components/TenantDialog";

export default function Tenants() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { snackbar, show, close } = useSnackbar();

  const { data, isLoading, isError, statsActive } = useTenants(page);
  const deleteMutation = useDeleteTenant({
    onSuccess: () => {
      show("Tenant deleted successfully.");
      setDeleteId(null);
    },
    onError: () => {
      show("Failed to delete tenant.", "error");
      setDeleteId(null);
    },
  });

  useEffect(() => {
    if (isError) show("Failed to load tenants.", "error");
  }, [isError]);
  const totalCount = data?.total ?? 0;
  const occupancyPct =
    statsActive !== null && totalCount > 0
      ? `${Math.round((statsActive / totalCount) * 100)}%`
      : "—";

  const filteredTenants = (data?.tenants ?? []).filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenEdit = (id: string) => {
    const found = (data?.tenants ?? []).find((t) => t._id === id) ?? null;
    if (found) {
      setEditTenant(found);
      setEditDialogOpen(true);
    }
  };

  const handleVisit = (slug: string) => {
    window.open(getTenantLoginUrl(slug), "_blank", "noopener,noreferrer");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={4}
      >
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            letterSpacing={1.5}
            display="block"
          >
            Management Portal
          </Typography>
          <Typography
            variant="h4"
            fontWeight={800}
            color="text.primary"
            lineHeight={1.2}
          >
            Tenants
          </Typography>
          {data && (
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Manage the {data.total} tenant{data.total !== 1 ? "s" : ""} in
              portfolio.
            </Typography>
          )}
        </Box>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              mt: 1,
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Add New Tenant
          </Button>
        )}
      </Stack>

      {/* Stats */}
      {data && (
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} mb={4}>
          <StatCard
            label="Portfolio Occupancy"
            value={occupancyPct}
            Icon={TrendingUpIcon}
          />
          <StatCard
            label="Active Tenants"
            value={statsActive !== null ? statsActive : "—"}
            Icon={CheckCircleOutlineIcon}
          />
          <StatCard
            label="Total Tenants"
            value={totalCount}
            Icon={BusinessIcon}
          />
        </Stack>
      )}

      {/* Search */}
      <TenantSearchBar value={search} onChange={setSearch} />

      {/* States */}
      {isLoading && (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      )}

      {/* Content */}
      {!isLoading &&
        !isError &&
        data &&
        (isMobile ? (
          <Stack spacing={2}>
            {filteredTenants.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No tenants found.
              </Typography>
            ) : (
              filteredTenants.map((tenant) => (
                <TenantMobileCard
                  key={tenant._id}
                  tenant={tenant}
                  onDelete={(id) => setDeleteId(id)}
                  onView={(id) => navigate(`/dashboard/tenants/${id}`)}
                  onEdit={handleOpenEdit}
                  onVisit={handleVisit}
                />
              ))
            )}
          </Stack>
        ) : (
          <TenantTable
            tenants={filteredTenants}
            page={page}
            total={totalCount}
            pages={data.pages}
            onPageChange={setPage}
            onDelete={(id) => setDeleteId(id)}
            onView={(id) => navigate(`/dashboard/tenants/${id}`)}
            onEdit={handleOpenEdit}
            onVisit={handleVisit}
          />
        ))}

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 72, right: 16 }}
          onClick={() => setOpenDialog(true)}
        >
          <AddIcon />
        </Fab>
      )}

      <TenantDialog
        mode="add"
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={() => {
          setOpenDialog(false);
          show("Tenant created successfully.");
        }}
      />

      <TenantDialog
        mode="edit"
        open={editDialogOpen}
        tenant={editTenant ?? undefined}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={() => {
          setEditDialogOpen(false);
          show("Tenant updated successfully.");
        }}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Tenant"
        message="This will permanently delete the tenant and all its data. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </Container>
  );
}
