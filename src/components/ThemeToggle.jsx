import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = ({ compact = false, className = "" }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = theme === "dark" ? "light" : "dark";
    if (next === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  const baseBtn = "inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors";
  const size = compact ? "h-9 w-9" : "h-9 px-3";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`${baseBtn} ${size} ${className}`}
    >
      {theme === "dark" ? (
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          {!compact && <span className="text-sm text-[#e2d3fd]">Light</span>}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          {!compact && <span className="text-sm text-[#030014] dark:text-[#e2d3fd]">Dark</span>}
        </div>
      )}
    </button>
  );
};

export default ThemeToggle;
