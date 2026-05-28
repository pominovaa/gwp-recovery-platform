export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const designSystem = {
  tokens: {
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
  },
  components: {
    button: {
      base:
        "inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calm",
      sizes: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-7 text-base"
      },
      variants: {
        default: "bg-stone-950 text-white hover:bg-stone-800",
        inverse: "bg-white text-stone-950 hover:bg-stone-100",
        outline: "border border-stone-300 bg-white text-stone-950 hover:bg-stone-50",
        ghost: "bg-transparent text-stone-950 hover:bg-stone-100",
        danger: "bg-rose-700 text-white hover:bg-rose-800"
      }
    },
    card: {
      base: "",
      info: "rounded-lg border border-stone-200 bg-white shadow-sm",
      pricing: "rounded-lg border shadow-sm",
      surface: "rounded-gwp-lg border border-stone-200 bg-white text-stone-950 shadow-sm"
    },
    dialog: {
      overlay: "fixed inset-0 z-[60] overflow-y-auto bg-white",
      closeButton: "fixed right-4 top-4 z-[61] h-10 w-10 p-0",
      content: "mx-auto max-w-7xl px-5 py-6 md:py-10",
      header: "mb-8 flex items-center justify-between gap-4"
    },
    drawer: {
      root: "fixed inset-0 z-[60]",
      backdrop: "absolute inset-0 bg-stone-950/35",
      panel: "absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-raised",
      closeButton: "mb-6 h-10 w-10 p-0",
      header: "mb-6 space-y-2"
    },
    feedback: {
      empty: "rounded-gwp border border-dashed border-stone-300 bg-white p-6 text-center",
      loading: "flex items-center gap-3 rounded-gwp border border-stone-200 bg-white p-4 text-sm text-stone-700",
      error: "rounded-gwp border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800",
      title: "text-lg font-semibold text-stone-950",
      body: "mt-2 text-sm leading-6 text-stone-600"
    },
    form: {
      field: "space-y-2",
      label: "block text-sm font-semibold text-stone-800",
      helpText: "text-sm leading-6 text-stone-500",
      errorText: "text-sm font-medium text-rose-700",
      input:
        "h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-stone-500"
    },
    header: {
      page: "mx-auto max-w-4xl px-5 py-14 text-center md:py-20",
      section: "mx-auto mb-10 max-w-3xl text-center",
      eyebrow: {
        base: "mb-3 text-sm font-semibold uppercase tracking-[0.2em]",
        light: "text-stone-500",
        dark: "text-stone-300"
      },
      pageTitle: {
        base: "text-4xl font-semibold tracking-tight md:text-6xl",
        light: "text-stone-950",
        dark: "text-white"
      },
      sectionTitle: {
        base: "text-3xl font-semibold tracking-tight md:text-5xl",
        light: "text-stone-950",
        dark: "text-white"
      },
      body: {
        base: "mt-5 text-lg leading-8",
        light: "text-stone-600",
        dark: "text-stone-300"
      }
    },
    tooltipIconButton: {
      wrapper: "group relative inline-flex",
      button:
        "flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calm",
      tooltip:
        "pointer-events-none absolute right-0 top-full z-10 mt-2 w-48 rounded-2xl bg-stone-950 px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
    }
  }
} as const;

export const designTokens = designSystem.tokens;
export type DesignSystem = typeof designSystem;
export type DesignTokens = typeof designTokens;
export type ButtonSize = keyof typeof designSystem.components.button.sizes;
export type ButtonVariant = keyof typeof designSystem.components.button.variants;
export type HeaderTone = "light" | "dark";
