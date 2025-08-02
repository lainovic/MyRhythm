// Theme utilities for three-way toggle (light, dark, system)

export type Theme = "light" | "dark" | "system";

// Update the dark class based on current theme setting
export function updateThemeClass() {
  const isDark =
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", isDark);
}

// Initialize theme on page load (alias for updateThemeClass)
export const initializeTheme = updateThemeClass;

// Get current theme
export function getCurrentTheme(): Theme {
  if (localStorage.theme === "light") return "light";
  if (localStorage.theme === "dark") return "dark";
  return "system";
}

// Listen for system theme changes
export function setupSystemThemeListener() {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", updateThemeClass);
}
