"use client";
import { useState } from "react";
import Link from "next/link";
import { T, fmt, pct } from "@/lib/constants";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Badge, SafeImg } from "@/components/ui";
import { Stars } from "@/components/ui/Ic";
import Ic from "@/components/ui/Ic";

export default function ProductCard({ p }: { p: Product }) {
  const [hov, setH]   = useState(false);
  const { addCart, toggleWish, inWish, setCartOpen } = useCart();
  const toast = useToast();
  const d     = pct(p.price, p.was);
  const wished = inWish(p.id);
  const stockPct = p.stock > 0 ? Math.min(100, Math.round((p.stock / 50) * 100)) : 0;

  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: T.card, border: `1px solid ${hov ? T.borderLt : T.border}`,
        borderRadius: 15, overflow: "hidden",
        display: "flex", flexDirection: "column",
        transition: "all .22s",
        transform: hov ? "translateY(-7px)" : "none",
        boxShadow: hov ? "0 28px 64px rgba(0,0,0,.75)" : "none",
      }}
    >
      {/* Image area */}
      <div style={{ position: "relative", paddingTop: "82%", overflow: "hidden", background: T.bg }}>
        <Link href={`/product/${p.id}`}>
          <SafeImg src={p.img} alt={p.name}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", cursor: "pointer",
              transition: "transform .5s",
              transform: hov ? "scale(1.09)" : "scale(1)",
            }} />
        </Link>

        {/* Badges */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {p.badge && <Badge text={p.badge} />}
          {d >= 10   && <Badge text={`-${d}%`} type="danger" />}
          {p.is_featured && <Badge text="TOP" type="gold" />}
          {p.stock === 0 && <Badge text="শেষ" type="sky" />}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => { toggleWish(p.id); toast(wished ? "উইশলিস্ট থেকে বাদ" : "উইশলিস্টে যোগ ❤️"); }}
          style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(8,8,16,.75)", backdropFilter: "blur(6px)",
            border: `1px solid ${wished ? T.danger + "66" : T.border}`,
            borderRadius: "50%", width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "transform .2s",
            transform: hov ? "scale(1.1)" : "scale(1)",
          }}
        >
          <Ic n="heart" s={16} c={wished ? T.danger : T.cream} solid={wished} />
        </button>

        {/* Hover action bar */}
        {hov && (
          <div className="fade-in" style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", gap: 7 }}>
            <Link href={`/product/${p.id}`}
              style={{
                flex: 1, background: "rgba(8,8,16,.88)", backdropFilter: "blur(8px)",
                border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px",
                color: T.champagne, cursor: "pointer", fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}>
              <Ic n="eye" s={13} /> দ্রুত দেখুন
            </Link>
            <button
              onClick={() => {
                if (p.stock > 0) {
                  addCart(p);
                  toast(`${p.name.slice(0, 22)}… ব্যাগে যোগ! 🛍️`);
                  setCartOpen(true);
                }
              }}
              disabled={p.stock === 0}
              style={{
                flex: 1, background: p.stock === 0 ? T.dim : T.coral,
                border: "none", borderRadius: 9, padding: "9px",
                color: p.stock === 0 ? T.muted : "#000",
                cursor: p.stock === 0 ? "not-allowed" : "pointer",
                fontSize: 12, fontWeight: 900, fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}
            >
              <Ic n="cart" s={13} c={p.stock === 0 ? T.muted : "#000"} />
              {p.stock === 0 ? "শেষ" : "যোগ করুন"}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
          <span style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 600 }}>
            {p.cat}{p.sub ? ` · ${p.sub}` : ""}
          </span>
          {p.stock > 0 && p.stock <= 10 && (
            <span style={{ fontSize: 10, color: T.gold, fontWeight: 700, flexShrink: 0 }}>{p.stock} বাকি!</span>
          )}
        </div>

        <Link href={`/product/${p.id}`}
          className="playfair"
          style={{
            fontWeight: 600, fontSize: 14, lineHeight: 1.35,
            marginBottom: 6, color: T.champagne, flex: 1,
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
          }}>
          {p.name}
        </Link>

        {p.brand && <p style={{ fontSize: 11, color: T.muted, marginBottom: 5 }}>by {p.brand}</p>}

        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
          <Stars r={p.rating} s={11} />
          <span style={{ fontSize: 11, color: T.muted }}>({p.reviews.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: p.stock > 0 && p.stock <= 20 ? 8 : 0 }}>
          <span className="playfair" style={{ fontSize: 19, fontWeight: 800, color: T.coral }}>{fmt(p.price)}</span>
          {p.was > p.price && (
            <span style={{ fontSize: 12, color: T.dim, textDecoration: "line-through" }}>{fmt(p.was)}</span>
          )}
          {d >= 5 && <span style={{ fontSize: 11, color: T.ok, fontWeight: 700 }}>−{d}%</span>}
        </div>

        {/* Low stock bar */}
        {p.stock > 0 && p.stock <= 20 && (
          <div>
            <div style={{ background: T.raised, borderRadius: 3, height: 3, overflow: "hidden" }}>
              <div style={{ background: p.stock <= 5 ? T.danger : T.gold, height: "100%", width: `${stockPct}%`, borderRadius: 3 }} />
            </div>
            <p style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>মজুদ কম — মাত্র {p.stock} টি</p>
          </div>
        )}
      </div>
    </div>
  );
}
