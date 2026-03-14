"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";
interface ThemeCtx { theme: Theme; toggle: () => void; }
const Ctx = createContext<ThemeCtx>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("kvad_theme") as Theme | null;
    if (saved) apply(saved);
  }, []);

  const apply = (t: Theme) => {
    const r = document.documentElement;
    if (t === "light") {
      r.style.setProperty("--bg",        "#f4f4f8");
      r.style.setProperty("--card",      "#ffffff");
      r.style.setProperty("--raised",    "#ededf5");
      r.style.setProperty("--border",    "#dcdce8");
      r.style.setProperty("--border-lt", "#c8c8dc");
      r.style.setProperty("--champagne", "#1a1a2e");
      r.style.setProperty("--cream",     "#2a2a44");
      r.style.setProperty("--muted",     "#888899");
      r.style.setProperty("--dim",       "#bbbbcc");
      r.style.setProperty("--coral",     "#FF6B4A");
      r.style.setProperty("--coral-g",   "rgba(255,107,74,.10)");
      r.style.setProperty("--ok",        "#16a06a");
      r.style.setProperty("--gold",      "#d4a020");
      r.style.setProperty("--danger",    "#cc1133");
      document.body.style.background = "#f4f4f8";
      document.body.style.color = "#1a1a2e";
    } else {
      r.style.setProperty("--bg",        "#080810");
      r.style.setProperty("--card",      "#0E0E18");
      r.style.setProperty("--raised",    "#141422");
      r.style.setProperty("--border",    "#1E1E30");
      r.style.setProperty("--border-lt", "#2A2A42");
      r.style.setProperty("--champagne", "#F2E8D9");
      r.style.setProperty("--cream",     "#C8BCA8");
      r.style.setProperty("--muted",     "#6E6E88");
      r.style.setProperty("--dim",       "#363650");
      r.style.setProperty("--coral",     "#FF6B4A");
      r.style.setProperty("--coral-g",   "rgba(255,107,74,.12)");
      r.style.setProperty("--ok",        "#3DEBA0");
      r.style.setProperty("--gold",      "#F5C842");
      r.style.setProperty("--danger",    "#FF4466");
      document.body.style.background = "#080810";
      document.body.style.color = "#F2E8D9";
    }
    setTheme(t);
    localStorage.setItem("kvad_theme", t);
  };

  const toggle = () => apply(theme === "dark" ? "light" : "dark");

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme() { return useContext(Ctx); }