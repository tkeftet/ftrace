import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import theme from "@/theme";

import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      // Don't re-fetch every time the user alt-tabs back to the app — most
      // dashboard data is fresh enough at 30s staleTime.
      refetchOnWindowFocus: false,
      // Keep previous data visible while a query refetches on key change
      // (pagination, filters). Eliminates flicker between pages.
      placeholderData: keepPreviousData,
    },
    mutations: {
      throwOnError: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
