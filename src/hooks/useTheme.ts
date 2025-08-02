import React from "react";

type Theme = "light" | "dark" | "system";

const useTheme = () => {
  const [currentTheme, setCurrentTheme] = React.useState<Theme>("system");
  const themes = React.useRef<Theme[]>(["light", "dark", "system"]);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme || "system";

    setCurrentTheme(initialTheme);
    applyTheme(initialTheme === "system" ? systemTheme : initialTheme);
  }, []);

  const applyTheme = (theme: Theme) => {
    const isDark =
      theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", isDark);
  };

  const cycleTheme = () => {
    const currentIndex = themes.current.indexOf(currentTheme);
    const nextTheme =
      themes.current[(currentIndex + 1) % themes.current.length];

    setCurrentTheme(nextTheme);

    if (nextTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      applyTheme(systemTheme);
    } else {
      applyTheme(nextTheme);
    }

    localStorage.setItem("theme", nextTheme);
  };

  return {
    currentTheme,
    cycleTheme,
  };
};

export default useTheme;
