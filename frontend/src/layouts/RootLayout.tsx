import { Outlet, ScrollRestoration } from "react-router-dom";

export function RootLayout() {
  return (
    <>
      {/* Global providers (Theme, Toast, QueryClient, etc.) go here */}
      <ScrollRestoration />
      <Outlet />
    </>
  );
}
