
export const theme = {
  colors: {
    primary: {
      DEFAULT: "#3B82F6", // Blue
      light: "#93C5FD",
      dark: "#1D4ED8",
      hover: "#2563EB",
      foreground: "#FFFFFF",
      50: "#EFF6FF",
      100: "#DBEAFE", 
      200: "#BFDBFE",
      300: "#93C5FD",
      400: "#60A5FA",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E40AF",
      900: "#1E3A8A",
      950: "#172554"
    },
    secondary: {
      DEFAULT: "#6D28D9", // Purple
      light: "#C4B5FD",
      dark: "#4C1D95",
      hover: "#5B21B6",
      foreground: "#FFFFFF"
    },
    accent: {
      DEFAULT: "#EC4899", // Pink
      light: "#F9A8D4",
      dark: "#BE185D",
      hover: "#DB2777",
      foreground: "#FFFFFF"
    },
    success: {
      DEFAULT: "#10B981", // Green
      light: "#6EE7B7",
      dark: "#047857",
      hover: "#059669",
      foreground: "#FFFFFF"
    },
    warning: {
      DEFAULT: "#F59E0B", // Amber
      light: "#FCD34D",
      dark: "#B45309",
      hover: "#D97706",
      foreground: "#FFFFFF"
    },
    error: {
      DEFAULT: "#EF4444", // Red
      light: "#FCA5A5",
      dark: "#B91C1C",
      hover: "#DC2626",
      foreground: "#FFFFFF"
    },
    neutral: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
      950: "#0D1117"
    },
    background: {
      DEFAULT: "#FFFFFF",
      alt: "#F9FAFB",
      dark: "#111827"
    },
    surface: {
      DEFAULT: "#FFFFFF",
      hover: "#F9FAFB",
      raised: "#FFFFFF",
      sunken: "#F3F4F6"
    },
    border: {
      DEFAULT: "#E5E7EB",
      dark: "#D1D5DB"
    },
    text: {
      DEFAULT: "#1F2937",
      muted: "#6B7280",
      subtle: "#9CA3AF",
      onPrimary: "#FFFFFF"
    },
    glass: {
      DEFAULT: "rgba(255, 255, 255, 0.8)",
      dark: "rgba(31, 41, 55, 0.8)",
      blur: "8px"
    }
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },
  radius: {
    xs: "0.125rem",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px"
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)"
  },
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "350ms cubic-bezier(0.4, 0, 0.2, 1)"
  },
  zIndex: {
    overlay: 40,
    modal: 50,
    popover: 30,
    header: 20,
    drawer: 10
  }
};

export type Theme = typeof theme;
