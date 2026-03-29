"use client";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "লাইট মোড" : "ডার্ক মোড"}
      style={{
        background: "none",
        border: `1px solid var(--border)`,
        borderRadius: 10, padding: "8px 12px",
        cursor: "pointer", fontSize: 18,
        transition: "all .18s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--coral)";
        (e.currentTarget as HTMLElement).style.background = "var(--coral-g)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.background = "none";
      }}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}