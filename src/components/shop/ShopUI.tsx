//src/components/shop/ShopUI.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fmt, pct, CATS, CAT_META, SORT_OPTS } from "@/lib/constants";
import { Product } from "@/lib/types";
import { Badge, SafeImg, Chip } from "@/components/ui";
import { Stars } from "@/components/ui/Ic";
import Ic from "@/components/ui/Ic";

/* ── countdown hook ── */
function useCountdown(secs: number) {
  const [left, setLeft] = useState(secs);
  useEffect(() => {
    const t = setInterval(() => setLeft(s => s > 0 ? s - 1 : secs), 1000);
    return () => clearInterval(t);
  }, [secs]);
  return {
    h: String(Math.floor(left / 3600)).padStart(2, "0"),
    m: String(Math.floor((left % 3600) / 60)).padStart(2, "0"),
    s: String(left % 60).padStart(2, "0"),
  };
}

/* ═══════════════════ FLASH SALE ═══════════════════ */
export function FlashSale({ products }: { products: Product[] }) {
  const { h, m, s } = useCountdown(3600 * 2 + 1800);
  const items = useMemo(() => products.filter(p => pct(p.price, p.was) >= 8).slice(0, 12), [products]);
  if (!items.length) return null;

  return (
    <section className="luxury-card border-white/20 bg-gradient-to-br from-red-950/40 to-card p-6">
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2.5">
          <Ic n="zap" s={26} className="text-destructive fill-current" />
          <span className="playfair text-2xl font-black text-destructive">ফ্ল্যাশ সেল</span>
        </div>
        
        {/* Timer */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">শেষ হবে:</span>
          <div className="flex items-center gap-1 font-mono">
            {[h, ":", m, ":", s].map((v, i) =>
              i % 2 === 1
                ? <span key={i} className="text-lg font-black text-destructive">:</span>
                : <span key={i} className="min-w-[36px] rounded-lg bg-destructive px-2 py-1 text-center text-sm font-black text-white tabular-nums shadow-lg">
                    {v}
                  </span>
            )}
          </div>
        </div>
        <Link href="/?sort=discount" className="ml-auto text-xs font-bold text-primary hover:underline">
          সব দেখুন →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.map(p => {
          const d = pct(p.price, p.was);
          return (
            <Link key={p.id} href={`/product/${p.id}`} className="group relative block w-40 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted transition-all hover:-translate-y-1">
              <div className="relative aspect-[4/5] overflow-hidden bg-background">
                <SafeImg src={p.img} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute left-2 top-2 rounded-md bg-destructive px-2 py-0.5 text-[10px] font-black text-white">-{d}%</span>
              </div>
              <div className="p-3">
                <p className="mb-1 line-clamp-2 text-[11px] font-semibold leading-tight">{p.name}</p>
                <p className="text-sm font-black text-destructive">{fmt(p.price)}</p>
                <p className="text-[10px] text-muted-foreground line-through">{fmt(p.was)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════ CATEGORY SHOWCASE ═══════════════════ */
export function CategoryShowcase({ counts }: { counts: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {CATS.filter(c => c !== "All").map(c => (
        <Link key={c} href={`/?cat=${c}`}
          className="luxury-card flex flex-col items-center justify-center p-6 text-center hover:scale-105 hover:border-primary/50"
          style={{ background: CAT_META[c]?.grad }}
        >
          <div className="mb-3 text-4xl">{CAT_META[c]?.icon}</div>
          <p className="mb-1 text-sm font-bold text-foreground">{c}</p>
          <p className="mb-2 text-[10px] text-muted-foreground">{CAT_META[c]?.desc}</p>
          <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] text-muted-foreground">
            {counts[c] ?? 0} টি
          </span>
        </Link>
      ))}
    </div>
  );
}

/* ═══════════════════ FILTER SIDEBAR ═══════════════════ */
export function FilterSidebar({
  cat, setCat, maxP, setMaxP, minR, setMinR, counts, onReset, loading,
}: {
  cat: string; setCat: (c: string) => void;
  maxP: number; setMaxP: (n: number) => void;
  minR: number; setMinR: (n: number) => void;
  counts: Record<string, number>; onReset: () => void; loading: boolean;
}) {
  const hasFilter = cat !== "All" || minR > 0 || maxP < 10000;

  return (
    <aside className="w-[240px] shrink-0">
      <div className="luxury-card sticky top-32 p-6">
        <div className="mb-6 flex items-center justify-between">
          <span className="playfair text-lg font-bold">ফিল্টার</span>
          {hasFilter && (
            <button onClick={onReset} className="text-[11px] font-bold text-primary hover:opacity-80">
              রিসেট ↺
            </button>
          )}
        </div>

        {/* Categories */}
        <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ক্যাটাগরি</p>
        <div className="mb-6 flex flex-col gap-1.5">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition-all ${
                cat === c ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border bg-transparent text-muted-foreground'
              }`}
            >
              <span>{CAT_META[c]?.icon} {c}</span>
              <span className="text-[10px] opacity-60">{loading ? "…" : counts[c] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Price */}
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          সর্বোচ্চ দাম: <span className="text-primary">{fmt(maxP)}</span>
        </p>
        <input type="range" min={100} max={10000} step={100} value={maxP}
          onChange={e => setMaxP(+e.target.value)} className="w-full accent-primary" />
        <div className="mb-6 flex justify-between text-[10px] text-muted-foreground/60 font-mono">
          <span>৳১০০</span><span>৳১০,০০০</span>
        </div>

        {/* Rating */}
        <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ন্যূনতম রেটিং</p>
        <div className="flex flex-col gap-2.5">
          {[4, 3, 2, 1].map(r => (
            <label key={r} className={`flex cursor-pointer items-center gap-2 text-xs transition-colors ${minR === r ? 'text-primary' : 'text-muted-foreground'}`}>
              <input type="radio" name="minR" checked={minR === r} onChange={() => setMinR(r)} className="accent-primary" />
              <Stars r={r} s={12} /> ও উপরে
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ═══════════════════ TOOLBAR ═══════════════════ */
export function ShopToolbar({
  count, sort, setSort, view, setView, cols, setCols,
  showFilter, setShowFilter, cat, minR, maxP, search,
  onRemoveCat, onRemoveRating, onRemovePrice, onRemoveSearch, onResetAll,
}: {
  count: number; sort: string; setSort: (s: string) => void;
  view: string; setView: (v: any) => void;
  cols: 3 | 4; setCols: (c: 3 | 4) => void;
  showFilter: boolean; setShowFilter: (v: boolean) => void;
  cat: string; minR: number; maxP: number; search: string;
  onRemoveCat: () => void; onRemoveRating: () => void;
  onRemovePrice: () => void; onRemoveSearch: () => void; onResetAll: () => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <button onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
            showFilter ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground bg-muted/50'
          }`}
        >
          <Ic n="filter" s={14} /> ফিল্টার
        </button>

        <span className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{count}</span> টি পণ্য পাওয়া গেছে
        </span>

        <div className="flex-1" />

        <select value={sort} onChange={e => setSort(e.target.value)}
          className="rounded-xl border border-border bg-muted px-4 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {SORT_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>

        {/* View toggles */}
        <div className="flex overflow-hidden rounded-xl border border-border bg-muted">
          {([["grid3", 3], ["grid4", 4]] as [any, 3 | 4][]).map(([ic, n]) => (
            <button key={n} onClick={() => { setView("grid"); setCols(n); }}
              className={`p-2.5 transition-colors ${view === "grid" && cols === n ? 'bg-primary text-white' : 'hover:bg-primary/10 text-muted-foreground'}`}
            >
              <Ic n={ic} s={16} />
            </button>
          ))}
          <button onClick={() => setView("list")}
            className={`p-2.5 transition-colors ${view === "list" ? 'bg-primary text-white' : 'hover:bg-primary/10 text-muted-foreground'}`}
          >
            <Ic n="list" s={16} />
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {(cat !== "All" || minR > 0 || maxP < 10000 || search) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {cat !== "All" && <Chip label={cat} onDel={onRemoveCat} />}
          {minR > 0     && <Chip label={`${minR}★+`} onDel={onRemoveRating} />}
          {maxP < 10000 && <Chip label={`≤${fmt(maxP)}`} onDel={onRemovePrice} />}
          {search       && <Chip label={`"${search}"`} onDel={onRemoveSearch} />}
          <button onClick={onResetAll} className="rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-bold text-muted-foreground hover:bg-destructive hover:text-white transition-colors">
            সব বাতিল ×
          </button>
        </div>
      )}
    </div>
  );
}