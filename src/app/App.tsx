import "./App.css";
import "react-toastify/dist/ReactToastify.css";

import { styles } from "./AppStyles";
import { cn, sharedStyles } from "../shared/styles";
import Logo from "../assets/logo.png";
import { Moon, Sun, Monitor } from "lucide-react";
import useTheme from "../hooks/useTheme";
import AppMain from "./AppMain";
import { ToastContainer } from "react-toastify";

function App() {
  const { currentTheme, cycleTheme } = useTheme();

  return (
    <>
      {/* Background layer */}
      <div className={cn(styles.background.gradient)} aria-hidden="true" />

      {/* Header with proper landmark */}
      <header
        className={cn(
          sharedStyles.layout.flex.row,
          sharedStyles.layout.flex.align.between,
          styles.header.floating,
        )}
        role="banner"
      >
        {/* Logo and title section */}
        <div
          className={cn(
            sharedStyles.layout.flex.row,
            sharedStyles.layout.flex.align.center,
            "gap-2",
          )}
        >
          {/* Logo with proper alt text */}
          <div className="relative" role="img" aria-label="MyRhythm Logo">
            <img
              src={Logo}
              alt="MyRhythm Logo"
              className={sharedStyles.logo.header}
            />
            <div
              className="absolute inset-0 logo-shimmer-overlay shimmer-mask"
              aria-hidden="true"
            />
          </div>

          {/* Main title */}
          <h1 className={cn(styles.title.main, "opacity-70", "relative")}>
            <span className="font-semibold">My</span>
            <span>Rhythm</span>
            <div
              className="absolute inset-0 text-shimmer-overlay pointer-events-none"
              aria-hidden="true"
            >
              <span className="font-semibold">My</span>
              <span>Rhythm</span>
            </div>
          </h1>
        </div>

        {/* Theme toggle button */}
        <button
          onClick={cycleTheme}
          className={sharedStyles.interactive.button.themeToggle}
          title={`Current theme: ${currentTheme} (click to cycle)`}
          aria-label={`Switch to ${
            currentTheme === "light"
              ? "dark"
              : currentTheme === "dark"
                ? "system"
                : "light"
          } mode`}
        >
          {currentTheme === "light" && (
            <div className={cn(sharedStyles.layout.flex.row, "gap-1")}>
              <Sun
                color="#F59E0B"
                className={cn(sharedStyles.icon.header)}
                aria-hidden="true"
              />
            </div>
          )}
          {currentTheme === "dark" && (
            <div className={cn(sharedStyles.layout.flex.row, "gap-1")}>
              <Moon
                color="gray"
                className={sharedStyles.icon.header}
                aria-hidden="true"
              />
            </div>
          )}
          {currentTheme === "system" && (
            <div className={cn(sharedStyles.layout.flex.row, "gap-1")}>
              <Monitor
                color="gray"
                className={sharedStyles.icon.header}
                aria-hidden="true"
              />
            </div>
          )}
        </button>
      </header>

      {/* Main content area */}
      <main role="main" aria-label="Rhythm Builder">
        <AppMain />
      </main>
      <ToastContainer />
    </>
  );
}

export default App;
