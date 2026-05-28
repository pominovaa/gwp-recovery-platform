export const designTokens = {
  colors: {
    background: "#f7faf8",
    foreground: "#15201f",
    primary: "#15201f",
    primaryForeground: "#ffffff",
    calm: "#117863",
    blush: "#c44853",
    paper: "#f7faf8",
    surface: "#ffffff",
    surfaceMuted: "#f3f7f4",
    border: "#dfe7e2",
    mutedText: "#586662",
    danger: "#b42318",
    dangerSurface: "#fff1f0",
    success: "#117863",
    successSurface: "#ecfdf5"
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    headingTracking: "-0.02em",
    bodyLineHeight: "1.65"
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    section: "5rem"
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px"
  },
  shadows: {
    soft: "0 18px 54px rgba(15, 23, 42, 0.10)",
    raised: "0 24px 80px rgba(15, 23, 42, 0.16)"
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px"
  }
} as const;

export type DesignTokens = typeof designTokens;
