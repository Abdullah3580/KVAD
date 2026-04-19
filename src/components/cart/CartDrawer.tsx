/* src/components/ui/index.tsx */
"use client";
import { useState, ReactNode, CSSProperties } from "react";

/* ── Button ── */
type BtnVariant = "coral" | "ghost" | "outline" | "danger" | "ok" | "dark" | "gold";
type BtnSize    = "xs" | "sm" | "md" | "lg" | "xl";

const BTN_VARIANTS: Record<BtnVariant, string> = {
  coral:   "bg-primary text-primary-foreground border-transparent hover:brightness-90",
  ghost:   "bg-transparent text-muted-foreground border-border hover:bg-muted",
  outline: "bg-transparent text-primary border-primary hover:bg-primary/10",
  danger:  "bg-destructive text-white border-transparent hover:brightness-90",
  ok:      "bg-emerald-500 text-white border-transparent hover:brightness-90",
  dark:    "bg-card text-foreground border-border hover:bg-muted",
  gold:    "bg-amber-500 text-black border-transparent hover:brightness-90",
};

const BTN_SIZES: Record<BtnSize, string> = {
  xs: "px-2.5 py-1 text-[11px]",
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
  xl: "px-10 py-4 text-lg",
};

export function Btn({
  children, onClick, v = "coral", sz = "md",
  disabled = false, full = false, className = "", href, loading = false,
  style, 
}: {
  children: ReactNode; onClick?: () => void; v?: BtnVariant; sz?: BtnSize;
  disabled?: boolean; full?: boolean; className?: string; href?: string;
  loading?: boolean; style?: CSSProperties;
}) {
  const baseClass = `inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 border active:scale-[0.98] ${
    disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  } ${full ? "w-full" : "w-auto"} ${BTN_VARIANTS[v]} ${BTN_SIZES[sz]} ${className}`;

  if (href) return <a href={href} className={baseClass} style={style}>{children}</a>;

  return (
    <button 
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={baseClass}
      style={style}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}

/* ── Badge / Pill ── */
type BadgeType = "coral" | "danger" | "sky" | "gold" | "ok" | "purple" | "teal" | "muted";
const BADGE_VARIANTS: Record<BadgeType, string> = {
  coral: "bg-primary text-primary-foreground",
  danger: "bg-destructive text-white",
  sky: "bg-sky-500 text-white",
  gold: "bg-amber-500 text-black",
  ok: "bg-emerald-500 text-white",
  purple: "bg-purple-500 text-white",
  teal: "bg-teal-500 text-white",
  muted: "bg-muted text-muted-foreground",
};

export function Badge({ text, type = "coral", tiny = false, className = "" }: {
  text: string; type?: BadgeType; tiny?: boolean; className?: string;
}) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded px-2 py-0.5 font-black uppercase tracking-widest leading-none ${
      tiny ? "text-[8px]" : "text-[10px]"
    } ${BADGE_VARIANTS[type]} ${className}`}>
      {text}
    </span>
  );
}

export function OutlineBadge({ text, type = "coral", className = "" }: {
  text: string; type?: BadgeType; className?: string;
}) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full border border-current/20 bg-current/10 px-3 py-1 text-xs font-bold capitalize ${
      type === 'coral' ? 'text-primary' : 'text-muted-foreground'
    } ${className}`}>
      {text}
    </span>
  );
}

/* ── Skeleton ── */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export function ProductSkeleton() {
  return (
    <div className="luxury-card overflow-hidden">
      <div className="aspect-[4/5] w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-5 w-1/2 mt-2" />
      </div>
    </div>
  );
}

/* ── Safe image with fallback ── */
export function SafeImg({ src, alt = "", className = "", fallback = "📦", style }: {
  src?: string; alt?: string; className?: string; fallback?: string; style?: CSSProperties;
}) {
  const [err, setErr] = useState(false);
  if (!src || err) return (
    <div 
      style={style} 
      className={`flex items-center justify-center bg-muted text-muted-foreground text-3xl ${className}`}
    >
      {fallback}
    </div>
  );
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      style={style} 
      onError={() => setErr(true)} 
    />
  );
}

/* ── Divider ── */
export function Divider({ className = "" }: { className?: string }) {
  return <div className={`h-px w-full bg-border ${className}`} />;
}

/* ── Section Header ── */
export function SectionHead({ title, sub, action, actionHref }: {
  title: string; sub?: string; action?: string; actionHref?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h2 className="playfair text-2xl font-bold md:text-3xl">{title}</h2>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action && (
        <a href={actionHref ?? "#"} className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-7xl">{icon}</div>
      <h3 className="playfair mb-2 text-2xl font-bold text-foreground">{title}</h3>
      {sub && <p className="mb-6 max-w-xs text-sm text-muted-foreground leading-relaxed">{sub}</p>}
      {action && <Btn onClick={onAction} v="outline" sz="sm">{action}</Btn>}
    </div>
  );
}

/* ── Quantity Stepper ── */
export function QtyStepper({ qty, onDec, onInc, max, min = 1 }: {
  qty: number; onDec: () => void; onInc: () => void; max?: number; min?: number;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-xl border border-border bg-muted">
      <button 
        onClick={onDec} 
        disabled={qty <= min}
        className="px-4 py-2 text-xl font-bold transition-hover hover:bg-background disabled:opacity-30"
      >
        −
      </button>
      <span className="flex min-w-[60px] items-center justify-center bg-card px-4 font-black text-foreground">
        {qty}
      </span>
      <button 
        onClick={onInc} 
        disabled={max !== undefined && qty >= max}
        className="px-4 py-2 text-xl font-bold transition-hover hover:bg-background disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

/* ── Chip (filter tag) ── */
export function Chip({ label, onDel }: { label: string; onDel: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
      {label}
      <button onClick={onDel} className="text-lg leading-none hover:opacity-70">×</button>
    </span>
  );
}
export default CartDrawer;