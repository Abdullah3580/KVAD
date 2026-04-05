"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { T, fmt, pct, CATS, CAT_META, SORT_OPTS } from "@/lib/constants";
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
    <section style={{
      background: `linear-gradient(135deg,#180000,${T.card})`,
      border: `1px solid rgb(255, 255, 255)`, borderRadius: 20, padding: "22px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Ic n="zap" s={26} c={T.danger} solid />
          <span className="playfair" style={{ fontSize: 26,fontWeight: 900,color: T.danger}}>ফ্ল্যাশ সেল</span>
        </div>
        {/* Timer */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: T.muted }}>শেষ হবে:</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[h, ":", m, ":", s].map((v, i) =>
              i % 2 === 1
                ? <span key={i} style={{ color: T.danger, fontWeight: 900, fontSize: 18 }}>:</span>
                : <span key={i} style={{
                  background: T.danger, color: "#fff", borderRadius: 6,
                  padding: "3px 8px", fontSize: 17, fontWeight: 900,
                  minWidth: 36, textAlign: "center", fontVariantNumeric: "tabular-nums",
                }}>{v}</span>
            )}
          </div>
        </div>
        <Link href="/?sort=discount" style={{ marginLeft: "auto", fontSize: 13, color: T.coral, fontWeight: 700 }}>
          সব দেখুন →
        </Link>
      </div>

      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
        {items.map(p => {
          const d = pct(p.price, p.was);
          return (
            <Link key={p.id} href={`/product/${p.id}`}
              style={{
                minWidth: 160, maxWidth: 160, background: T.raised, borderRadius: 13,
                overflow: "hidden", border: `1px solid ${T.border}`, flexShrink: 0,
                transition: "transform .2s", display: "block",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}
            >
              <div style={{ position: "relative", paddingTop: "85%", background: T.bg }}>
                <SafeImg src={p.img} alt={p.name}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{
                  position: "absolute", top: 8, left: 8,
                  background: T.danger, color: "#fff",
                  fontSize: 11, fontWeight: 900, padding: "2px 8px", borderRadius: 5,
                }}>-{d}%</span>
              </div>
              <div style={{ padding: "10px 12px 14px" }}>
                <p style={{
                  fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginBottom: 5,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                }}>{p.name}</p>
                <p style={{ fontWeight: 900, color: T.danger, fontSize: 16 }}>{fmt(p.price)}</p>
                <p style={{ fontSize: 11, color: T.dim, textDecoration: "line-through" }}>{fmt(p.was)}</p>
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14 }}>
      {CATS.filter(c => c !== "All").map(c => (
        <Link key={c} href={`/?cat=${c}`}
          style={{
            background: CAT_META[c]?.grad ?? T.card,
            border: `1px solid ${T.border}`, borderRadius: 16,
            padding: "22px 14px", textAlign: "center",
            transition: "all .22s", display: "block",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; (e.currentTarget as HTMLElement).style.borderColor = T.coral; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.borderColor = T.border; }}
        >
          <div style={{ fontSize: 34, marginBottom: 10 }}>{CAT_META[c]?.icon}</div>
          <p style={{ fontWeight: 700, fontSize: 14, color: T.champagne, marginBottom: 4 }}>{c}</p>
          <p style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>{CAT_META[c]?.desc}</p>
          <span style={{
            fontSize: 11, background: T.raised,
            border: `1px solid ${T.border}`, borderRadius: 20,
            padding: "2px 10px", color: T.muted,
          }}>{counts[c] ?? 0} টি</span>
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
    <aside style={{ width: 238, flexShrink: 0 }}>
      <div style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 15, padding: 22,
        position: "sticky", top: 140,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <span className="playfair" style={{ fontWeight: 700, fontSize: 18 }}>ফিল্টার</span>
          {hasFilter && (
            <button onClick={onReset}
              style={{ fontSize: 12, color: T.coral, background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>
              রিসেট ↺
            </button>
          )}
        </div>

        {/* Categories */}
        <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>ক্যাটাগরি</p>
        <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 5 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                width: "100%", padding: "9px 12px",
                background: cat === c ? T.coralG : "transparent",
                border: `1px solid ${cat === c ? T.coral : T.border}`,
                borderRadius: 9, color: cat === c ? T.coral : T.muted,
                cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                fontWeight: cat === c ? 700 : 400, transition: "all .15s",
              }}>
              <span>{CAT_META[c]?.icon} {c}</span>
              <span style={{ fontSize: 11 }}>{loading ? "…" : counts[c] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Price */}
        <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
          সর্বোচ্চ দাম: <span style={{ color: T.coral }}>{fmt(maxP)}</span>
        </p>
        <input type="range" min={100} max={10000} step={100} value={maxP}
          onChange={e => setMaxP(+e.target.value)} style={{ marginBottom: 4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.dim, marginBottom: 24 }}>
          <span>৳১০০</span><span>৳১০,০০০</span>
        </div>

        {/* Rating */}
        <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>ন্যূনতম রেটিং</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[4, 3, 2, 1].map(r => (
            <label key={r} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: minR === r ? T.coral : T.muted }}>
              <input type="radio" name="minR" checked={minR === r} onChange={() => setMinR(r)} style={{ accentColor: T.coral }} />
              <Stars r={r} s={12} /> ও উপরে
            </label>
          ))}
          {minR > 0 && (
            <button onClick={() => setMinR(0)}
              style={{ fontSize: 11, color: T.muted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              বাতিল ×
            </button>
          )}
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
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "12px 16px", background: T.card,
        borderRadius: 12, border: `1px solid ${T.border}`,
      }}>
        <button onClick={() => setShowFilter(!showFilter)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: `1px solid ${showFilter ? T.coral : T.border}`,
            borderRadius: 8, padding: "7px 14px",
            color: showFilter ? T.coral : T.muted,
            cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
          }}>
          <Ic n="filter" s={14} c={showFilter ? T.coral : T.muted} />
          ফিল্টার
        </button>

        <span style={{ fontSize: 13, color: T.muted }}>
          <span style={{ color: T.champagne, fontWeight: 700 }}>{count}</span> টি পণ্য
        </span>

        <div style={{ flex: 1 }} />

        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{
            background: T.raised, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "8px 13px", color: T.champagne,
            fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>
          {SORT_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>

        {/* View toggles */}
        <div style={{ display: "flex", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 9, overflow: "hidden" }}>
          {([["grid3", 3], ["grid4", 4]] as [any, 3 | 4][]).map(([ic, n]) => (
            <button key={n} onClick={() => { setView("grid"); setCols(n); }}
              style={{
                padding: "8px 11px",
                background: view === "grid" && cols === n ? T.coralG : "transparent",
                border: "none", cursor: "pointer",
              }}>
              <Ic n={ic} s={16} c={view === "grid" && cols === n ? T.coral : T.muted} />
            </button>
          ))}
          <button onClick={() => setView("list")}
            style={{ padding: "8px 11px", background: view === "list" ? T.coralG : "transparent", border: "none", cursor: "pointer" }}>
            <Ic n="list" s={16} c={view === "list" ? T.coral : T.muted} />
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {(cat !== "All" || minR > 0 || maxP < 10000 || search) && (
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
          {cat !== "All" && <Chip label={cat} onDel={onRemoveCat} />}
          {minR > 0     && <Chip label={`${minR}★+`} onDel={onRemoveRating} />}
          {maxP < 10000 && <Chip label={`≤${fmt(maxP)}`} onDel={onRemovePrice} />}
          {search       && <Chip label={`"${search}"`} onDel={onRemoveSearch} />}
          <button onClick={onResetAll}
            style={{
              fontSize: 12, color: T.muted, background: T.raised,
              border: `1px solid ${T.border}`, borderRadius: 20,
              padding: "4px 12px", cursor: "pointer", fontFamily: "inherit",
            }}>সব বাতিল ×</button>
        </div>
      )}
    </div>
  );
}
