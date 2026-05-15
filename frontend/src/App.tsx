import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import { tenantRouter } from "@/router/tenantRouter";
import { isSuperAdminDomain } from "@/utils/tenant";

export default function App() {
  return (
    <RouterProvider router={isSuperAdminDomain() ? router : tenantRouter} />
  );
}
