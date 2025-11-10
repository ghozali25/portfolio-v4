import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// theme can be: 'auto' | 'dark' | 'light'
const ThemeToggle = ({ compact = false, className = "" }) => {
  const [mode, setMode] = useState("auto");
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (mq) {
      setSystemDark(mq.matches);
      const onChange = (e) => setSystemDark(e.matches);
      mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
      return () => {
        mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange);
      };
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setMode(stored);
      const root = document.documentElement;
      if (stored === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    } else {
      setMode("auto");
      const root = document.documentElement;
      if (systemDark) root.classList.add("dark");
      else root.classList.remove("dark");
      localStorage.setItem("theme", "auto");
    }
  }, []);

  const applyTheme = (next) => {
    const root = document.documentElement;
    if (next === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (next === "light") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      // auto: follow system, persist as 'auto'
      localStorage.setItem("theme", "auto");
      if (systemDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
    setMode(next);
  };

  const cycle = () => {
    if (mode === "auto") applyTheme("dark");
    else if (mode === "dark") applyTheme("light");
    else applyTheme("auto");
  };

  // Keep applying when in auto and system preference changes
  useEffect(() => {
    if (mode !== "auto") return;
    const root = document.documentElement;
    if (systemDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [mode, systemDark]);

  const baseBtn = "inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors";
  const size = compact ? "h-9 w-9" : "h-9 px-3";

  const renderContent = () => {
    if (mode === "dark") {
      return (
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          {!compact && <span className="text-sm text-[#e2d3fd]">Dark</span>}
        </div>
      );
    }
    if (mode === "light") {
      return (
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          {!compact && <span className="text-sm text-[#030014] dark:text-[#e2d3fd]">Light</span>}
        </div>
      );
    }
    // auto
    return (
      <div className="flex items-center gap-2">
        {systemDark ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
        {!compact && <span className="text-sm text-[#e2d3fd]">Auto</span>}
      </div>
    );
  };

  return (
    <button
      onClick={cycle}
      aria-label="Toggle theme"
      className={`${baseBtn} ${size} ${className}`}
    >
      {renderContent()}
    </button>
  );
};

export default ThemeToggle;
