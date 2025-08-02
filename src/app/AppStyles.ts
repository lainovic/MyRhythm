export const styles = {
  page: {
    fullScreen: "h-screen w-screen",
    centered: "flex items-center justify-center",
    container: "h-screen w-screen theme-bg flex items-center justify-center",
    fullCover: "absolute inset-0",
  },

  // Text styles
  text: {
    heading: "text-center text-4xl font-bold theme-text",
    title: "text-center text-6xl font-extrabold theme-text",
    body: "text-center text-lg theme-text",
  },

  // Background options
  background: {
    gradient: "background",
    solid: "theme-bg",
    dark: "bg-gray-900",
    overlay:
      "fixed w-screen h-[200vh] overflow-hidden -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 opacity-20 pointer-events-none background",
  },

  header: {
    floating: "relative p-6",
    centered: "flex justify-center items-center p-8",
    glass: "flex justify-center items-center p-8",
  },

  title: {
    main: "text-2xl md:text-3xl text-gray-900 dark:text-gray-100",
    glass:
      "text-white backdrop-blur-sm bg-white/10 rounded-2xl px-8 py-4 shadow-2xl",
    gradient:
      "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent",
  },
} as const;
