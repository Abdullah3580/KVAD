"use client";
import Link from "next/link";
import { T, fmt } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { SafeImg, Btn } from "@/components/ui";
import Ic from "@/components/ui/Ic";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { normalise } from "@/lib/constants";
import { Product } from "@/lib/types";

export default function WishlistDrawer() {
  const { wish, wishOpen, setWishOpen, toggleWish, addCart, setCartOpen } = useCart();
  const toast = useToast();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (!wishOpen || wish.length === 0) { setItems([]); return; }
    supabase.from("products").select("*").in("id", wish).then(({ data }) => {
      setItems((data ?? []).map(normalise).filter(Boolean) as Product[]);
    });
  }, [wishOpen, wish]);

  if (!wishOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex" }}>
      <div onClick={() => setWishOpen(false)}
        style={{ flex: 1, background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }} />
      <div className="slide-r" style={{
        width: 440, background: T.card, borderLeft: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", maxHeight: "100vh",
      }}>
        <div style={{
          padding: "22px 24px", borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
        }}>
          <h2 className="playfair" style={{ fontWeight: 700, fontSize: 20 }}>
            উইশলিস্ট <span style={{ fontSize: 14, fontWeight: 400, color: T.muted }}>({wish.length})</span>
          </h2>
          <button onClick={() => setWishOpen(false)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}>
            <Ic n="x" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {wish.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 80, color: T.muted }}>
              <Ic n="heart" s={52} c={T.dim} />
              <p style={{ marginTop: 16, fontSize: 16 }}>উইশলিস্ট খালি</p>
              <p style={{ fontSize: 12, marginTop: 6, marginBottom: 20 }}>পছন্দের পণ্যে ❤️ চাপুন</p>
              <Btn v="outline" onClick={() => setWishOpen(false)}>কেনাকাটা করুন</Btn>
            </div>
          ) : items.map(p => (
            <div key={p.id} style={{
              display: "flex", gap: 12, padding: 12,
              background: T.raised, borderRadius: 11, border: `1px solid ${T.border}`,
            }}>
              <Link href={`/product/${p.id}`} onClick={() => setWishOpen(false)}>
                <SafeImg src={p.img} alt={p.name}
                  style={{ width: 76, height: 76, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
              </Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>{p.cat}</p>
                <Link href={`/product/${p.id}`} onClick={() => setWishOpen(false)}>
                  <p style={{
                    fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 5,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                  }}>{p.name}</p>
                </Link>
                <p style={{ color: T.coral, fontWeight: 800, fontSize: 14 }}>{fmt(p.price)}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button
                  onClick={() => { addCart(p); toast("ব্যাগে যোগ! 🛍️"); setCartOpen(true); }}
                  style={{
                    background: T.coral, border: "none", borderRadius: 7,
                    padding: "6px 12px", cursor: "pointer", fontSize: 12,
                    fontWeight: 700, color: "#000", fontFamily: "inherit", whiteSpace: "nowrap",
                  }}>+ ব্যাগ</button>
                <button onClick={() => { toggleWish(p.id); toast("উইশলিস্ট থেকে বাদ"); }}
                  style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic n="trash" s={13} c={T.danger} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {wish.length > 0 && (
          <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
            <Btn v="outline" full onClick={() => { setWishOpen(false); }}>
              <Link href="/wishlist" style={{ color: "inherit" }}>সম্পূর্ণ উইশলিস্ট দেখুন →</Link>
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
