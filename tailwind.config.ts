import type { Config } from "tailwindcss";
import { designTokens } from "./lib/design-system";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: designTokens.colors.foreground,
        calm: designTokens.colors.calm,
        blush: designTokens.colors.blush,
        paper: designTokens.colors.paper,
        surface: designTokens.colors.surface,
        "surface-muted": designTokens.colors.surfaceMuted,
        line: designTokens.colors.border
      },
      boxShadow: {
        soft: designTokens.shadows.soft,
        raised: designTokens.shadows.raised
      },
      borderRadius: {
        gwp: designTokens.radius.lg,
        "gwp-lg": designTokens.radius.xl
      }
    }
  },
  plugins: []
};

export default config;
