"use client";
import { useState, CSSProperties, ReactNode } from "react";
import { T } from "@/lib/constants";

/* ── Button ── */
type BtnVariant = "coral" | "ghost" | "outline" | "danger" | "ok" | "dark" | "gold";
type BtnSize    = "xs" | "sm" | "md" | "lg" | "xl";

const BTN_MAP: Record<BtnVariant, (hov: boolean) => [string, string, string]> = {
  coral:   h => [h ? T.coralD : T.coral,   "#000", "none"],
  ghost:   h => [h ? T.raised : "transparent", T.muted, `1px solid ${T.border}`],
  outline: h => [h ? T.coralG : "transparent", T.coral, `1px solid ${T.coral}`],
  danger:  h => [h ? "#cc1133" : T.danger, "#fff", "none"],
  ok:      h => [h ? "#2dc98a" : T.ok,     "#000", "none"],
  dark:    h => [h ? T.raised : T.card, T.champagne, `1px solid ${T.border}`],
  gold:    h => [h ? "#d4a820" : T.gold,   "#000", "none"],
};
const BTN_PAD:Record<BtnSize,string> = { xs:"4px 10px", sm:"7px 16px", md:"10px 22px", lg:"13px 30px", xl:"16px 38px" };
const BTN_FS:Record<BtnSize,number>  = { xs:11, sm:12, md:14, lg:15, xl:16 };

export function Btn({
  children, onClick, v = "coral", sz = "md",
  disabled = false, full = false, style: st = {}, href, loading = false,
}: {
  children: ReactNode; onClick?: () => void; v?: BtnVariant; sz?: BtnSize;
  disabled?: boolean; full?: boolean; style?: CSSProperties; href?: string;
  loading?: boolean;
}) {
  const [hov, setH] = useState(false);
  const [bg, color, border] = BTN_MAP[v](hov && !disabled && !loading);
  const style: CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 7, fontWeight: 700, fontSize: BTN_FS[sz], padding: BTN_PAD[sz],
    borderRadius: 10, cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? .5 : 1,
    width: full ? "100%" : "auto", transition: "all .18s",
    letterSpacing: ".02em", background: bg, color, border,
    fontFamily: "inherit", ...st,
  };
  if (href) return <a href={href} style={style}>{children}</a>;
  return (
    <button onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={style}>
      {loading ? <span className="spin" style={{width:14,height:14,borderRadius:"50%",border:`2px solid currentColor`,borderTopColor:"transparent",display:"inline-block"}}/>: null}
      {children}
    </button>
  );
}

/* ── Badge / Pill ── */
type BadgeType = "coral" | "danger" | "sky" | "gold" | "ok" | "purple" | "teal" | "muted";
const BADGE_CLR: Record<BadgeType, string> = {
  coral: T.coral, danger: T.danger, sky: T.sky, gold: T.gold,
  ok: T.ok, purple: T.purple, teal: T.teal, muted: T.muted,
};

export function Badge({ text, type = "coral", tiny = false, style: st }: {
  text: string; type?: BadgeType; tiny?: boolean; style?: CSSProperties;
}) {
  const bg = BADGE_CLR[type] ?? T.coral;
  return (
    <span style={{
      background: bg, color: "#000",
      fontSize: tiny ? 8 : 9, fontWeight: 900,
      padding: tiny ? "1px 5px" : "2px 8px",
      borderRadius: 3, letterSpacing: ".08em",
      textTransform: "uppercase", flexShrink: 0, lineHeight: "1.6",
      ...st,
    }}>{text}</span>
  );
}

export function OutlineBadge({ text, type = "coral", style: st }: {
  text: string; type?: BadgeType; style?: CSSProperties;
}) {
  const c = BADGE_CLR[type] ?? T.coral;
  return (
    <span style={{
      background: c + "15", color: c,
      border: `1px solid ${c}44`, borderRadius: 20,
      padding: "3px 12px", fontSize: 12, fontWeight: 700,
      textTransform: "capitalize", ...st,
    }}>{text}</span>
  );
}

/* ── Skeleton ── */
export function Skeleton({ w = "100%", h = 16, r = 6, style: st }: {
  w?: string | number; h?: string | number; r?: number; style?: CSSProperties;
}) {
  return (
    <div className="shimmer" style={{ width: w, height: h, borderRadius: r, ...st }} />
  );
}

export function ProductSkeleton() {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ paddingTop: "82%", position: "relative" }}>
        <div className="shimmer" style={{ position: "absolute", inset: 0 }} />
      </div>
      <div style={{ padding: "14px 16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton h={12} w="40%" />
        <Skeleton h={15} />
        <Skeleton h={13} w="70%" />
        <Skeleton h={10} w="55%" />
        <Skeleton h={20} w="45%" />
      </div>
    </div>
  );
}

/* ── Safe image with fallback ── */
export function SafeImg({ src, alt = "", style: st, fallback = "📦" }: {
  src?: string; alt?: string; style?: CSSProperties; fallback?: string;
}) {
  const [err, setErr] = useState(false);
  if (!src || err) return (
    <div style={{
      ...st, display: "flex", alignItems: "center", justifyContent: "center",
      background: T.raised, color: T.dim, fontSize: 32, flexShrink: 0,
    }}>{fallback}</div>
  );
  return <img src={src} alt={alt} style={st} onError={() => setErr(true)} />;
}

/* ── Divider ── */
export function Divider({ style: st }: { style?: CSSProperties }) {
  return <div style={{ height: 1, background: T.border, ...st }} />;
}

/* ── Section Header ── */
export function SectionHead({ title, sub, action, actionHref }: {
  title: string; sub?: string; action?: string; actionHref?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
      <div>
        <h2 className="playfair" style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 700 }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{sub}</p>}
      </div>
      {action && (
        <a href={actionHref ?? "#"}
          style={{ fontSize: 13, color: T.coral, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
          {action} →
        </a>
      )}
    </div>
  );
}

/* ── Empty State ── */
export function EmptyState({ icon, title, sub, action, onAction }: {
  icon: string; title: string; sub?: string; action?: string; onAction?: () => void;
}) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: T.muted }}>
      <div style={{ fontSize: 72, marginBottom: 18 }}>{icon}</div>
      <h3 className="playfair" style={{ fontSize: 22, fontWeight: 700, color: T.champagne, marginBottom: 8 }}>{title}</h3>
      {sub && <p style={{ fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>{sub}</p>}
      {action && <Btn onClick={onAction} v="outline">{action}</Btn>}
    </div>
  );
}

/* ── Quantity Stepper ── */
export function QtyStepper({ qty, onDec, onInc, max, min = 1 }: {
  qty: number; onDec: () => void; onInc: () => void; max?: number; min?: number;
}) {
  return (
    <div style={{ display: "flex", border: `1px solid ${T.border}`, borderRadius: 9, overflow: "hidden" }}>
      <button onClick={onDec} disabled={qty <= min}
        style={{ background: T.raised, border: "none", padding: "10px 16px", cursor: qty <= min ? "not-allowed" : "pointer", opacity: qty <= min ? .4 : 1 }}>
        <span style={{ fontSize: 18, color: T.champagne }}>−</span>
      </button>
      <span style={{ padding: "10px 22px", fontWeight: 800, fontSize: 16, background: T.card, minWidth: 60, textAlign: "center" }}>{qty}</span>
      <button onClick={onInc} disabled={max !== undefined && qty >= max}
        style={{ background: T.raised, border: "none", padding: "10px 16px", cursor: max !== undefined && qty >= max ? "not-allowed" : "pointer", opacity: max !== undefined && qty >= max ? .4 : 1 }}>
        <span style={{ fontSize: 18, color: T.champagne }}>+</span>
      </button>
    </div>
  );
}

/* ── Chip (filter tag) ── */
export function Chip({ label, onDel }: { label: string; onDel: () => void }) {
  return (
    <span style={{
      background: T.coralG, border: `1px solid var(--coral-g)`,
      borderRadius: 20, padding: "4px 12px", fontSize: 12, color: T.coral,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      {label}
      <button onClick={onDel} style={{ background: "none", border: "none", color: T.coral, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
    </span>
  );
}

/* ── Scroll To Top ── */
export default function ScrollToTop() {
  const [vis, setVis] = useState(false);
  if (typeof window !== "undefined") {
    // Only attach scroll listener on client
  }
  return null; // handled in ScrollToTop component file
}
