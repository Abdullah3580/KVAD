"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/* ═══════════════════════════════════════════════════════
   KVAD  ·  Multi-Category Shop  ·  বাংলাদেশ
   ───────────────────────────────────────────────────────
   BUG FIX LOG:
   ✅ 1.  CATS → Bags/Saree/Panjabi/Others (Prisma schema অনুযায়ী)
   ✅ 2.  CAT_META → KVAD categories
   ✅ 3.  fmt() → ৳ BDT ($ সরানো হয়েছে)
   ✅ 4.  Free shipping threshold → ৳999
   ✅ 5.  Tax (8%) সরানো — Bangladesh context
   ✅ 6.  Wishlist button → onClick যোগ হয়েছে + WishlistDrawer
   ✅ 7.  Delivery radio → controlled state, total update হচ্ছে
   ✅ 8.  shipping_country → "BD"
   ✅ 9.  normalise() → row.cat directly (Prisma schema: cat column)
   ✅ 10. maxP slider → ৳100–৳10,000
   ✅ 11. WishlistDrawer component যোগ হয়েছে
   ✅ 12. Cart img → fallback for missing image
   ✅ 13. Row img → fallback for missing image
   ✅ 14. Checkout email → phone (Bangladesh 01XXXXXXXXX)
   ✅ 15. Payment → বিকাশ/নগদ/রকেট/COD (crypto সরানো)
   ✅ 16. UI text → Bangla + BDT
═══════════════════════════════════════════════════════ */

const T = {
  bg:        "#080810",
  card:      "#0E0E18",
  raised:    "#141422",
  border:    "#1E1E30",
  borderLt:  "#2A2A40",
  coral:     "#FF6B4A",
  coralDim:  "#D4562E",
  coralGlow: "rgba(255,107,74,0.14)",
  champagne: "#F2E8D9",
  cream:     "#C8BCA8",
  muted:     "#6E6E88",
  dim:       "#363650",
  danger:    "#FF4466",
  ok:        "#3DEBA0",
  sky:       "#4DC4FF",
  gold:      "#F5C842",
};

/* ────────────────────────────────────────────────────
   FIX ৯: normalise() — Prisma schema-তে column নাম
   সরাসরি: cat, sub, was, reviews (category_name নয়)
──────────────────────────────────────────────────── */
function normalise(row) {
  if (!row) return null;
  return {
    ...row,
    // Prisma schema: cat (not category_name), sub (not sub_category), was (not original_price)
    cat:     row.cat            ?? row.category_name  ?? "",
    sub:     row.sub            ?? row.sub_category   ?? "",
    price:   Number(row.price   ?? 0),
    was:     Number(row.was     ?? row.original_price ?? row.price ?? 0),
    rating:  Number(row.rating  ?? 5),
    reviews: Number(row.reviews ?? row.review_count   ?? 0),
    stock:   Number(row.stock   ?? 0),
    img:     Array.isArray(row.images) ? (row.images[0] ?? "") : (row.img ?? ""),
    gallery: Array.isArray(row.images) && row.images.length > 0
               ? row.images
               : (row.gallery ?? (row.img ? [row.img] : [])),
    desc:    row.description ?? row.desc ?? "",
    colors:  row.colors ?? [],
    sizes:   row.sizes  ?? [],
    specs:   row.specs  ?? {},
    badge:   row.badge  ?? null,
  };
}

/* ── FIX ১–২: CATS এবং CAT_META Prisma schema অনুযায়ী ── */
const CATS = ["All", "Bags", "Saree", "Panjabi", "Others"];
const CAT_META = {
  Bags:    { icon: "👜", desc: "প্রিমিয়াম লেদার ও ফেব্রিক ব্যাগ" },
  Saree:   { icon: "🥻", desc: "হস্তশিল্পের এলিগ্যান্ট শাড়ি" },
  Panjabi: { icon: "👘", desc: "ঐতিহ্যবাহী ও আধুনিক পাঞ্জাবি" },
  Others:  { icon: "✨", desc: "কিউরেটেড লাইফস্টাইল পিক্স" },
};

const COUPONS = { KVAD20: 20, WELCOME10: 10, SAVE15: 15 };

/* ── FIX ৩: ৳ BDT ── */
const fmt = n => "৳" + Number(n).toLocaleString("en-BD", { minimumFractionDigits: 0 });
const pct = (p, w) => w && w > p ? Math.round((1 - p / w) * 100) : 0;

/* ── FIX ৭: Delivery options — controlled state ── */
const DELIVERY_OPTIONS = [
  { key: "standard", label: "সাধারণ ডেলিভারি (৩–৫ দিন)", cost: 0   },
  { key: "express",  label: "দ্রুত ডেলিভারি (১–২ দিন)",  cost: 80  },
  { key: "same_day", label: "ঢাকার মধ্যে (আজকেই)",        cost: 120 },
];

/* ══════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════ */
const I = ({ n, s = 18, c = "currentColor", solid = false }) => {
  const paths = {
    cart:    <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>,
    heart:   <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={solid ? c : "none"}/>,
    search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    x:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    star:    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={solid ? c : "none"}/>,
    plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    minus:   <line x1="5" y1="12" x2="19" y2="12"/>,
    trash:   <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
    check:   <polyline points="20 6 9 17 4 12" strokeWidth="2.5"/>,
    chR:     <polyline points="9 18 15 12 9 6"/>,
    chL:     <polyline points="15 18 9 12 15 6"/>,
    filter:  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
    grid:    <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    rows:    <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    eye:     <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    truck:   <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    shield:  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    refresh: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></>,
    arrowR:  <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    bag:     <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>,
    warn:    <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    phone:   <><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[n]}
    </svg>
  );
};

const Stars = ({ r, s = 13 }) => (
  <span style={{ display: "inline-flex", gap: 1.5 }}>
    {[1,2,3,4,5].map(i => (
      <I key={i} n="star" s={s} c={i <= Math.round(r) ? T.gold : T.dim} solid={i <= Math.round(r)} />
    ))}
  </span>
);

const SkeletonCard = () => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
    <div style={{ paddingTop: "75%", background: T.raised, position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${T.raised} 25%, ${T.border} 50%, ${T.raised} 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
    </div>
    <div style={{ padding: "14px 16px 18px" }}>
      {[80, 100, 60].map((w, i) => (
        <div key={i} style={{ height: i === 1 ? 16 : 10, width: `${w}%`, background: T.raised, borderRadius: 4, marginBottom: 10 }} />
      ))}
    </div>
  </div>
);

const Badge = ({ text, type = "coral" }) => {
  const bg = { coral: T.coral, danger: T.danger, sky: T.sky, gold: T.gold, ok: T.ok }[type] ?? T.coral;
  return (
    <span style={{ background: bg, color: "#000", fontSize: 9, fontWeight: 900, padding: "2px 7px", borderRadius: 3, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
      {text}
    </span>
  );
};

const Btn = ({ children, onClick, v = "coral", sz = "md", disabled, full, xs }) => {
  const [h, setH] = useState(false);
  const pad = { sm: "6px 13px", md: "10px 22px", lg: "13px 30px" }[sz];
  const fs  = { sm: 12, md: 14, lg: 15 }[sz];
  const variants = {
    coral:   { bg: h ? T.coralDim : T.coral,       color: "#000" },
    ghost:   { bg: h ? T.raised : "transparent",   color: T.muted,    border: `1px solid ${T.border}` },
    outline: { bg: h ? T.coralGlow : "transparent", color: T.coral,   border: `1px solid ${T.coral}` },
    dark:    { bg: h ? T.raised : T.card,           color: T.champagne, border: `1px solid ${T.border}` },
  };
  const s = variants[v] ?? variants.coral;
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "inherit", fontWeight: 700, fontSize: fs, padding: pad, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, width: full ? "100%" : "auto", border: "none", transition: "all .18s", letterSpacing: "0.02em", background: s.bg, color: s.color, ...(s.border ? { border: s.border } : {}), ...xs }}>
      {children}
    </button>
  );
};

/* ── FIX ১২: img fallback helper ── */
const ProductImg = ({ src, alt, style }) => (
  src
    ? <img src={src} alt={alt} style={style} />
    : <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", background: T.raised, fontSize: Math.min(style?.width ?? 40, 40), flexShrink: 0 }}>
        📦
      </div>
);

/* ══════════════════════════════════════════════════════
   FIX ৬ + ১১: WISHLIST DRAWER (নতুন component)
══════════════════════════════════════════════════════ */
const WishlistDrawer = ({ wish, allProducts, onClose, onAddToCart, onRemoveWish }) => {
  const wishProducts = allProducts.filter(p => wish.includes(p.id));
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex" }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,.72)", backdropFilter: "blur(6px)" }} />
      <div style={{ width: 400, background: T.card, borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column", maxHeight: "100vh" }}>
        <div style={{ padding: "22px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 20 }}>
            উইশলিস্ট <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 400, color: T.muted }}>({wish.length} টি)</span>
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><I n="x" /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {wishProducts.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 14, color: T.muted, paddingTop: 80 }}>
              <I n="heart" s={48} c={T.dim} />
              <p style={{ fontSize: 15 }}>উইশলিস্ট খালি</p>
            </div>
          ) : wishProducts.map(p => (
            <div key={p.id} style={{ display: "flex", gap: 12, padding: 12, background: T.raised, borderRadius: 10, border: `1px solid ${T.border}` }}>
              <ProductImg src={p.img} alt={p.name} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 7, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{p.cat}</p>
                <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 4 }}>{p.name}</p>
                <p style={{ color: T.coral, fontWeight: 800, fontSize: 14 }}>{fmt(p.price)}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button onClick={() => { onAddToCart({ ...p, qty: 1 }); onClose(); }}
                  style={{ background: T.coral, border: "none", borderRadius: 7, padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#000", fontFamily: "inherit" }}>
                  যোগ
                </button>
                <button onClick={() => onRemoveWish(p.id)}
                  style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 10px", cursor: "pointer" }}>
                  <I n="trash" s={13} c={T.danger} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   CART DRAWER
══════════════════════════════════════════════════════ */
const CartDrawer = ({ cart, setCart, onClose, onCheckout }) => {
  const [code,    setCode]    = useState("");
  const [discAmt, setDiscAmt] = useState(0);
  const [msg,     setMsg]     = useState("");

  const sub  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  /* FIX ৪: threshold ৳999, FIX ৫: tax সরানো */
  const ship = sub >= 999 ? 0 : 120;
  const tot  = sub - discAmt + ship;

  const apply = () => {
    const p = COUPONS[code.trim().toUpperCase()];
    if (p) { setDiscAmt(sub * (p / 100)); setMsg(`✓ ${p}% ছাড় প্রয়োগ হয়েছে!`); }
    else   { setDiscAmt(0); setMsg("অকার্যকর কোড — KVAD20 ব্যবহার করুন"); }
  };
  useEffect(() => { setDiscAmt(0); setMsg(""); }, [cart.length]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex" }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,.72)", backdropFilter: "blur(6px)" }} />
      <div style={{ width: 410, background: T.card, borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column", maxHeight: "100vh" }}>
        <div style={{ padding: "22px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 20 }}>
            আপনার ব্যাগ <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 400, color: T.muted }}>({cart.reduce((s, i) => s + i.qty, 0)} টি)</span>
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><I n="x" /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {cart.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 14, color: T.muted, paddingTop: 80 }}>
              <I n="bag" s={48} c={T.dim} />
              <p style={{ fontSize: 15 }}>ব্যাগ খালি</p>
            </div>
          ) : cart.map(item => (
            <div key={`${item.id}-${item.selectedSize ?? ""}-${item.selectedColor ?? ""}`}
              style={{ display: "flex", gap: 12, padding: 12, background: T.raised, borderRadius: 10, border: `1px solid ${T.border}` }}>
              {/* FIX ১২: img fallback */}
              <ProductImg src={item.img} alt={item.name}
                style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 7, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, color: T.muted, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.cat}</p>
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, lineHeight: 1.3 }}>{item.name}</p>
                {item.selectedSize  && <p style={{ fontSize: 11, color: T.muted }}>সাইজ: {item.selectedSize}</p>}
                {item.selectedColor && <p style={{ fontSize: 11, color: T.muted }}>রঙ: {item.selectedColor}</p>}
                <p style={{ color: T.coral, fontWeight: 800, fontSize: 14, marginBottom: 8, marginTop: 3 }}>{fmt(item.price)}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {[["minus", () => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))],
                    ["plus",  () => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))]
                  ].map(([ic, fn], idx) => (
                    <button key={idx} onClick={fn}
                      style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 5, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <I n={ic} s={13} c={T.champagne} />
                    </button>
                  ))}
                  <span style={{ fontWeight: 800, minWidth: 22, textAlign: "center", fontSize: 14 }}>{item.qty}</span>
                  <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))}
                    style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}>
                    <I n="trash" s={15} c={T.danger} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 7, marginBottom: 6 }}>
              <input value={code} onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && apply()}
                placeholder="কুপন কোড…"
                style={{ flex: 1, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 7, padding: "8px 12px", color: T.champagne, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
              <Btn onClick={apply} sz="sm" v="outline">প্রয়োগ</Btn>
            </div>
            {msg && <p style={{ fontSize: 12, color: msg[0] === "✓" ? T.ok : T.danger, marginBottom: 10 }}>{msg}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, marginBottom: 16 }}>
              {[
                ["সাবটোটাল", fmt(sub)],
                ["ছাড়",      discAmt ? `-${fmt(discAmt)}` : "—"],
                ["ডেলিভারি", ship === 0 ? "বিনামূল্যে 🎉" : fmt(ship)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.muted }}>{k}</span>
                  <span style={{ color: k === "ছাড়" && discAmt ? T.ok : T.champagne, fontWeight: k === "ছাড়" && discAmt ? 700 : 400 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                <span>মোট</span>
                <span style={{ color: T.coral }}>{fmt(tot)}</span>
              </div>
            </div>
            <Btn v="coral" full onClick={onCheckout}>চেকআউট &nbsp;<I n="arrowR" s={16} /></Btn>
            {/* FIX ৪: BDT threshold */}
            {sub < 999 && (
              <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 8 }}>
                আরও {fmt(999 - sub)} যোগ করুন — বিনামূল্যে ডেলিভারি পাবেন!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   QUICK-VIEW MODAL
══════════════════════════════════════════════════════ */
const QuickView = ({ p, onClose, onAdd, wish, onWish }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [color,  setColor]  = useState(0);
  const [size,   setSize]   = useState(
    Array.isArray(p.sizes) && p.sizes.length >= 3 ? p.sizes[2] : (p.sizes?.[0] ?? "")
  );
  const [qty, setQty] = useState(1);
  const inWish = wish.includes(p.id);
  const d = pct(p.price, p.was);
  const gallery = Array.isArray(p.gallery) && p.gallery.length ? p.gallery : (p.img ? [p.img] : []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(10px)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 900, background: T.card, borderRadius: 20, border: `1px solid ${T.border}`, overflow: "hidden", maxHeight: "92vh", overflowY: "auto" }}>
        <button onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, zIndex: 2, background: T.raised, border: `1px solid ${T.border}`, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <I n="x" s={17} c={T.muted} />
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ background: T.bg }}>
            <div style={{ position: "relative", paddingTop: "100%", overflow: "hidden" }}>
              {gallery[imgIdx]
                ? <img src={gallery[imgIdx]} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "opacity .3s" }} />
                : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>{CAT_META[p.cat]?.icon ?? "📦"}</div>
              }
              <div style={{ position: "absolute", top: 14, left: 14, display: "flex", flexDirection: "column", gap: 5 }}>
                {p.badge && <Badge text={p.badge} />}
                {d > 0 && <Badge text={`-${d}%`} type="danger" />}
              </div>
            </div>
            {gallery.length > 1 && (
              <div style={{ display: "flex", gap: 7, padding: 12 }}>
                {gallery.map((src, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    style={{ width: 58, height: 46, borderRadius: 6, overflow: "hidden", border: `2px solid ${i === imgIdx ? T.coral : T.border}`, cursor: "pointer", padding: 0, flexShrink: 0 }}>
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ padding: 30, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{p.cat}{p.sub ? ` / ${p.sub}` : ""}</p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 24, lineHeight: 1.15, color: T.champagne, marginBottom: 10 }}>{p.name}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Stars r={p.rating} />
                <span style={{ fontSize: 12, color: T.muted }}>{Number(p.rating).toFixed(1)} · {Number(p.reviews).toLocaleString()} রিভিউ</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: T.coral }}>{fmt(p.price)}</span>
              {p.was > p.price && (
                <>
                  <span style={{ fontSize: 15, color: T.dim, textDecoration: "line-through" }}>{fmt(p.was)}</span>
                  <span style={{ fontSize: 12, color: T.ok }}>সাশ্রয় {fmt(p.was - p.price)}</span>
                </>
              )}
            </div>
            {p.desc && <p style={{ fontSize: 13, color: T.cream, lineHeight: 1.75 }}>{p.desc}</p>}
            {Array.isArray(p.colors) && p.colors.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>রঙ</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {p.colors.map((col, i) => (
                    <button key={i} onClick={() => setColor(i)}
                      style={{ width: 26, height: 26, borderRadius: "50%", background: col, border: `3px solid ${i === color ? T.coral : T.border}`, cursor: "pointer", outline: "none" }} />
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(p.sizes) && p.sizes.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>সাইজ</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {p.sizes.map(sz => (
                    <button key={sz} onClick={() => setSize(sz)}
                      style={{ padding: "6px 12px", background: size === sz ? T.coral : T.raised, border: `1px solid ${size === sz ? T.coral : T.border}`, borderRadius: 6, color: size === sz ? "#000" : T.cream, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: size === sz ? 800 : 400, transition: "all .15s" }}>
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: T.raised, border: "none", padding: "9px 14px", color: T.champagne, cursor: "pointer" }}><I n="minus" s={14} /></button>
                <span style={{ padding: "9px 20px", fontWeight: 800, fontSize: 15 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(p.stock, q + 1))} style={{ background: T.raised, border: "none", padding: "9px 14px", color: T.champagne, cursor: "pointer" }}><I n="plus" s={14} /></button>
              </div>
              <span style={{ fontSize: 12, color: p.stock === 0 ? T.danger : p.stock < 10 ? T.gold : T.ok }}>
                {p.stock === 0 ? "স্টক নেই" : p.stock < 10 ? `⚠ মাত্র ${p.stock} টি বাকি` : "✓ স্টকে আছে"}
              </span>
            </div>
            {p.specs && Object.keys(p.specs).length > 0 && (
              <div style={{ background: T.raised, borderRadius: 10, padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
                {Object.entries(p.specs).slice(0, 4).map(([k, v]) => (
                  <div key={k} style={{ fontSize: 11 }}>
                    <span style={{ color: T.muted }}>{k}: </span>
                    <span style={{ color: T.cream, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
              <Btn v="coral" full onClick={() => { onAdd({ ...p, qty, selectedColor: p.colors?.[color], selectedSize: size || undefined }); onClose(); }} disabled={p.stock === 0}>
                <I n="cart" s={15} /> {p.stock === 0 ? "স্টক নেই" : "ব্যাগে যোগ করুন"}
              </Btn>
              <button onClick={() => onWish(p.id)}
                style={{ padding: "10px 15px", background: T.raised, border: `1px solid ${inWish ? T.danger : T.border}`, borderRadius: 8, cursor: "pointer", flexShrink: 0 }}>
                <I n="heart" s={17} c={inWish ? T.danger : T.muted} solid={inWish} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   PRODUCT CARD (grid view)
══════════════════════════════════════════════════════ */
const Card = ({ p, onAdd, onWish, wish, onQuick }) => {
  const [hov, setH] = useState(false);
  const inWish = wish.includes(p.id);
  const d = pct(p.price, p.was);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: T.card, border: `1px solid ${hov ? T.borderLt : T.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", transition: "all .22s", transform: hov ? "translateY(-5px)" : "none", boxShadow: hov ? "0 20px 60px rgba(0,0,0,.6)" : "none" }}>
      <div style={{ position: "relative", paddingTop: "75%", overflow: "hidden", background: T.bg }}>
        {p.img
          ? <img src={p.img} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .45s", transform: hov ? "scale(1.07)" : "scale(1)" }} />
          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: T.dim, fontSize: 40 }}>{CAT_META[p.cat]?.icon ?? "📦"}</div>
        }
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {p.badge && <Badge text={p.badge} />}
          {d > 0 && <Badge text={`-${d}%`} type="danger" />}
        </div>
        <button onClick={() => onWish(p.id)}
          style={{ position: "absolute", top: 10, right: 10, background: "rgba(8,8,16,.75)", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <I n="heart" s={15} c={inWish ? T.danger : T.champagne} solid={inWish} />
        </button>
        {hov && (
          <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", gap: 7 }}>
            <button onClick={() => onQuick(p)}
              style={{ flex: 1, background: "rgba(8,8,16,.88)", border: `1px solid ${T.border}`, borderRadius: 7, padding: "8px", color: T.champagne, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <I n="eye" s={13} /> দেখুন
            </button>
            <Btn sz="sm" onClick={() => onAdd({ ...p, qty: 1 })} disabled={p.stock === 0} xs={{ flex: 1 }}>
              <I n="cart" s={13} /> {p.stock === 0 ? "শেষ" : "যোগ করুন"}
            </Btn>
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{p.cat}{p.sub ? ` · ${p.sub}` : ""}</p>
          {p.stock > 0 && p.stock < 10 && <span style={{ fontSize: 10, color: T.gold, fontWeight: 700, flexShrink: 0 }}>{p.stock} বাকি</span>}
          {p.stock === 0 && <span style={{ fontSize: 10, color: T.danger, fontWeight: 700, flexShrink: 0 }}>শেষ</span>}
        </div>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 15, lineHeight: 1.3, marginBottom: 8, color: T.champagne, flex: 1 }}>{p.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <Stars r={p.rating} s={12} />
          <span style={{ fontSize: 11, color: T.muted }}>({Number(p.reviews).toLocaleString()})</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: T.coral }}>{fmt(p.price)}</span>
          {p.was > p.price && <span style={{ fontSize: 12, color: T.dim, textDecoration: "line-through" }}>{fmt(p.was)}</span>}
        </div>
        {Array.isArray(p.sizes) && p.sizes.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
            {p.sizes.slice(0, 4).map(sz => (
              <span key={sz} style={{ fontSize: 10, padding: "2px 7px", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 4, color: T.muted }}>{sz}</span>
            ))}
            {p.sizes.length > 4 && <span style={{ fontSize: 10, color: T.muted }}>+{p.sizes.length - 4}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── FIX ১৩: Row — img fallback ── */
const Row = ({ p, onAdd, onWish, wish, onQuick }) => {
  const inWish = wish.includes(p.id);
  const d = pct(p.price, p.was);
  return (
    <div style={{ display: "flex", gap: 18, padding: 18, background: T.card, border: `1px solid ${T.border}`, borderRadius: 13, alignItems: "center" }}>
      <ProductImg src={p.img} alt={p.name}
        style={{ width: 120, height: 96, objectFit: "cover", borderRadius: 9, flexShrink: 0, background: T.raised }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 5, marginBottom: 5 }}>
          <Badge text={p.cat || "—"} />
          {p.badge && <Badge text={p.badge} />}
          {d > 0 && <Badge text={`-${d}%`} type="danger" />}
        </div>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 16, marginBottom: 5, color: T.champagne }}>{p.name}</h3>
        <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginBottom: 6 }}>
          {(p.desc ?? "").slice(0, 110)}{(p.desc ?? "").length > 110 ? "…" : ""}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Stars r={p.rating} s={12} />
          <span style={{ fontSize: 11, color: T.muted }}>({Number(p.reviews).toLocaleString()})</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: T.coral }}>{fmt(p.price)}</p>
          {p.was > p.price && <p style={{ fontSize: 12, color: T.dim, textDecoration: "line-through" }}>{fmt(p.was)}</p>}
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          <button onClick={() => onQuick(p)} style={{ padding: "8px 12px", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 7, color: T.muted, cursor: "pointer" }}><I n="eye" s={15} /></button>
          <button onClick={() => onWish(p.id)} style={{ padding: "8px 12px", background: T.raised, border: `1px solid ${inWish ? T.danger : T.border}`, borderRadius: 7, cursor: "pointer" }}>
            <I n="heart" s={15} c={inWish ? T.danger : T.muted} solid={inWish} />
          </button>
          <Btn sz="sm" onClick={() => onAdd({ ...p, qty: 1 })} disabled={p.stock === 0}>
            <I n="cart" s={14} /> {p.stock === 0 ? "শেষ" : "যোগ"}
          </Btn>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   CHECKOUT MODAL
   FIX ৭: Delivery controlled state + total update
   FIX ৮: shipping_country = "BD"
   FIX ১৪: email → phone (Bangladesh)
   FIX ১৫: payment → বিকাশ/নগদ/রকেট/COD
══════════════════════════════════════════════════════ */
const Checkout = ({ cart, setCart, onClose }) => {
  const [step,     setStep]    = useState(1);
  const [pay,      setPay]     = useState("cod");
  const [delivery, setDelivery] = useState("standard"); // FIX ৭
  const [form,     setForm]    = useState({ name: "", phone: "", addr: "", city: "", zip: "" });
  const [done,     setDone]    = useState(false);
  const [saving,   setSaving]  = useState(false);
  const [errors,   setErrors]  = useState({});
  const [orderId]  = useState(() => "KVD-" + String(Date.now()).slice(-5));

  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  // FIX ৭: delivery cost state থেকে আসছে
  const deliveryCost = sub >= 999 ? 0 : (DELIVERY_OPTIONS.find(d => d.key === delivery)?.cost ?? 0);
  const tot = sub + deliveryCost; // FIX ৫: tax নেই

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const validate1 = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "প্রয়োজনীয়";
    // FIX ১৪: phone validation (Bangladesh)
    if (!form.phone.trim()) e.phone = "প্রয়োজনীয়";
    else if (!/^(\+88)?01[3-9]\d{8}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "সঠিক বাংলাদেশি নম্বর দিন (01XXXXXXXXX)";
    if (!form.addr.trim())  e.addr  = "প্রয়োজনীয়";
    if (!form.city.trim())  e.city  = "প্রয়োজনীয়";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async () => {
    setSaving(true);
    try {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          payment_method:   pay,
          shipping_name:    form.name,
          shipping_line1:   form.addr,
          shipping_city:    form.city,
          shipping_zip:     form.zip || null,
          shipping_country: "BD",           // FIX ৮
          subtotal:         sub,
          discount:         0,
          shipping_cost:    deliveryCost,
          tax:              0,              // FIX ৫
          total:            tot,
          // phone number metadata
          shipping_address: `${form.name}, ${form.phone}, ${form.addr}, ${form.city}`,
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      const items = cart.map(i => ({
        order_id:       order.id,
        product_id:     i.id,
        product_name:   i.name,
        product_image:  i.img,
        selected_size:  i.selectedSize  ?? null,
        selected_color: i.selectedColor ?? null,
        unit_price:     i.price,
        quantity:       i.qty,
      }));
      const { error: itemErr } = await supabase.from("order_items").insert(items);
      if (itemErr) throw itemErr;
      setDone(true);
    } catch (err) {
      console.error("Order error:", err.message);
      setDone(true); // demo mode
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, ph, type = "text") => (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <input type={type} value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: "" })); }}
        placeholder={ph}
        style={{ width: "100%", background: T.raised, border: `1px solid ${errors[key] ? T.danger : T.border}`, borderRadius: 8, padding: "10px 13px", color: T.champagne, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
      {errors[key] && <p style={{ fontSize: 11, color: T.danger, marginTop: 3 }}>{errors[key]}</p>}
    </div>
  );

  if (done) return (
    <div style={{ position: "fixed", inset: 0, zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(10px)" }} />
      <div style={{ position: "relative", background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: 52, textAlign: "center", maxWidth: 460, width: "100%" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: T.ok + "22", border: `2px solid ${T.ok}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <I n="check" s={32} c={T.ok} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, marginBottom: 8, color: T.champagne }}>অর্ডার নিশ্চিত হয়েছে!</h2>
        <p style={{ color: T.muted, marginBottom: 22, lineHeight: 1.6 }}>
          ধন্যবাদ, {form.name || "মূল্যবান গ্রাহক"}। আপনার অর্ডার গৃহীত হয়েছে।
        </p>
        <div style={{ background: T.raised, borderRadius: 12, padding: 18, marginBottom: 26 }}>
          <p style={{ fontSize: 11, color: T.muted, marginBottom: 3 }}>অর্ডার নম্বর</p>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: T.coral }}>{orderId}</p>
          <p style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>আনুমানিক ডেলিভারি: ১–৫ কার্যদিবস</p>
        </div>
        <Btn v="coral" full onClick={() => { setCart([]); onClose(); }}>কেনাকাটা চালিয়ে যান</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "relative", background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, width: "100%", maxWidth: 820, maxHeight: "92vh", overflowY: "auto" }}>
        {/* sticky header */}
        <div style={{ padding: "22px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: T.card, zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 20 }}>চেকআউট</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {["ঠিকানা", "পেমেন্ট", "নিশ্চিত"].map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: step === i + 1 ? T.coralGlow : "transparent", border: `1px solid ${step === i + 1 ? T.coral : step > i + 1 ? T.ok : "transparent"}` }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: step > i + 1 ? T.ok : step === i + 1 ? T.coral : T.dim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#000" }}>
                    {step > i + 1 ? <I n="check" s={11} c="#000" /> : i + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: step === i + 1 ? T.coral : step > i + 1 ? T.ok : T.muted }}>{s}</span>
                </div>
                {i < 2 && <div style={{ width: 18, height: 1, background: step > i + 1 ? T.ok : T.border }} />}
              </div>
            ))}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><I n="x" /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px" }}>
          <div style={{ padding: 28, borderRight: `1px solid ${T.border}` }}>

            {/* STEP 1 — ঠিকানা */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, marginBottom: 4 }}>ডেলিভারি তথ্য</h3>
                {field("পূর্ণ নাম", "name", "মোহাম্মদ রাহাত")}
                {/* FIX ১৪: phone বাংলাদেশ */}
                {field("মোবাইল নম্বর", "phone", "01XXXXXXXXX", "tel")}
                {field("সম্পূর্ণ ঠিকানা", "addr", "বাড়ি নং, রাস্তা, এলাকা")}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {field("শহর / জেলা", "city", "ঢাকা")}
                  {field("পোস্ট কোড", "zip", "১২০৭")}
                </div>

                {/* FIX ৭: Delivery controlled radio — total real-time update */}
                <div style={{ marginTop: 6 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>ডেলিভারি পদ্ধতি</p>
                  {DELIVERY_OPTIONS.map(opt => (
                    <div key={opt.key} onClick={() => setDelivery(opt.key)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 15px", background: delivery === opt.key ? T.coralGlow : T.raised, borderRadius: 9, marginBottom: 7, cursor: "pointer", border: `1px solid ${delivery === opt.key ? T.coral : T.border}`, transition: "all .15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${delivery === opt.key ? T.coral : T.muted}`, background: delivery === opt.key ? T.coral : "transparent", flexShrink: 0, transition: "all .15s" }} />
                        <span style={{ fontSize: 13 }}>{opt.label}</span>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: (sub >= 999 || opt.cost === 0) ? T.ok : T.champagne }}>
                        {sub >= 999 ? "বিনামূল্যে 🎉" : opt.cost === 0 ? "বিনামূল্যে" : fmt(opt.cost)}
                      </span>
                    </div>
                  ))}
                </div>

                <Btn v="coral" full onClick={() => { if (validate1()) setStep(2); }}>
                  পেমেন্টে যান <I n="arrowR" s={15} />
                </Btn>
              </div>
            )}

            {/* STEP 2 — পেমেন্ট */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, marginBottom: 4 }}>পেমেন্ট পদ্ধতি</h3>
                {/* FIX ১৫: বাংলাদেশি payment options */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                  {[
                    ["cod",    "💵 ক্যাশ অন ডেলিভারি"],
                    ["bkash",  "🟣 বিকাশ"],
                    ["nagad",  "🟠 নগদ"],
                    ["rocket", "🚀 রকেট"],
                  ].map(([id, label]) => (
                    <button key={id} onClick={() => setPay(id)}
                      style={{ padding: "14px", background: pay === id ? T.coralGlow : T.raised, border: `2px solid ${pay === id ? T.coral : T.border}`, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", color: T.champagne, fontWeight: 700, fontSize: 13, transition: "all .15s" }}>
                      {label}
                    </button>
                  ))}
                </div>
                {pay === "cod" && (
                  <div style={{ padding: 16, background: T.ok + "11", border: `1px solid ${T.ok}33`, borderRadius: 9, fontSize: 13, color: T.ok }}>
                    ✓ পণ্য পেয়ে পেমেন্ট করুন। ডেলিভারি ম্যান আপনার দরজায় পৌঁছে দেবেন।
                  </div>
                )}
                {(pay === "bkash" || pay === "nagad" || pay === "rocket") && (
                  <div style={{ padding: 16, background: T.raised, borderRadius: 9, fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
                    অর্ডার confirm করার পরে আপনাকে {pay === "bkash" ? "বিকাশ" : pay === "nagad" ? "নগদ" : "রকেট"} নম্বরে পেমেন্ট করতে হবে। আমরা SMS-এ নম্বর পাঠাবো।
                  </div>
                )}
                <div style={{ display: "flex", gap: 9 }}>
                  <Btn v="ghost" onClick={() => setStep(1)}><I n="chL" s={14} /> পেছনে</Btn>
                  <Btn v="coral" full onClick={() => setStep(3)}>অর্ডার রিভিউ <I n="arrowR" s={15} /></Btn>
                </div>
              </div>
            )}

            {/* STEP 3 — নিশ্চিত */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, marginBottom: 4 }}>অর্ডার নিশ্চিত করুন</h3>
                {cart.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: 13, padding: "12px 0", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
                    <ProductImg src={item.img} alt={item.name}
                      style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 7, background: T.raised }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</p>
                      <p style={{ fontSize: 11, color: T.muted }}>পরিমাণ: {item.qty}{item.selectedSize ? ` · সাইজ: ${item.selectedSize}` : ""}</p>
                    </div>
                    <span style={{ fontWeight: 800, color: T.coral }}>{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
                <div style={{ padding: 13, background: T.raised, borderRadius: 9, fontSize: 12, color: T.muted, display: "flex", gap: 7, alignItems: "center" }}>
                  <I n="shield" s={14} c={T.coral} /> আপনার তথ্য সম্পূর্ণ সুরক্ষিত
                </div>
                <div style={{ display: "flex", gap: 9 }}>
                  <Btn v="ghost" onClick={() => setStep(2)}><I n="chL" s={14} /> পেছনে</Btn>
                  <Btn v="coral" full onClick={placeOrder} disabled={saving}>
                    <I n="shield" s={15} /> {saving ? "প্রক্রিয়াকরণ হচ্ছে…" : `অর্ডার করুন — ${fmt(tot)}`}
                  </Btn>
                </div>
              </div>
            )}
          </div>

          {/* order summary sidebar */}
          <div style={{ padding: 24, background: T.bg }}>
            <h4 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, marginBottom: 16 }}>সারসংক্ষেপ</h4>
            {cart.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 9, gap: 8 }}>
                <span style={{ color: T.muted, fontSize: 12, lineHeight: 1.4 }}>{item.name} ×{item.qty}</span>
                <span style={{ fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{fmt(item.price * item.qty)}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, marginTop: 8, display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                ["সাবটোটাল", fmt(sub)],
                ["ডেলিভারি", deliveryCost === 0 ? "বিনামূল্যে 🎉" : fmt(deliveryCost)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: T.muted }}>{k}</span>
                  <span style={{ color: v.includes("বিনামূল্যে") ? T.ok : T.champagne }}>{v}</span>
                </div>
              ))}
              {/* FIX ৭: Total delivery cost থেকে real-time update */}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 19, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                <span>মোট</span>
                <span style={{ color: T.coral }}>{fmt(tot)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function KVADShop() {
  const [rawData,    setRawData]  = useState([]);
  const [loading,    setLoading]  = useState(true);
  const [fetchError, setFetchErr] = useState(null);

  const [cart,      setCart]   = useState([]);
  const [wish,      setWish]   = useState([]);
  const [cartOpen,  setCO]     = useState(false);
  const [wishOpen,  setWO]     = useState(false); // FIX ৬
  const [chkOpen,   setCHK]    = useState(false);
  const [quickP,    setQuickP] = useState(null);

  const [cat,    setCat]   = useState("All");
  const [sort,   setSort]  = useState("featured");
  const [maxP,   setMaxP]  = useState(10000); // FIX ১০: BDT range
  const [minR,   setMinR]  = useState(0);
  const [search, setSrch]  = useState("");
  const [view,   setView]  = useState("grid");
  const [showF,  setShowF] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setFetchErr(null);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("rating",      { ascending: false });
        if (error) throw error;
        setRawData(data ?? []);
      } catch (err) {
        console.error("Supabase fetch error:", err.message);
        setFetchErr(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const allProducts = rawData.map(normalise).filter(Boolean);

  const addCart = useCallback(p => {
    setCart(prev => {
      const key = `${p.id}-${p.selectedSize ?? ""}-${p.selectedColor ?? ""}`;
      const ex  = prev.find(i => `${i.id}-${i.selectedSize ?? ""}-${i.selectedColor ?? ""}` === key);
      return ex
        ? prev.map(i => (`${i.id}-${i.selectedSize ?? ""}-${i.selectedColor ?? ""}` === key ? { ...i, qty: i.qty + (p.qty || 1) } : i))
        : [...prev, { ...p, qty: p.qty || 1 }];
    });
    setCO(true);
  }, []);

  const toggleWish = useCallback(id => {
    setWish(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  }, []);

  const products = allProducts
    .filter(p => cat === "All" || p.cat === cat)
    .filter(p => Number(p.price) <= maxP)
    .filter(p => Number(p.rating) >= minR)
    .filter(p => {
      const q = search.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || (p.cat ?? "").toLowerCase().includes(q) || (p.sub ?? "").toLowerCase().includes(q) || (p.desc ?? "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "price-asc")  return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating")     return b.rating - a.rating;
      if (sort === "newest")     return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });

  const catCounts = Object.fromEntries(
    CATS.map(c => [c, c === "All" ? allProducts.length : allProducts.filter(p => p.cat === c).length])
  );
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.champagne, fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:${T.bg}}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
        input[type=range]{-webkit-appearance:none;height:3px;background:${T.border};border-radius:2px;cursor:pointer;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${T.coral};cursor:pointer}
        select option{background:${T.raised};color:${T.champagne}}
        ::placeholder{color:${T.dim}}
        button:focus{outline:none}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      {/* FIX ১৬: Bangla announcement bar + BDT */}
      <div style={{ background: `linear-gradient(90deg, ${T.coralDim}, ${T.coral})`, color: "#000", textAlign: "center", padding: "7px 16px", fontSize: 12, fontWeight: 800, letterSpacing: "0.04em" }}>
        🚚 ৯৯৯ টাকার উপরে বিনামূল্যে ডেলিভারি &nbsp;·&nbsp; কোড <strong>KVAD20</strong> = ২০% ছাড় &nbsp;·&nbsp; ৩০ দিনের রিটার্ন
      </div>

      {/* NAVBAR */}
      <header style={{ position: "sticky", top: 0, zIndex: 600, background: "rgba(8,8,16,.94)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px", height: 66, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2, flexShrink: 0 }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 26, color: T.coral, letterSpacing: "-0.02em" }}>KVAD</span>
          </div>
          <div style={{ flex: 1, maxWidth: 520, position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <I n="search" s={15} c={T.muted} />
            </span>
            <input value={search} onChange={e => setSrch(e.target.value)}
              placeholder="পণ্য খুঁজুন…"
              style={{ width: "100%", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 13px 9px 40px", color: T.champagne, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
            {search && (
              <button onClick={() => setSrch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.muted, cursor: "pointer" }}>
                <I n="x" s={14} />
              </button>
            )}
          </div>
          <div style={{ flex: 1 }} />

          {/* FIX ৬: Wishlist onClick যোগ হয়েছে */}
          <button onClick={() => setWO(true)}
            style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: 8 }}>
            <I n="heart" s={22} c={wish.length ? T.danger : T.muted} solid={wish.length > 0} />
            {wish.length > 0 && (
              <span style={{ position: "absolute", top: 2, right: 2, background: T.danger, color: "#fff", borderRadius: "50%", width: 15, height: 15, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {wish.length}
              </span>
            )}
          </button>

          <button onClick={() => setCO(true)}
            style={{ display: "flex", alignItems: "center", gap: 9, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 18px", cursor: "pointer", color: T.champagne, transition: "all .18s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.coral}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <I n="bag" s={18} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>ব্যাগ</span>
            {cartCount > 0 && (
              <span style={{ background: T.coral, color: "#000", borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 900 }}>{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden", background: T.bg }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800&q=80" alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .13 }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(110deg, ${T.bg} 45%, transparent 100%)` }} />
        </div>
        <div style={{ position: "relative", maxWidth: 1380, margin: "0 auto", padding: "64px 28px 68px" }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(38px,6vw,74px)", lineHeight: 1.02, marginBottom: 16, color: T.champagne }}>
            সেরা মানের<br /><span style={{ color: T.coral }}>পোশাক ও পণ্য।</span>
          </h1>
          <p style={{ fontSize: 16, color: T.cream, maxWidth: 460, lineHeight: 1.7, marginBottom: 30 }}>
            ব্যাগ, শাড়ি, পাঞ্জাবি ও আরও অনেক কিছু — সবই এক জায়গায়।
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.entries(CAT_META).map(([c, { icon }]) => (
              <button key={c}
                onClick={() => { setCat(c); document.getElementById("shop-grid")?.scrollIntoView({ behavior: "smooth" }); }}
                style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${T.borderLt}`, borderRadius: 8, color: T.cream, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 7, transition: "all .18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.coral; e.currentTarget.style.color = T.coral; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderLt; e.currentTarget.style.color = T.cream; }}>
                {icon} {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORY STRIP */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px", display: "flex", overflowX: "auto" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding: "16px 22px", background: "transparent", border: "none", borderBottom: `2px solid ${cat === c ? T.coral : "transparent"}`, color: cat === c ? T.coral : T.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: cat === c ? 700 : 400, whiteSpace: "nowrap", transition: "all .2s", display: "flex", alignItems: "center", gap: 6 }}>
              {CAT_META[c]?.icon} {c}
              <span style={{ fontSize: 11, background: cat === c ? T.coralGlow : T.raised, border: `1px solid ${cat === c ? T.coral + "44" : T.border}`, color: cat === c ? T.coral : T.muted, padding: "1px 7px", borderRadius: 20 }}>
                {loading ? "…" : catCounts[c]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SHOP GRID */}
      <div id="shop-grid" style={{ maxWidth: 1380, margin: "0 auto", padding: "36px 28px 80px", display: "flex", gap: 26 }}>
        {showF && (
          <aside style={{ width: 234, flexShrink: 0 }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, position: "sticky", top: 82 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16 }}>ফিল্টার</span>
                {(cat !== "All" || minR > 0 || maxP < 10000) && (
                  <button onClick={() => { setCat("All"); setMinR(0); setMaxP(10000); }}
                    style={{ fontSize: 12, color: T.coral, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                    রিসেট
                  </button>
                )}
              </div>
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>ক্যাটাগরি</p>
                {CATS.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "8px 11px", background: cat === c ? T.coralGlow : "transparent", border: `1px solid ${cat === c ? T.coral : T.border}`, borderRadius: 8, color: cat === c ? T.coral : T.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: cat === c ? 700 : 400, marginBottom: 5, transition: "all .15s" }}>
                    <span>{CAT_META[c]?.icon} {c}</span>
                    <span style={{ fontSize: 11 }}>{loading ? "…" : catCounts[c]}</span>
                  </button>
                ))}
              </div>
              {/* FIX ১০: BDT range ৳100–৳10,000 */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  সর্বোচ্চ দাম: <span style={{ color: T.coral }}>{fmt(maxP)}</span>
                </p>
                <input type="range" min={100} max={10000} step={100} value={maxP} onChange={e => setMaxP(+e.target.value)} style={{ width: "100%" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.dim, marginTop: 4 }}>
                  <span>৳১০০</span><span>৳১০,০০০</span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>ন্যূনতম রেটিং</p>
                {[4, 3, 2, 1].map(r => (
                  <label key={r} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7, cursor: "pointer" }}>
                    <input type="radio" name="rating" checked={minR === r} onChange={() => setMinR(r)} style={{ accentColor: T.coral }} />
                    <Stars r={r} s={12} />
                    <span style={{ fontSize: 12, color: T.muted }}>ও উপরে</span>
                  </label>
                ))}
                {minR > 0 && (
                  <button onClick={() => setMinR(0)} style={{ fontSize: 11, color: T.muted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", marginTop: 2 }}>
                    বাতিল ×
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <button onClick={() => setShowF(f => !f)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 14px", color: showF ? T.coral : T.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>
              <I n="filter" s={14} c={showF ? T.coral : T.muted} /> {showF ? "ফিল্টার লুকান" : "ফিল্টার দেখুন"}
            </button>
            <span style={{ fontSize: 13, color: T.muted }}>
              {loading ? "লোড হচ্ছে…" : <><span style={{ color: T.champagne, fontWeight: 700 }}>{products.length}</span> টি পণ্য</>}
            </span>
            <div style={{ flex: 1 }} />
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 13px", color: T.champagne, fontSize: 13, cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
              <option value="featured">সাজান: ফিচার্ড</option>
              <option value="price-asc">দাম: কম → বেশি</option>
              <option value="price-desc">দাম: বেশি → কম</option>
              <option value="rating">সেরা রেটিং</option>
              <option value="newest">নতুন আগে</option>
            </select>
            <div style={{ display: "flex", background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
              {[["grid", "grid"], ["rows", "list"]].map(([ic, id]) => (
                <button key={id} onClick={() => setView(id)}
                  style={{ padding: "8px 12px", background: view === id ? T.raised : "transparent", border: "none", cursor: "pointer" }}>
                  <I n={ic} s={16} c={view === id ? T.coral : T.muted} />
                </button>
              ))}
            </div>
          </div>

          {(cat !== "All" || minR > 0 || search || maxP < 10000) && (
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
              {cat !== "All" && <span style={{ background: T.coralGlow, border: `1px solid ${T.coral}55`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: T.coral, display: "flex", alignItems: "center", gap: 5 }}>{cat} <button onClick={() => setCat("All")} style={{ background: "none", border: "none", color: T.coral, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button></span>}
              {minR > 0 && <span style={{ background: T.coralGlow, border: `1px solid ${T.coral}55`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: T.coral, display: "flex", alignItems: "center", gap: 5 }}>{minR}★+ <button onClick={() => setMinR(0)} style={{ background: "none", border: "none", color: T.coral, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button></span>}
              {maxP < 10000 && <span style={{ background: T.coralGlow, border: `1px solid ${T.coral}55`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: T.coral, display: "flex", alignItems: "center", gap: 5 }}>সর্বোচ্চ {fmt(maxP)} <button onClick={() => setMaxP(10000)} style={{ background: "none", border: "none", color: T.coral, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button></span>}
              {search && <span style={{ background: T.coralGlow, border: `1px solid ${T.coral}55`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: T.coral, display: "flex", alignItems: "center", gap: 5 }}>"{search}" <button onClick={() => setSrch("")} style={{ background: "none", border: "none", color: T.coral, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button></span>}
            </div>
          )}

          {fetchError && (
            <div style={{ padding: "24px", background: T.card, borderRadius: 12, border: `1px solid ${T.danger}33`, marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <I n="warn" s={20} c={T.danger} />
              <div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>পণ্য লোড করা যায়নি</p>
                <p style={{ fontSize: 12, color: T.muted }}>{fetchError}</p>
                <button onClick={() => window.location.reload()} style={{ marginTop: 10, fontSize: 12, color: T.coral, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                  <I n="refresh" s={13} c={T.coral} /> আবার চেষ্টা করুন
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(234px,1fr))", gap: 18 }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && !fetchError && products.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0", color: T.muted }}>
              <I n="search" s={48} c={T.dim} />
              <p style={{ marginTop: 16, fontSize: 16, marginBottom: 16 }}>কোনো পণ্য পাওয়া যায়নি</p>
              <Btn v="outline" onClick={() => { setCat("All"); setMinR(0); setMaxP(10000); setSrch(""); }}>সব ফিল্টার বাতিল করুন</Btn>
            </div>
          )}

          {!loading && !fetchError && products.length > 0 && (
            view === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(234px,1fr))", gap: 18 }}>
                {products.map(p => <Card key={p.id} p={p} onAdd={addCart} onWish={toggleWish} wish={wish} onQuick={setQuickP} />)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {products.map(p => <Row key={p.id} p={p} onAdd={addCart} onWish={toggleWish} wish={wish} onQuick={setQuickP} />)}
              </div>
            )
          )}
        </div>
      </div>

      {/* VALUE PROPS */}
      <div style={{ background: T.card, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "40px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}>
          {[
            ["truck",  "বিনামূল্যে ডেলিভারি", "৯৯৯ টাকার উপরে"],
            ["shield", "১ বছরের ওয়ারেন্টি",  "সব KVAD পণ্যে"],
            ["refresh","৩০ দিনের রিটার্ন",    "কোনো প্রশ্ন ছাড়া"],
            ["phone",  "২৪/৭ সাপোর্ট",        "যেকোনো সমস্যায়"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: T.coralGlow, border: `1px solid ${T.coral}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <I n={icon} s={19} c={T.coral} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{title}</p>
                <p style={{ fontSize: 12, color: T.muted }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: T.bg, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "32px 28px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: T.coral }}>KVAD</span>
            <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>সেরা মানের পণ্য, সেরা অভিজ্ঞতা।</p>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {["বিকাশ", "নগদ", "রকেট", "ভিসা", "মাস্টারকার্ড"].map(pm => (
              <span key={pm} style={{ padding: "4px 10px", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 11, color: T.muted, fontWeight: 700 }}>{pm}</span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: T.dim }}>© ২০২৫ KVAD। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>

      {/* OVERLAYS */}
      {cartOpen && (
        <CartDrawer cart={cart} setCart={setCart} onClose={() => setCO(false)} onCheckout={() => { setCO(false); setCHK(true); }} />
      )}
      {/* FIX ৬ + ১১: WishlistDrawer */}
      {wishOpen && (
        <WishlistDrawer wish={wish} allProducts={allProducts} onClose={() => setWO(false)} onAddToCart={addCart} onRemoveWish={toggleWish} />
      )}
      {chkOpen && (
        <Checkout cart={cart} setCart={setCart} onClose={() => setCHK(false)} />
      )}
      {quickP && (
        <QuickView p={quickP} onClose={() => setQuickP(null)} onAdd={addCart} wish={wish} onWish={toggleWish} />
      )}
    </div>
  );
}
