import type { ThemeOptions } from "@mui/material/styles";

type TypographyOptions = ThemeOptions["typography"];

const typography: TypographyOptions = {
  fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  fontSize: 14,
  h1: {
    fontSize: "2.5rem",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.01562em",
  },
  h2: {
    fontSize: "2rem",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "-0.00833em",
  },
  h3: {
    fontSize: "1.75rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: "1.5rem",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: "1.25rem",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: "1rem",
    fontWeight: 500,
    lineHeight: 1.6,
  },
  subtitle1: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.75,
  },
  subtitle2: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.57,
  },
  body1: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.43,
  },
  button: {
    fontSize: "0.875rem",
    fontWeight: 500,
    textTransform: "none", // disables ALL CAPS globally
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.66,
  },
  overline: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 2.66,
    textTransform: "uppercase",
  },
};

export default typography;
