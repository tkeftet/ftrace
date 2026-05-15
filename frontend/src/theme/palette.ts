import type { PaletteOptions } from "@mui/material/styles";

const palette: PaletteOptions = {
  mode: "light",
  primary: {
    light: "#d97706",   // amber-600
    main: "#b45309",    // amber-700
    dark: "#92400e",    // amber-800
    contrastText: "#ffffff",
  },
  secondary: {
    light: "#a16207",   // yellow-700
    main: "#78350f",    // brown-900
    dark: "#451a03",    // brown-950
    contrastText: "#ffffff",
  },
  error: {
    main: "#d32f2f",
  },
  warning: {
    main: "#ed6c02",
  },
  info: {
    main: "#0288d1",
  },
  success: {
    main: "#2e7d32",
  },
  background: {
    default: "#fffbf5",
    paper: "#ffffff",
  },
  text: {
    primary: "#1c1917",
    secondary: "#78716c",
    disabled: "#d6d3d1",
  },
};

export default palette;
