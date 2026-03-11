export { default } from "./shop/page";


// "use client";
// import { useState, useEffect, useCallback } from "react";
// import { supabase } from "@/lib/supabase";

// /* ═══════════════════════════════════════════════════════
//    KVAD  ·  Multi-Category Luxury Shop
//    Supabase-connected  ·  field names matched to schema
// ═══════════════════════════════════════════════════════ */

// const T = {
//   bg:        "#080810",
//   card:      "#0E0E18",
//   raised:    "#141422",
//   border:    "#1E1E30",
//   borderLt:  "#2A2A40",
//   coral:     "#FF6B4A",
//   coralDim:  "#D4562E",
//   coralGlow: "rgba(255,107,74,0.14)",
//   champagne: "#F2E8D9",
//   cream:     "#C8BCA8",
//   muted:     "#6E6E88",
//   dim:       "#363650",
//   danger:    "#FF4466",
//   ok:        "#3DEBA0",
//   sky:       "#4DC4FF",
//   gold:      "#F5C842",
// };

// /* ─────────────────────────────────────────────────────
//    FIELD NORMALISER
//    Supabase schema → UI-friendly shape
//    Supabase columns:
//      category_name  →  cat
//      sub_category   →  sub
//      original_price →  was
//      review_count   →  reviews
//      images[0]      →  img
//      images         →  gallery
//      description    →  desc
//      specs (jsonb)  →  specs
//      colors / sizes (text[]) kept as-is
// ────────────────────────────────────────────────────── */
// function normalise(row) {
//   if (!row) return null;
//   return {
//     ...row,
//     cat:     row.category_name  ?? row.cat     ?? "",
//     sub:     row.sub_category   ?? row.sub     ?? "",
//     was:     row.original_price ?? row.was     ?? row.price,
//     reviews: row.review_count   ?? row.reviews ?? 0,
//     img:     Array.isArray(row.images) ? (row.images[0] ?? "") : (row.img ?? ""),
//     gallery: Array.isArray(row.images) && row.images.length > 0
//                ? row.images
//                : (row.gallery ?? [row.img ?? ""]),
//     desc:    row.description    ?? row.desc    ?? "",
//     colors:  row.colors         ?? [],
//     sizes:   row.sizes          ?? [],
//     specs:   row.specs          ?? {},
//     badge:   row.badge          ?? null,
//     stock:   row.stock          ?? 0,
//   };
// }

// /* ─── constants ─── */
// const CATS     = ["All", "Electronics", "Clothing", "Beauty", "Home"];
// const CAT_META = {
//   Electronics: { icon: "⚡", desc: "Precision-engineered tech" },
//   Clothing:    { icon: "🧥", desc: "Considered wardrobe essentials" },
//   Beauty:      { icon: "✨", desc: "Clinically crafted formulas" },
//   Home:        { icon: "🏠", desc: "Objects worth living with" },
// };
// const COUPONS = { KVAD20: 20, WELCOME10: 10, SAVE15: 15 };
// const fmt  = n  => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
// const pct  = (p, w) => w ? Math.round((1 - p / w) * 100) : 0;

// /* ─── ICONS ─── */
// const I = ({ n, s = 18, c = "currentColor", solid = false }) => {
//   const paths = {
//     cart:    <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>,
//     heart:   <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={solid ? c : "none"}/>,
//     search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
//     x:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
//     star:    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={solid ? c : "none"}/>,
//     plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
//     minus:   <line x1="5" y1="12" x2="19" y2="12"/>,
//     trash:   <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
//     check:   <polyline points="20 6 9 17 4 12" strokeWidth="2.5"/>,
//     chR:     <polyline points="9 18 15 12 9 6"/>,
//     chL:     <polyline points="15 18 9 12 15 6"/>,
//     filter:  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
//     grid:    <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
//     rows:    <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
//     eye:     <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
//     truck:   <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
//     shield:  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
//     refresh: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></>,
//     arrowR:  <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
//     bag:     <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>,
//     zap:     <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={solid ? c : "none"}/>,
//     warn:    <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
//   };
//   return (
//     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
//       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       {paths[n]}
//     </svg>
//   );
// };

// const Stars = ({ r, s = 13 }) => (
//   <span style={{ display: "inline-flex", gap: 1.5 }}>
//     {[1,2,3,4,5].map(i => (
//       <I key={i} n="star" s={s} c={i <= Math.round(r) ? T.gold : T.dim} solid={i <= Math.round(r)} />
//     ))}
//   </span>
// );

// /* ─── SKELETON CARD (loading placeholder) ─── */
// const SkeletonCard = () => (
//   <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
//     <div style={{ paddingTop: "75%", background: T.raised, position: "relative" }}>
//       <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${T.raised} 25%, ${T.border} 50%, ${T.raised} 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
//     </div>
//     <div style={{ padding: "14px 16px 18px" }}>
//       {[80, 100, 60].map((w, i) => (
//         <div key={i} style={{ height: i === 1 ? 16 : 10, width: `${w}%`, background: T.raised, borderRadius: 4, marginBottom: 10 }} />
//       ))}
//     </div>
//   </div>
// );

// /* ─── BADGE ─── */
// const Badge = ({ text, type = "coral" }) => {
//   const bg = { coral: T.coral, danger: T.danger, sky: T.sky, gold: T.gold, ok: T.ok }[type] ?? T.coral;
//   return (
//     <span style={{ background: bg, color: "#000", fontSize: 9, fontWeight: 900, padding: "2px 7px", borderRadius: 3, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
//       {text}
//     </span>
//   );
// };

// /* ─── BUTTON ─── */
// const Btn = ({ children, onClick, v = "coral", sz = "md", disabled, full, xs }) => {
//   const [h, setH] = useState(false);
//   const pad = { sm: "6px 13px", md: "10px 22px", lg: "13px 30px" }[sz];
//   const fs  = { sm: 12, md: 14, lg: 15 }[sz];
//   const variants = {
//     coral:   { bg: h ? T.coralDim : T.coral,  color: "#000" },
//     ghost:   { bg: h ? T.raised : "transparent", color: T.muted, border: `1px solid ${T.border}` },
//     outline: { bg: h ? T.coralGlow : "transparent", color: T.coral, border: `1px solid ${T.coral}` },
//     dark:    { bg: h ? T.raised : T.card, color: T.champagne, border: `1px solid ${T.border}` },
//   };
//   const s = variants[v] ?? variants.coral;
//   return (
//     <button onClick={onClick} disabled={disabled}
//       onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
//       style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "inherit", fontWeight: 700, fontSize: fs, padding: pad, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, width: full ? "100%" : "auto", border: "none", transition: "all .18s", letterSpacing: "0.02em", background: s.bg, color: s.color, ...(s.border ? { border: s.border } : {}), ...xs }}>
//       {children}
//     </button>
//   );
// };

// /* ══════════════════════════════════════════════════════
//    CART DRAWER
// ══════════════════════════════════════════════════════ */
// const CartDrawer = ({ cart, setCart, onClose, onCheckout }) => {
//   const [code,  setCode]  = useState("");
//   const [discAmt, setDiscAmt] = useState(0);
//   const [msg,   setMsg]   = useState("");

//   const sub  = cart.reduce((s, i) => s + i.price * i.qty, 0);
//   const ship = sub >= 99 ? 0 : 12;
//   const tax  = (sub - discAmt) * 0.08;
//   const tot  = sub - discAmt + ship + tax;

//   const apply = () => {
//     const p = COUPONS[code.trim().toUpperCase()];
//     if (p) { setDiscAmt(sub * (p / 100)); setMsg(`✓ ${p}% off applied!`); }
//     else   { setDiscAmt(0); setMsg("Invalid code — try KVAD20"); }
//   };

//   // reset discount when cart changes
//   useEffect(() => { setDiscAmt(0); setMsg(""); }, [cart.length]);

//   return (
//     <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex" }}>
//       <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,.72)", backdropFilter: "blur(6px)" }} />
//       <div style={{ width: 410, background: T.card, borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column", maxHeight: "100vh" }}>

//         {/* header */}
//         <div style={{ padding: "22px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
//           <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 20 }}>
//             Your Bag&nbsp;
//             <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 400, color: T.muted }}>
//               ({cart.reduce((s, i) => s + i.qty, 0)} items)
//             </span>
//           </h2>
//           <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}>
//             <I n="x" />
//           </button>
//         </div>

//         {/* items */}
//         <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
//           {cart.length === 0 ? (
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 14, color: T.muted, paddingTop: 80 }}>
//               <I n="bag" s={48} c={T.dim} />
//               <p style={{ fontSize: 15 }}>Your bag is empty</p>
//             </div>
//           ) : cart.map(item => (
//             <div key={`${item.id}-${item.selectedSize ?? ""}-${item.selectedColor ?? ""}`}
//               style={{ display: "flex", gap: 12, padding: 12, background: T.raised, borderRadius: 10, border: `1px solid ${T.border}` }}>
//               <img src={item.img} alt={item.name}
//                 style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 7, flexShrink: 0 }} />
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <p style={{ fontSize: 11, color: T.muted, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.cat}</p>
//                 <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, lineHeight: 1.3 }}>{item.name}</p>
//                 {item.selectedSize  && <p style={{ fontSize: 11, color: T.muted }}>Size: {item.selectedSize}</p>}
//                 {item.selectedColor && <p style={{ fontSize: 11, color: T.muted }}>Color: {item.selectedColor}</p>}
//                 <p style={{ color: T.coral, fontWeight: 800, fontSize: 14, marginBottom: 8, marginTop: 3 }}>{fmt(item.price)}</p>
//                 <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//                   {[["minus", () => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))],
//                     ["plus",  () => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))]
//                   ].map(([ic, fn], idx) => (
//                     <button key={idx} onClick={fn}
//                       style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 5, width: 26, height: 26, color: T.champagne, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                       <I n={ic} s={13} c={T.champagne} />
//                     </button>
//                   ))}
//                   <span style={{ fontWeight: 800, minWidth: 22, textAlign: "center", fontSize: 14 }}>{item.qty}</span>
//                   <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))}
//                     style={{ marginLeft: "auto", background: "none", border: "none", color: T.danger, cursor: "pointer" }}>
//                     <I n="trash" s={15} c={T.danger} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* footer */}
//         {cart.length > 0 && (
//           <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
//             <div style={{ display: "flex", gap: 7, marginBottom: 6 }}>
//               <input value={code} onChange={e => setCode(e.target.value)}
//                 onKeyDown={e => e.key === "Enter" && apply()}
//                 placeholder="Coupon code…"
//                 style={{ flex: 1, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 7, padding: "8px 12px", color: T.champagne, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
//               <Btn onClick={apply} sz="sm" v="outline">Apply</Btn>
//             </div>
//             {msg && <p style={{ fontSize: 12, color: msg[0] === "✓" ? T.ok : T.danger, marginBottom: 10 }}>{msg}</p>}

//             <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, marginBottom: 16 }}>
//               {[["Subtotal", fmt(sub)], ["Discount", discAmt ? `-${fmt(discAmt)}` : "—"], ["Shipping", ship === 0 ? "FREE" : fmt(ship)], ["Tax (8%)", fmt(tax)]].map(([k, v]) => (
//                 <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
//                   <span style={{ color: T.muted }}>{k}</span>
//                   <span style={{ color: k === "Discount" && discAmt ? T.ok : T.champagne, fontWeight: k === "Discount" && discAmt ? 700 : 400 }}>{v}</span>
//                 </div>
//               ))}
//               <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
//                 <span>Total</span>
//                 <span style={{ color: T.coral }}>{fmt(tot)}</span>
//               </div>
//             </div>
//             <Btn v="coral" full onClick={onCheckout}>Checkout &nbsp;<I n="arrowR" s={16} /></Btn>
//             {sub < 99 && (
//               <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 8 }}>
//                 Add {fmt(99 - sub)} more for free shipping
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════
//    QUICK-VIEW MODAL
// ══════════════════════════════════════════════════════ */
// const QuickView = ({ p, onClose, onAdd, wish, onWish }) => {
//   const [imgIdx, setImgIdx] = useState(0);
//   const [color,  setColor]  = useState(0);
//   const [size,   setSize]   = useState(
//     Array.isArray(p.sizes) && p.sizes.length >= 3 ? p.sizes[2] : (p.sizes?.[0] ?? "")
//   );
//   const [qty, setQty] = useState(1);
//   const inWish = wish.includes(p.id);
//   const d = pct(p.price, p.was);
//   const gallery = Array.isArray(p.gallery) && p.gallery.length ? p.gallery : [p.img];

//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => { document.body.style.overflow = ""; };
//   }, []);

//   const handleAdd = () => {
//     onAdd({ ...p, qty, selectedColor: p.colors?.[color], selectedSize: size || undefined });
//     onClose();
//   };

//   return (
//     <div style={{ position: "fixed", inset: 0, zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
//       <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(10px)" }} />
//       <div style={{ position: "relative", width: "100%", maxWidth: 900, background: T.card, borderRadius: 20, border: `1px solid ${T.border}`, overflow: "hidden", maxHeight: "92vh", overflowY: "auto" }}>
//         <button onClick={onClose}
//           style={{ position: "absolute", top: 14, right: 14, zIndex: 2, background: T.raised, border: `1px solid ${T.border}`, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.muted }}>
//           <I n="x" s={17} />
//         </button>

//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
//           {/* images */}
//           <div style={{ background: T.bg }}>
//             <div style={{ position: "relative", paddingTop: "100%", overflow: "hidden" }}>
//               <img src={gallery[imgIdx]} alt={p.name}
//                 style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "opacity .3s" }} />
//               <div style={{ position: "absolute", top: 14, left: 14, display: "flex", flexDirection: "column", gap: 5 }}>
//                 {p.badge && <Badge text={p.badge} />}
//                 {d > 0 && <Badge text={`-${d}%`} type="danger" />}
//               </div>
//             </div>
//             {gallery.length > 1 && (
//               <div style={{ display: "flex", gap: 7, padding: 12 }}>
//                 {gallery.map((src, i) => (
//                   <button key={i} onClick={() => setImgIdx(i)}
//                     style={{ width: 58, height: 46, borderRadius: 6, overflow: "hidden", border: `2px solid ${i === imgIdx ? T.coral : T.border}`, cursor: "pointer", padding: 0, flexShrink: 0 }}>
//                     <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* info */}
//           <div style={{ padding: 30, display: "flex", flexDirection: "column", gap: 14 }}>
//             <div>
//               <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
//                 {p.cat}{p.sub ? ` / ${p.sub}` : ""}
//               </p>
//               <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 24, lineHeight: 1.15, color: T.champagne, marginBottom: 10 }}>{p.name}</h2>
//               <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                 <Stars r={p.rating} />
//                 <span style={{ fontSize: 12, color: T.muted }}>
//                   {Number(p.rating).toFixed(1)} &middot; {Number(p.reviews).toLocaleString()} reviews
//                 </span>
//               </div>
//             </div>

//             <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
//               <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: T.coral }}>{fmt(p.price)}</span>
//               {p.was > p.price && (
//                 <>
//                   <span style={{ fontSize: 15, color: T.dim, textDecoration: "line-through" }}>{fmt(p.was)}</span>
//                   <span style={{ fontSize: 12, color: T.ok }}>Save {fmt(p.was - p.price)}</span>
//                 </>
//               )}
//             </div>

//             {p.desc && <p style={{ fontSize: 13, color: T.cream, lineHeight: 1.75 }}>{p.desc}</p>}

//             {/* colours */}
//             {Array.isArray(p.colors) && p.colors.length > 0 && (
//               <div>
//                 <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Colour</p>
//                 <div style={{ display: "flex", gap: 8 }}>
//                   {p.colors.map((col, i) => (
//                     <button key={i} onClick={() => setColor(i)}
//                       style={{ width: 26, height: 26, borderRadius: "50%", background: col, border: `3px solid ${i === color ? T.coral : T.border}`, cursor: "pointer", outline: "none" }} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* sizes */}
//             {Array.isArray(p.sizes) && p.sizes.length > 0 && (
//               <div>
//                 <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Size</p>
//                 <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
//                   {p.sizes.map(sz => (
//                     <button key={sz} onClick={() => setSize(sz)}
//                       style={{ padding: "6px 12px", background: size === sz ? T.coral : T.raised, border: `1px solid ${size === sz ? T.coral : T.border}`, borderRadius: 6, color: size === sz ? "#000" : T.cream, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: size === sz ? 800 : 400, transition: "all .15s" }}>
//                       {sz}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* qty */}
//             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//               <div style={{ display: "flex", border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
//                 <button onClick={() => setQty(q => Math.max(1, q - 1))}
//                   style={{ background: T.raised, border: "none", padding: "9px 14px", color: T.champagne, cursor: "pointer" }}>
//                   <I n="minus" s={14} />
//                 </button>
//                 <span style={{ padding: "9px 20px", fontWeight: 800, fontSize: 15 }}>{qty}</span>
//                 <button onClick={() => setQty(q => Math.min(p.stock, q + 1))}
//                   style={{ background: T.raised, border: "none", padding: "9px 14px", color: T.champagne, cursor: "pointer" }}>
//                   <I n="plus" s={14} />
//                 </button>
//               </div>
//               <span style={{ fontSize: 12, color: p.stock < 10 ? T.gold : T.ok }}>
//                 {p.stock < 10 ? `⚠ Only ${p.stock} left` : "✓ In stock"}
//               </span>
//             </div>

//             {/* specs */}
//             {p.specs && Object.keys(p.specs).length > 0 && (
//               <div style={{ background: T.raised, borderRadius: 10, padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
//                 {Object.entries(p.specs).slice(0, 4).map(([k, v]) => (
//                   <div key={k} style={{ fontSize: 11 }}>
//                     <span style={{ color: T.muted }}>{k}: </span>
//                     <span style={{ color: T.cream, fontWeight: 600 }}>{v}</span>
//                   </div>
//                 ))}
//               </div>
//             )}

//             <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
//               <Btn v="coral" full onClick={handleAdd} disabled={p.stock === 0}>
//                 <I n="cart" s={15} /> {p.stock === 0 ? "Out of Stock" : "Add to Bag"}
//               </Btn>
//               <button onClick={() => onWish(p.id)}
//                 style={{ padding: "10px 15px", background: T.raised, border: `1px solid ${inWish ? T.danger : T.border}`, borderRadius: 8, cursor: "pointer", flexShrink: 0 }}>
//                 <I n="heart" s={17} c={inWish ? T.danger : T.muted} solid={inWish} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════
//    PRODUCT CARD  (grid view)
// ══════════════════════════════════════════════════════ */
// const Card = ({ p, onAdd, onWish, wish, onQuick }) => {
//   const [hov, setH] = useState(false);
//   const inWish = wish.includes(p.id);
//   const d = pct(p.price, p.was);

//   return (
//     <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
//       style={{ background: T.card, border: `1px solid ${hov ? T.borderLt : T.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", transition: "all .22s", transform: hov ? "translateY(-5px)" : "none", boxShadow: hov ? "0 20px 60px rgba(0,0,0,.6)" : "none" }}>

//       <div style={{ position: "relative", paddingTop: "75%", overflow: "hidden", background: T.bg }}>
//         {p.img ? (
//           <img src={p.img} alt={p.name}
//             style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform .45s", transform: hov ? "scale(1.07)" : "scale(1)" }} />
//         ) : (
//           <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: T.dim, fontSize: 32 }}>
//             {CAT_META[p.cat]?.icon ?? "📦"}
//           </div>
//         )}
//         <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 4 }}>
//           {p.badge && <Badge text={p.badge} />}
//           {d > 0  && <Badge text={`-${d}%`} type="danger" />}
//         </div>
//         <button onClick={() => onWish(p.id)}
//           style={{ position: "absolute", top: 10, right: 10, background: "rgba(8,8,16,.75)", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
//           <I n="heart" s={15} c={inWish ? T.danger : T.champagne} solid={inWish} />
//         </button>
//         {hov && (
//           <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", gap: 7 }}>
//             <button onClick={() => onQuick(p)}
//               style={{ flex: 1, background: "rgba(8,8,16,.88)", border: `1px solid ${T.border}`, borderRadius: 7, padding: "8px", color: T.champagne, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
//               <I n="eye" s={13} /> Quick View
//             </button>
//             <Btn sz="sm" onClick={() => onAdd({ ...p, qty: 1 })} disabled={p.stock === 0}
//               xs={{ flex: 1 }}>
//               <I n="cart" s={13} /> {p.stock === 0 ? "Sold Out" : "Add"}
//             </Btn>
//           </div>
//         )}
//       </div>

//       <div style={{ padding: "14px 16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
//           <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
//             {p.cat}{p.sub ? ` · ${p.sub}` : ""}
//           </p>
//           {p.stock > 0 && p.stock < 10 && (
//             <span style={{ fontSize: 10, color: T.gold, fontWeight: 700, flexShrink: 0 }}>{p.stock} left</span>
//           )}
//           {p.stock === 0 && (
//             <span style={{ fontSize: 10, color: T.danger, fontWeight: 700, flexShrink: 0 }}>Sold out</span>
//           )}
//         </div>
//         <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 15, lineHeight: 1.3, marginBottom: 8, color: T.champagne, flex: 1 }}>{p.name}</h3>
//         <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
//           <Stars r={p.rating} s={12} />
//           <span style={{ fontSize: 11, color: T.muted }}>({Number(p.reviews).toLocaleString()})</span>
//         </div>
//         <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
//           <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: T.coral }}>{fmt(p.price)}</span>
//           {p.was > p.price && <span style={{ fontSize: 12, color: T.dim, textDecoration: "line-through" }}>{fmt(p.was)}</span>}
//         </div>
//         {Array.isArray(p.sizes) && p.sizes.length > 0 && (
//           <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
//             {p.sizes.slice(0, 4).map(sz => (
//               <span key={sz} style={{ fontSize: 10, padding: "2px 7px", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 4, color: T.muted }}>{sz}</span>
//             ))}
//             {p.sizes.length > 4 && <span style={{ fontSize: 10, color: T.muted }}>+{p.sizes.length - 4}</span>}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// /* ── ROW VIEW ── */
// const Row = ({ p, onAdd, onWish, wish, onQuick }) => {
//   const inWish = wish.includes(p.id);
//   const d = pct(p.price, p.was);
//   return (
//     <div style={{ display: "flex", gap: 18, padding: 18, background: T.card, border: `1px solid ${T.border}`, borderRadius: 13, alignItems: "center" }}>
//       <img src={p.img} alt={p.name}
//         style={{ width: 120, height: 96, objectFit: "cover", borderRadius: 9, flexShrink: 0, background: T.raised }} />
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <div style={{ display: "flex", gap: 5, marginBottom: 5 }}>
//           <Badge text={p.cat} />
//           {p.badge && <Badge text={p.badge} />}
//           {d > 0 && <Badge text={`-${d}%`} type="danger" />}
//         </div>
//         <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 16, marginBottom: 5, color: T.champagne }}>{p.name}</h3>
//         <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginBottom: 6 }}>
//           {(p.desc ?? "").slice(0, 110)}{p.desc?.length > 110 ? "…" : ""}
//         </p>
//         <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//           <Stars r={p.rating} s={12} />
//           <span style={{ fontSize: 11, color: T.muted }}>({Number(p.reviews).toLocaleString()})</span>
//         </div>
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
//         <div style={{ textAlign: "right" }}>
//           <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: T.coral }}>{fmt(p.price)}</p>
//           {p.was > p.price && <p style={{ fontSize: 12, color: T.dim, textDecoration: "line-through" }}>{fmt(p.was)}</p>}
//         </div>
//         <div style={{ display: "flex", gap: 7 }}>
//           <button onClick={() => onQuick(p)}
//             style={{ padding: "8px 12px", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 7, color: T.muted, cursor: "pointer" }}>
//             <I n="eye" s={15} />
//           </button>
//           <button onClick={() => onWish(p.id)}
//             style={{ padding: "8px 12px", background: T.raised, border: `1px solid ${inWish ? T.danger : T.border}`, borderRadius: 7, cursor: "pointer" }}>
//             <I n="heart" s={15} c={inWish ? T.danger : T.muted} solid={inWish} />
//           </button>
//           <Btn sz="sm" onClick={() => onAdd({ ...p, qty: 1 })} disabled={p.stock === 0}>
//             <I n="cart" s={14} /> {p.stock === 0 ? "Sold Out" : "Add"}
//           </Btn>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════
//    CHECKOUT MODAL
// ══════════════════════════════════════════════════════ */
// const Checkout = ({ cart, setCart, onClose }) => {
//   const [step, setStep]   = useState(1);
//   const [pay,  setPay]    = useState("card");
//   const [form, setForm]   = useState({ name: "", email: "", addr: "", city: "", zip: "", card: "", exp: "", cvv: "" });
//   const [done, setDone]   = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [errors, setErrors] = useState({});

//   // FIX: orderId is stable — generated once, not on every render
//   const [orderId] = useState(() => "KVD-" + String(Date.now()).slice(-5));

//   const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
//   const tax = sub * 0.08;
//   const tot = sub + tax;

//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => { document.body.style.overflow = ""; };
//   }, []);

//   const validate1 = () => {
//     const e = {};
//     if (!form.name.trim())  e.name  = "Required";
//     if (!form.email.trim()) e.email = "Required";
//     if (!form.addr.trim())  e.addr  = "Required";
//     if (!form.city.trim())  e.city  = "Required";
//     if (!form.zip.trim())   e.zip   = "Required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const placeOrder = async () => {
//     setSaving(true);
//     try {
//       // Save order to Supabase
//       const { data: order, error: orderErr } = await supabase
//         .from("orders")
//         .insert({
//           payment_method:   pay,
//           shipping_name:    form.name,
//           shipping_line1:   form.addr,
//           shipping_city:    form.city,
//           shipping_zip:     form.zip,
//           shipping_country: "US",
//           subtotal:  sub,
//           discount:  0,
//           shipping_cost: sub >= 99 ? 0 : 12,
//           tax,
//           total: tot,
//         })
//         .select()
//         .single();

//       if (orderErr) throw orderErr;

//       // Save order items
//       const items = cart.map(i => ({
//         order_id:      order.id,
//         product_id:    i.id,
//         product_name:  i.name,
//         product_image: i.img,
//         selected_size:  i.selectedSize  ?? null,
//         selected_color: i.selectedColor ?? null,
//         unit_price: i.price,
//         quantity:   i.qty,
//       }));
//       const { error: itemErr } = await supabase.from("order_items").insert(items);
//       if (itemErr) throw itemErr;

//       setDone(true);
//     } catch (err) {
//       console.error("Order error:", err.message);
//       // still show confirmation in demo mode
//       setDone(true);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const field = (label, key, ph, type = "text") => (
//     <div>
//       <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
//       <input type={type} value={form[key]} onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: "" })); }}
//         placeholder={ph}
//         style={{ width: "100%", background: T.raised, border: `1px solid ${errors[key] ? T.danger : T.border}`, borderRadius: 8, padding: "10px 13px", color: T.champagne, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
//       {errors[key] && <p style={{ fontSize: 11, color: T.danger, marginTop: 3 }}>{errors[key]}</p>}
//     </div>
//   );

//   /* confirmation screen */
//   if (done) return (
//     <div style={{ position: "fixed", inset: 0, zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
//       <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(10px)" }} />
//       <div style={{ position: "relative", background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: 52, textAlign: "center", maxWidth: 460, width: "100%" }}>
//         <div style={{ width: 72, height: 72, borderRadius: "50%", background: T.ok + "22", border: `2px solid ${T.ok}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
//           <I n="check" s={32} c={T.ok} />
//         </div>
//         <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, marginBottom: 8, color: T.champagne }}>Order Confirmed!</h2>
//         <p style={{ color: T.muted, marginBottom: 22, lineHeight: 1.6 }}>
//           Thank you, {form.name || "valued customer"}. Your order has been placed and a confirmation email is on its way.
//         </p>
//         <div style={{ background: T.raised, borderRadius: 12, padding: 18, marginBottom: 26 }}>
//           <p style={{ fontSize: 11, color: T.muted, marginBottom: 3 }}>ORDER ID</p>
//           <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: T.coral }}>{orderId}</p>
//           <p style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>Estimated delivery: 2–4 business days</p>
//         </div>
//         <Btn v="coral" full onClick={() => { setCart([]); onClose(); }}>Continue Shopping</Btn>
//       </div>
//     </div>
//   );

//   return (
//     <div style={{ position: "fixed", inset: 0, zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
//       <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(8px)" }} />
//       <div style={{ position: "relative", background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, width: "100%", maxWidth: 820, maxHeight: "92vh", overflowY: "auto" }}>

//         {/* sticky header */}
//         <div style={{ padding: "22px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: T.card, zIndex: 1 }}>
//           <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 20 }}>Checkout</h2>
//           <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
//             {["Shipping", "Payment", "Review"].map((s, i) => (
//               <div key={s} style={{ display: "flex", alignItems: "center" }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: step === i + 1 ? T.coralGlow : "transparent", border: `1px solid ${step === i + 1 ? T.coral : step > i + 1 ? T.ok : "transparent"}` }}>
//                   <div style={{ width: 20, height: 20, borderRadius: "50%", background: step > i + 1 ? T.ok : step === i + 1 ? T.coral : T.dim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#000" }}>
//                     {step > i + 1 ? <I n="check" s={11} c="#000" /> : i + 1}
//                   </div>
//                   <span style={{ fontSize: 12, fontWeight: 700, color: step === i + 1 ? T.coral : step > i + 1 ? T.ok : T.muted }}>{s}</span>
//                 </div>
//                 {i < 2 && <div style={{ width: 18, height: 1, background: step > i + 1 ? T.ok : T.border }} />}
//               </div>
//             ))}
//           </div>
//           <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}>
//             <I n="x" />
//           </button>
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "1fr 300px" }}>
//           <div style={{ padding: 28, borderRight: `1px solid ${T.border}` }}>

//             {/* STEP 1 — Shipping */}
//             {step === 1 && (
//               <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//                 <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, marginBottom: 4 }}>Shipping Information</h3>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
//                   <div style={{ gridColumn: "1/-1" }}>{field("Full Name", "name", "Jane Smith")}</div>
//                   <div style={{ gridColumn: "1/-1" }}>{field("Email", "email", "jane@example.com", "email")}</div>
//                   <div style={{ gridColumn: "1/-1" }}>{field("Address", "addr", "123 Oak Street, Apt 4B")}</div>
//                   {field("City", "city", "New York")}
//                   {field("ZIP Code", "zip", "10001")}
//                 </div>
//                 <div style={{ marginTop: 6 }}>
//                   <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Delivery Method</p>
//                   {[["Standard (2–4 days)", "FREE"], ["Express (1–2 days)", "$14.99"], ["Overnight", "$29.99"]].map(([l, pr]) => (
//                     <label key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 15px", background: T.raised, borderRadius: 9, marginBottom: 7, cursor: "pointer" }}>
//                       <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
//                         <input type="radio" name="ship" defaultChecked={pr === "FREE"} style={{ accentColor: T.coral }} />
//                         <span style={{ fontSize: 13 }}>{l}</span>
//                       </div>
//                       <span style={{ fontWeight: 700, color: pr === "FREE" ? T.ok : T.champagne, fontSize: 13 }}>{pr}</span>
//                     </label>
//                   ))}
//                 </div>
//                 <Btn v="coral" full onClick={() => { if (validate1()) setStep(2); }}>
//                   Continue to Payment <I n="arrowR" s={15} />
//                 </Btn>
//               </div>
//             )}

//             {/* STEP 2 — Payment */}
//             {step === 2 && (
//               <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//                 <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, marginBottom: 4 }}>Payment Method</h3>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
//                   {[["card", "💳 Credit / Debit"], ["cod", "📦 Cash on Delivery"], ["wallet", "💰 Digital Wallet"], ["crypto", "₿ Crypto"]].map(([id, label]) => (
//                     <button key={id} onClick={() => setPay(id)}
//                       style={{ padding: "14px", background: pay === id ? T.coralGlow : T.raised, border: `2px solid ${pay === id ? T.coral : T.border}`, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", color: T.champagne, fontWeight: 700, fontSize: 13, transition: "all .15s" }}>
//                       {label}
//                     </button>
//                   ))}
//                 </div>
//                 {pay === "card" && (
//                   <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
//                     {field("Card Number", "card", "4242 4242 4242 4242")}
//                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
//                       {field("Expiry", "exp", "MM / YY")}
//                       {field("CVV", "cvv", "•••")}
//                     </div>
//                   </div>
//                 )}
//                 {pay !== "card" && (
//                   <div style={{ padding: 18, background: T.raised, borderRadius: 9, textAlign: "center", color: T.muted, fontSize: 13 }}>
//                     You'll be redirected to complete payment after review.
//                   </div>
//                 )}
//                 <div style={{ display: "flex", gap: 9 }}>
//                   <Btn v="ghost" onClick={() => setStep(1)}><I n="chL" s={14} /> Back</Btn>
//                   <Btn v="coral" full onClick={() => setStep(3)}>Review Order <I n="arrowR" s={15} /></Btn>
//                 </div>
//               </div>
//             )}

//             {/* STEP 3 — Review */}
//             {step === 3 && (
//               <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//                 <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, marginBottom: 4 }}>Review &amp; Confirm</h3>
//                 {cart.map(item => (
//                   <div key={item.id} style={{ display: "flex", gap: 13, padding: "12px 0", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
//                     <img src={item.img} alt={item.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 7, background: T.raised }} />
//                     <div style={{ flex: 1 }}>
//                       <p style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</p>
//                       <p style={{ fontSize: 11, color: T.muted }}>
//                         Qty {item.qty}{item.selectedSize ? ` · Size ${item.selectedSize}` : ""}
//                       </p>
//                     </div>
//                     <span style={{ fontWeight: 800, color: T.coral }}>{fmt(item.price * item.qty)}</span>
//                   </div>
//                 ))}
//                 <div style={{ padding: 13, background: T.raised, borderRadius: 9, fontSize: 12, color: T.muted, display: "flex", gap: 7, alignItems: "center" }}>
//                   <I n="shield" s={14} c={T.coral} /> Secured with 256-bit SSL encryption
//                 </div>
//                 <div style={{ display: "flex", gap: 9 }}>
//                   <Btn v="ghost" onClick={() => setStep(2)}><I n="chL" s={14} /> Back</Btn>
//                   <Btn v="coral" full onClick={placeOrder} disabled={saving}>
//                     <I n="shield" s={15} /> {saving ? "Placing Order…" : `Place Order — ${fmt(tot)}`}
//                   </Btn>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* order summary sidebar */}
//           <div style={{ padding: 24, background: T.bg }}>
//             <h4 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, marginBottom: 16 }}>Summary</h4>
//             {cart.map(item => (
//               <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 9, gap: 8 }}>
//                 <span style={{ color: T.muted, fontSize: 12, lineHeight: 1.4 }}>{item.name} ×{item.qty}</span>
//                 <span style={{ fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{fmt(item.price * item.qty)}</span>
//               </div>
//             ))}
//             <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, marginTop: 8, display: "flex", flexDirection: "column", gap: 7 }}>
//               {[["Subtotal", fmt(sub)], ["Shipping", sub >= 99 ? "FREE" : "$12"], ["Tax (8%)", fmt(tax)]].map(([k, v]) => (
//                 <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
//                   <span style={{ color: T.muted }}>{k}</span><span>{v}</span>
//                 </div>
//               ))}
//               <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 19, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
//                 <span>Total</span>
//                 <span style={{ color: T.coral }}>{fmt(tot)}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════
//    MAIN PAGE
// ══════════════════════════════════════════════════════ */
// export default function KVADShop() {
//   const [rawData,    setRawData]  = useState([]);
//   const [loading,    setLoading]  = useState(true);
//   const [fetchError, setFetchErr] = useState(null);

//   const [cart,     setCart]    = useState([]);
//   const [wish,     setWish]    = useState([]);
//   const [cartOpen, setCO]      = useState(false);
//   const [chkOpen,  setCHK]     = useState(false);
//   const [quickP,   setQuickP]  = useState(null);

//   // filters
//   const [cat,   setCat]   = useState("All");
//   const [sort,  setSort]  = useState("featured");
//   const [maxP,  setMaxP]  = useState(2500);
//   const [minR,  setMinR]  = useState(0);
//   const [search, setSrch] = useState("");
//   const [view,  setView]  = useState("grid");
//   const [showF, setShowF] = useState(true);

//   /* ── FETCH from Supabase (products_full view = category_name included) ── */
//   useEffect(() => {
//     async function load() {
//       try {
//         setLoading(true);
//         setFetchErr(null);
//         const { data, error } = await supabase
//           .from("products")   // uses the view — has category_name, discount_pct etc.
//           .select("*")
//           .eq("is_active", true)
//           .order("is_featured", { ascending: false })
//           .order("rating", { ascending: false });

//         if (error) throw error;
//         setRawData(data ?? []);
//       } catch (err) {
//         console.error("Supabase fetch error:", err.message);
//         setFetchErr(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

//   /* ── normalise DB rows to UI shape ── */
//   const allProducts = rawData.map(normalise);

//   /* ── cart helpers ── */
//   const addCart = useCallback(p => {
//     setCart(prev => {
//       const key = `${p.id}-${p.selectedSize ?? ""}-${p.selectedColor ?? ""}`;
//       const ex  = prev.find(i => `${i.id}-${i.selectedSize ?? ""}-${i.selectedColor ?? ""}` === key);
//       return ex
//         ? prev.map(i => (`${i.id}-${i.selectedSize ?? ""}-${i.selectedColor ?? ""}` === key ? { ...i, qty: i.qty + (p.qty || 1) } : i))
//         : [...prev, { ...p, qty: p.qty || 1 }];
//     });
//     setCO(true);
//   }, []);

//   const toggleWish = useCallback(id => {
//     setWish(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
//   }, []);

//   /* ── filtered + sorted products ── */
//   const products = allProducts
//     .filter(p => cat === "All" || p.cat === cat)
//     .filter(p => Number(p.price) <= maxP)
//     .filter(p => Number(p.rating) >= minR)
//     .filter(p => {
//       const q = search.toLowerCase();
//       return !q
//         || p.name.toLowerCase().includes(q)
//         || (p.cat  ?? "").toLowerCase().includes(q)
//         || (p.sub  ?? "").toLowerCase().includes(q)
//         || (p.desc ?? "").toLowerCase().includes(q);
//     })
//     .sort((a, b) => {
//       if (sort === "price-asc")  return a.price - b.price;
//       if (sort === "price-desc") return b.price - a.price;
//       if (sort === "rating")     return b.rating - a.rating;
//       if (sort === "newest")     return new Date(b.created_at) - new Date(a.created_at);
//       return 0; // featured (already ordered by DB)
//     });

//   /* FIX: catCounts from actual DB data, not hardcoded array */
//   const catCounts = Object.fromEntries(
//     CATS.map(c => [c, c === "All" ? allProducts.length : allProducts.filter(p => p.cat === c).length])
//   );

//   const cartCount = cart.reduce((s, i) => s + i.qty, 0);

//   return (
//     <div style={{ minHeight: "100vh", background: T.bg, color: T.champagne, fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
//         *{box-sizing:border-box;margin:0;padding:0}
//         ::-webkit-scrollbar{width:5px}
//         ::-webkit-scrollbar-track{background:${T.bg}}
//         ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
//         input[type=range]{-webkit-appearance:none;height:3px;background:${T.border};border-radius:2px;cursor:pointer;outline:none}
//         input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${T.coral};cursor:pointer}
//         select option{background:${T.raised};color:${T.champagne}}
//         ::placeholder{color:${T.dim}}
//         button:focus{outline:none}
//         @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
//         @keyframes spin{to{transform:rotate(360deg)}}
//       `}</style>

//       {/* ── ANNOUNCEMENT BAR ── */}
//       <div style={{ background: `linear-gradient(90deg, ${T.coralDim}, ${T.coral})`, color: "#000", textAlign: "center", padding: "7px 16px", fontSize: 12, fontWeight: 800, letterSpacing: "0.06em" }}>
//         🚚 FREE SHIPPING OVER $99 &nbsp;·&nbsp; CODE <strong>KVAD20</strong> = 20% OFF &nbsp;·&nbsp; 30-DAY RETURNS
//       </div>

//       {/* ── NAVBAR ── */}
//       <header style={{ position: "sticky", top: 0, zIndex: 600, background: "rgba(8,8,16,.94)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}` }}>
//         <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px", height: 66, display: "flex", alignItems: "center", gap: 24 }}>
//           <div style={{ display: "flex", alignItems: "baseline", gap: 2, flexShrink: 0 }}>
//             <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 26, color: T.coral, letterSpacing: "-0.02em" }}>KVAD</span>
//             <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: "0.15em", marginLeft: 4, textTransform: "uppercase" }}>Express</span>
//           </div>

//           {/* search */}
//           <div style={{ flex: 1, maxWidth: 520, position: "relative" }}>
//             <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
//               <I n="search" s={15} c={T.muted} />
//             </span>
//             <input value={search} onChange={e => setSrch(e.target.value)}
//               placeholder="Search across all categories…"
//               style={{ width: "100%", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 13px 9px 40px", color: T.champagne, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
//             {search && (
//               <button onClick={() => setSrch("")}
//                 style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.muted, cursor: "pointer" }}>
//                 <I n="x" s={14} />
//               </button>
//             )}
//           </div>
//           <div style={{ flex: 1 }} />

//           {/* wishlist */}
//           <button style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: 8 }}>
//             <I n="heart" s={22} c={wish.length ? T.danger : T.muted} solid={wish.length > 0} />
//             {wish.length > 0 && (
//               <span style={{ position: "absolute", top: 2, right: 2, background: T.danger, color: "#fff", borderRadius: "50%", width: 15, height: 15, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
//                 {wish.length}
//               </span>
//             )}
//           </button>

//           {/* cart */}
//           <button onClick={() => setCO(true)}
//             style={{ display: "flex", alignItems: "center", gap: 9, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 18px", cursor: "pointer", color: T.champagne, transition: "all .18s" }}
//             onMouseEnter={e => { e.currentTarget.style.borderColor = T.coral; }}
//             onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}>
//             <I n="bag" s={18} />
//             <span style={{ fontSize: 14, fontWeight: 700 }}>Bag</span>
//             {cartCount > 0 && (
//               <span style={{ background: T.coral, color: "#000", borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 900 }}>{cartCount}</span>
//             )}
//           </button>
//         </div>
//       </header>

//       {/* ── HERO ── */}
//       <div style={{ position: "relative", overflow: "hidden", background: T.bg }}>
//         <div style={{ position: "absolute", inset: 0 }}>
//           <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800&q=80" alt=""
//             style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .13 }} />
//           <div style={{ position: "absolute", inset: 0, background: `linear-gradient(110deg, ${T.bg} 45%, transparent 100%)` }} />
//         </div>
//         <svg style={{ position: "absolute", right: 0, bottom: 0, opacity: .04 }} width="700" height="380" viewBox="0 0 700 380">
//           {Array.from({ length: 14 }, (_, i) => (
//             <line key={i} x1={i * 55 - 100} y1="0" x2={i * 55 + 200} y2="380" stroke={T.coral} strokeWidth="1.5" />
//           ))}
//         </svg>
//         <div style={{ position: "relative", maxWidth: 1380, margin: "0 auto", padding: "64px 28px 68px" }}>
//           <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(38px,6vw,74px)", lineHeight: 1.02, marginBottom: 16, color: T.champagne }}>
//             Everything Worth<br /><span style={{ color: T.coral }}>Owning.</span>
//           </h1>
//           <p style={{ fontSize: 16, color: T.cream, maxWidth: 460, lineHeight: 1.7, marginBottom: 30 }}>
//             Premium electronics, refined clothing, curated beauty, and considered home objects — all under one roof.
//           </p>
//           <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//             {Object.entries(CAT_META).map(([c, { icon }]) => (
//               <button key={c}
//                 onClick={() => { setCat(c); document.getElementById("shop-grid")?.scrollIntoView({ behavior: "smooth" }); }}
//                 style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${T.borderLt}`, borderRadius: 8, color: T.cream, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 7, transition: "all .18s" }}
//                 onMouseEnter={e => { e.currentTarget.style.borderColor = T.coral; e.currentTarget.style.color = T.coral; }}
//                 onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderLt; e.currentTarget.style.color = T.cream; }}>
//                 {icon} Shop {c}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── CATEGORY STRIP ── */}
//       <div style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
//         <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px", display: "flex", overflowX: "auto" }}>
//           {CATS.map(c => (
//             <button key={c} onClick={() => setCat(c)}
//               style={{ padding: "16px 22px", background: "transparent", border: "none", borderBottom: `2px solid ${cat === c ? T.coral : "transparent"}`, color: cat === c ? T.coral : T.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: cat === c ? 700 : 400, whiteSpace: "nowrap", transition: "all .2s", display: "flex", alignItems: "center", gap: 6 }}>
//               {CAT_META[c]?.icon} {c}
//               <span style={{ fontSize: 11, background: cat === c ? T.coralGlow : T.raised, border: `1px solid ${cat === c ? T.coral + "44" : T.border}`, color: cat === c ? T.coral : T.muted, padding: "1px 7px", borderRadius: 20 }}>
//                 {loading ? "…" : catCounts[c]}
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ── SHOP GRID ── */}
//       <div id="shop-grid" style={{ maxWidth: 1380, margin: "0 auto", padding: "36px 28px 80px", display: "flex", gap: 26 }}>

//         {/* sidebar filters */}
//         {showF && (
//           <aside style={{ width: 234, flexShrink: 0 }}>
//             <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, position: "sticky", top: 82 }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
//                 <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16 }}>Refine</span>
//                 {(cat !== "All" || minR > 0 || maxP < 2500) && (
//                   <button onClick={() => { setCat("All"); setMinR(0); setMaxP(2500); }}
//                     style={{ fontSize: 12, color: T.coral, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
//                     Reset all
//                   </button>
//                 )}
//               </div>

//               <div style={{ marginBottom: 24 }}>
//                 <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Category</p>
//                 {CATS.map(c => (
//                   <button key={c} onClick={() => setCat(c)}
//                     style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "8px 11px", background: cat === c ? T.coralGlow : "transparent", border: `1px solid ${cat === c ? T.coral : T.border}`, borderRadius: 8, color: cat === c ? T.coral : T.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: cat === c ? 700 : 400, marginBottom: 5, transition: "all .15s" }}>
//                     <span>{CAT_META[c]?.icon} {c}</span>
//                     <span style={{ fontSize: 11 }}>{loading ? "…" : catCounts[c]}</span>
//                   </button>
//                 ))}
//               </div>

//               <div style={{ marginBottom: 24 }}>
//                 <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
//                   Max Price: <span style={{ color: T.coral }}>{fmt(maxP)}</span>
//                 </p>
//                 <input type="range" min={50} max={2500} step={50} value={maxP} onChange={e => setMaxP(+e.target.value)} style={{ width: "100%" }} />
//                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.dim, marginTop: 4 }}>
//                   <span>$50</span><span>$2,500</span>
//                 </div>
//               </div>

//               <div>
//                 <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Min Rating</p>
//                 {[4, 3, 2, 1].map(r => (
//                   <label key={r} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7, cursor: "pointer" }}>
//                     <input type="radio" name="rating" checked={minR === r} onChange={() => setMinR(r)} style={{ accentColor: T.coral }} />
//                     <Stars r={r} s={12} />
//                     <span style={{ fontSize: 12, color: T.muted }}>&amp; up</span>
//                   </label>
//                 ))}
//                 {minR > 0 && (
//                   <button onClick={() => setMinR(0)}
//                     style={{ fontSize: 11, color: T.muted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", marginTop: 2 }}>
//                     Clear ×
//                   </button>
//                 )}
//               </div>
//             </div>
//           </aside>
//         )}

//         {/* products area */}
//         <div style={{ flex: 1, minWidth: 0 }}>
//           {/* toolbar */}
//           <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
//             <button onClick={() => setShowF(f => !f)}
//               style={{ display: "flex", alignItems: "center", gap: 6, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 14px", color: showF ? T.coral : T.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, transition: "all .18s" }}>
//               <I n="filter" s={14} c={showF ? T.coral : T.muted} /> {showF ? "Hide" : "Show"} Filters
//             </button>
//             <span style={{ fontSize: 13, color: T.muted }}>
//               {loading
//                 ? <span style={{ color: T.muted }}>Loading…</span>
//                 : <><span style={{ color: T.champagne, fontWeight: 700 }}>{products.length}</span> results</>
//               }
//             </span>
//             <div style={{ flex: 1 }} />
//             <select value={sort} onChange={e => setSort(e.target.value)}
//               style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 13px", color: T.champagne, fontSize: 13, cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
//               <option value="featured">Sort: Featured</option>
//               <option value="price-asc">Price: Low → High</option>
//               <option value="price-desc">Price: High → Low</option>
//               <option value="rating">Best Rated</option>
//               <option value="newest">Newest</option>
//             </select>
//             <div style={{ display: "flex", background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
//               {[["grid", "grid"], ["rows", "list"]].map(([ic, id]) => (
//                 <button key={id} onClick={() => setView(id)}
//                   style={{ padding: "8px 12px", background: view === id ? T.raised : "transparent", border: "none", cursor: "pointer" }}>
//                   <I n={ic} s={16} c={view === id ? T.coral : T.muted} />
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* active filter chips */}
//           {(cat !== "All" || minR > 0 || search || maxP < 2500) && (
//             <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
//               {cat !== "All" && (
//                 <span style={{ background: T.coralGlow, border: `1px solid ${T.coral}55`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: T.coral, display: "flex", alignItems: "center", gap: 5 }}>
//                   {cat} <button onClick={() => setCat("All")} style={{ background: "none", border: "none", color: T.coral, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
//                 </span>
//               )}
//               {minR > 0 && (
//                 <span style={{ background: T.coralGlow, border: `1px solid ${T.coral}55`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: T.coral, display: "flex", alignItems: "center", gap: 5 }}>
//                   {minR}★+ <button onClick={() => setMinR(0)} style={{ background: "none", border: "none", color: T.coral, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
//                 </span>
//               )}
//               {maxP < 2500 && (
//                 <span style={{ background: T.coralGlow, border: `1px solid ${T.coral}55`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: T.coral, display: "flex", alignItems: "center", gap: 5 }}>
//                   Under {fmt(maxP)} <button onClick={() => setMaxP(2500)} style={{ background: "none", border: "none", color: T.coral, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
//                 </span>
//               )}
//               {search && (
//                 <span style={{ background: T.coralGlow, border: `1px solid ${T.coral}55`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: T.coral, display: "flex", alignItems: "center", gap: 5 }}>
//                   "{search}" <button onClick={() => setSrch("")} style={{ background: "none", border: "none", color: T.coral, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
//                 </span>
//               )}
//             </div>
//           )}

//           {/* error state */}
//           {fetchError && (
//             <div style={{ padding: "24px", background: T.card, borderRadius: 12, border: `1px solid ${T.danger}33`, marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
//               <I n="warn" s={20} c={T.danger} />
//               <div>
//                 <p style={{ fontWeight: 700, marginBottom: 4 }}>Could not load products</p>
//                 <p style={{ fontSize: 12, color: T.muted }}>{fetchError}</p>
//                 <button onClick={() => window.location.reload()}
//                   style={{ marginTop: 10, fontSize: 12, color: T.coral, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
//                   <I n="refresh" s={13} c={T.coral} /> Retry
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* loading skeleton */}
//           {loading && (
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(234px,1fr))", gap: 18 }}>
//               {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
//             </div>
//           )}

//           {/* empty state */}
//           {!loading && !fetchError && products.length === 0 && (
//             <div style={{ textAlign: "center", padding: "80px 0", color: T.muted }}>
//               <I n="search" s={48} c={T.dim} />
//               <p style={{ marginTop: 16, fontSize: 16, marginBottom: 16 }}>No products match your filters</p>
//               <Btn v="outline" onClick={() => { setCat("All"); setMinR(0); setMaxP(2500); setSrch(""); }}>
//                 Clear all filters
//               </Btn>
//             </div>
//           )}

//           {/* products */}
//           {!loading && !fetchError && products.length > 0 && (
//             view === "grid" ? (
//               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(234px,1fr))", gap: 18 }}>
//                 {products.map(p => (
//                   <Card key={p.id} p={p} onAdd={addCart} onWish={toggleWish} wish={wish} onQuick={setQuickP} />
//                 ))}
//               </div>
//             ) : (
//               <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//                 {products.map(p => (
//                   <Row key={p.id} p={p} onAdd={addCart} onWish={toggleWish} wish={wish} onQuick={setQuickP} />
//                 ))}
//               </div>
//             )
//           )}
//         </div>
//       </div>

//       {/* ── VALUE PROPS ── */}
//       <div style={{ background: T.card, borderTop: `1px solid ${T.border}` }}>
//         <div style={{ maxWidth: 1380, margin: "0 auto", padding: "40px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}>
//           {[["truck", "Free Shipping", "On all orders over $99"], ["shield", "2-Year Warranty", "On all KVAD products"], ["refresh", "30-Day Returns", "No questions asked"], ["zap", "Same-Day Dispatch", "Order by 2 pm"]].map(([icon, title, desc]) => (
//             <div key={title} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
//               <div style={{ width: 42, height: 42, borderRadius: 10, background: T.coralGlow, border: `1px solid ${T.coral}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                 <I n={icon} s={19} c={T.coral} />
//               </div>
//               <div>
//                 <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{title}</p>
//                 <p style={{ fontSize: 12, color: T.muted }}>{desc}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── FOOTER ── */}
//       <footer style={{ background: T.bg, borderTop: `1px solid ${T.border}` }}>
//         <div style={{ maxWidth: 1380, margin: "0 auto", padding: "32px 28px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
//           <div>
//             <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: T.coral }}>KVAD</span>
//             <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>Premium goods for a considered life.</p>
//           </div>
//           <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
//             {["Visa", "Mastercard", "PayPal", "Apple Pay", "Google Pay"].map(pm => (
//               <span key={pm} style={{ padding: "4px 10px", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 11, color: T.muted, fontWeight: 700 }}>{pm}</span>
//             ))}
//           </div>
//           <p style={{ fontSize: 12, color: T.dim }}>© 2025 KVAD Express. All rights reserved.</p>
//         </div>
//       </footer>

//       {/* ── OVERLAYS ── */}
//       {cartOpen && (
//         <CartDrawer cart={cart} setCart={setCart}
//           onClose={() => setCO(false)}
//           onCheckout={() => { setCO(false); setCHK(true); }} />
//       )}
//       {chkOpen && (
//         <Checkout cart={cart} setCart={setCart} onClose={() => setCHK(false)} />
//       )}
//       {quickP && (
//         <QuickView p={quickP} onClose={() => setQuickP(null)}
//           onAdd={addCart} wish={wish} onWish={toggleWish} />
//       )}
//     </div>
//   );
// }