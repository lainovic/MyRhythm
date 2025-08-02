// Utility function for combining classes
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Generic shared styles
export const sharedStyles = {
  // Layout utilities
  layout: {
    fullScreen: "h-screen w-screen",
    fullCover: "absolute inset-0",
    flex: {
      row: "flex flex-row",
      col: "flex flex-col",
      align: {
        center: "items-center justify-center",
        between: "items-center justify-between",
        around: "items-center justify-around",
      },
    },
    grid: {
      center: "grid place-items-center",
      cols: (cols: number) => `grid-cols-${cols}`,
    },
  },

  // Spacing
  spacing: {
    container: "p-4 md:p-6 lg:p-8",
    section: "py-8 md:py-12 lg:py-16",
    card: "p-4 md:p-6",
    button: "px-4 py-2",
    input: "px-3 py-2",
  },

  // Typography
  text: {
    h1: "text-4xl md:text-6xl font-bold",
    h2: "text-3xl md:text-5xl font-semibold",
    h3: "text-2xl md:text-4xl font-semibold",
    h4: "text-xl md:text-2xl font-medium",
    body: "text-base md:text-lg",
    small: "text-sm",
    caption: "text-xs",
    gradient: {
      purple:
        "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent",
      blue: "bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent",
      green:
        "bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent",
      dark: "bg-gradient-to-r from-slate-600 to-gray-800 bg-clip-text text-transparent",
      darkPurple:
        "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent",
    },
  },

  // Colors
  colors: {
    primary: "text-blue-600 bg-blue-600",
    secondary: "text-gray-600 bg-gray-600",
    success: "text-green-600 bg-green-600",
    warning: "text-yellow-600 bg-yellow-600",
    error: "text-red-600 bg-red-600",
    neutral: "text-gray-600 bg-gray-600",
  },

  // Interactive elements
  interactive: {
    button: {
      primary:
        "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors",
      secondary:
        "px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors",
      outline:
        "px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors",
      ghost:
        "px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors",
      themeToggle:
        "p-2 text-gray-700 hover:bg-gray-200/20 rounded-full transition-colors",
    },
    input: {
      base: "px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
      error:
        "px-3 py-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500",
    },
  },

  // Effects
  effects: {
    shadow: {
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl",
    },
    rounded: {
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    },
    backdrop: {
      blur: "backdrop-blur-sm",
      glass: "backdrop-blur-sm bg-white/10",
    },
  },

  // Background gradients
  gradients: {
    light: "bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600",
    dark: "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800",
    darkAlt: "bg-gradient-to-br from-gray-900 via-purple-800 to-gray-800",
  },

  // Positioning
  position: {
    overlay: "relative isolate",
    floating: "relative isolate",
    fixed: "fixed isolate",
    absolute: "absolute isolate",
  },

  // Responsive
  responsive: {
    hidden: {
      mobile: "hidden md:block",
      desktop: "block md:hidden",
    },
    text: {
      mobile: "text-sm md:text-base lg:text-lg",
      desktop: "text-lg md:text-xl lg:text-2xl",
    },
  },

  // Logo sizes
  logo: {
    sm: "h-8 w-auto",
    md: "h-12 w-auto",
    lg: "h-16 w-auto",
    xl: "h-20 w-auto",
    header: "h-16 w-auto",
  },

  // Icon sizes
  icon: {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
    header: "w-5 h-5",
  },
} as const;

// Type-safe style helpers
export type SharedStyles = typeof sharedStyles;
export type StyleKey<T extends keyof SharedStyles> = keyof SharedStyles[T];
