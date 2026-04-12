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
    borderRadius: 12,
    padding: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme === "dark" ? "#000000" : "#000000", // সান-এর জন্য গোল্ডেন, মুন-এর জন্য কোরাল
  }}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLElement).style.borderColor = "var(--coral)";
    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
  }}
>
  {theme === "dark" ? (
    /* Path based Sun Icon */
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
    </svg>
  ) : (
    /* Path based Moon Icon */
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.1 22c-5.5 0-10-4.5-10-10s4.5-10 10-10c.8 0 1.5.1 2.2.3.6.2.8.8.5 1.3-.3.5-1 .7-1.5.5-.4-.1-.8-.1-1.2-.1-4.4 0-8 3.6-8 8s3.6 8 8 8c1.9 0 3.7-.7 5.1-1.9.5-.4 1.2-.3 1.6.2.4.5.3 1.2-.2 1.6-1.8 1.5-4.1 2.1-6.5 2.1z" />
    </svg>
  )}
</button>
  );
}