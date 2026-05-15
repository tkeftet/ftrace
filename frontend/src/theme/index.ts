import { createTheme } from "@mui/material/styles";
import palette from "./palette";
import typography from "./typography";
import components from "./components";

const theme = createTheme({
  palette,
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
  spacing: 8, // 1 unit = 8px (MUI default, explicit for clarity)
});

export default theme;