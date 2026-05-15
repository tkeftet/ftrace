import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress } from "@mui/material";
import { Outlet } from "react-router-dom";
import { tenantApi } from "@/api/endpoints/tenant.api";
import { tenantKeys } from "@/api/queryKeys";
import { getTenantSlug } from "@/utils/tenant";
import TenantNotFound from "@/pages/TenantNotFound";

export function ValidateTenantSlug() {
  const slug = getTenantSlug();

  const { data, isLoading, isError } = useQuery({
    queryKey: tenantKeys.verify(slug ?? ""),
    queryFn: () => tenantApi.verifySlug(slug!),
    enabled: !!slug,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 min — slug rarely changes mid-session
  });

  // No slug means we're on the super-admin domain — let other routes handle it
  if (!slug) return <Outlet />;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data?.data?.exists) {
    return <TenantNotFound />;
  }

  return <Outlet />;
}
