import { useState, useCallback } from "react";
import type { SnackbarSeverity } from "@/components/common/AppSnackbar";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

const INITIAL: SnackbarState = {
  open: false,
  message: "",
  severity: "success",
};

export function useSnackbar() {
  const [state, setState] = useState<SnackbarState>(INITIAL);

  const show = useCallback(
    (message: string, severity: SnackbarSeverity = "success") => {
      setState({ open: true, message, severity });
    },
    [],
  );

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return { snackbar: state, show, close };
}
