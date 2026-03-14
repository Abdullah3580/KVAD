"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { uid } from "@/lib/constants";

type ToastType = "ok" | "err" | "info" | "warn";
interface Toast { id: string; msg: string; type: ToastType; }

const Ctx = createContext<((msg: string, type?: ToastType) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((msg: string, type: ToastType = "ok") => {
    const id = uid();
    setToasts(p => [...p.slice(-3), { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const icons: Record<ToastType, string> = { ok: "✓", err: "✕", info: "ℹ", warn: "⚠" };
  const colors: Record<ToastType, string> = {
    ok: "#3DEBA0", err: "#FF4466", info: "#4DC4FF", warn: "#F5C842",
  };

  return (
    <Ctx.Provider value={add}>
      {children}
      {toasts.length > 0 && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
        }}>
          {toasts.map(t => (
            <div key={t.id} style={{
              background: colors[t.type], color: "#000",
              padding: "11px 18px", borderRadius: 10, fontWeight: 700, fontSize: 13,
              boxShadow: "0 8px 32px rgba(0,0,0,.55)",
              display: "flex", alignItems: "center", gap: 8,
              maxWidth: 320, lineHeight: 1.4,
              animation: "fadeInUp .3s ease forwards",
            }}>
              <span>{icons[t.type]}</span>{t.msg}
            </div>
          ))}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
