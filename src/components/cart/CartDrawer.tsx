"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T, fmt, FREE_SHIP, COUPONS } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { SafeImg, Btn } from "@/components/ui";
import Ic from "@/components/ui/Ic";

export default function CartDrawer() {
  const router = useRouter();
  const { cart, cartOpen, setCartOpen, removeCart, updateQty } = useCart();
  const toast = useToast();
  const [code, setCode]     = useState("");
  const [disc, setDisc]     = useState(0);
  const [couponMsg, setCMsg] = useState("");

  const sub  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = sub >= FREE_SHIP ? 0 : 80;
  const tot  = sub - disc + ship;

  const applyCode = () => {
    const p = COUPONS[code.trim().toUpperCase()];
    if (p) { setDisc(sub * (p / 100)); setCMsg(`✓ ${p}% ছাড় প্রয়োগ!`); }
    else    { setDisc(0); setCMsg("অকার্যকর কোড ❌"); }
  };

  if (!cartOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex" }}>
      <div onClick={() => setCartOpen(false)}
        style={{ flex: 1, background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }} />
      <div className="slide-r" style={{
        width: 440, background: T.card, borderLeft: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", maxHeight: "100vh",
      }}>
        {/* Header */}
        <div style={{
          padding: "22px 24px", borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
        }}>
          <h2 className="playfair" style={{ fontWeight: 700, fontSize: 20 }}>
            আপনার ব্যাগ <span style={{ fontSize: 14, fontWeight: 400, color: T.muted }}>({cart.reduce((s, i) => s + i.qty, 0)} টি)</span>
          </h2>
          <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}>
            <Ic n="x" />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 80, color: T.muted }}>
              <Ic n="cart" s={52} c={T.dim} />
              <p style={{ marginTop: 16, fontSize: 16 }}>ব্যাগ খালি</p>
              <p style={{ fontSize: 12, marginTop: 6 }}>কিছু পণ্য যোগ করুন!</p>
            </div>
          ) : cart.map(item => (
            <div key={item.cartKey} style={{
              display: "flex", gap: 12, padding: 12,
              background: T.raised, borderRadius: 11, border: `1px solid ${T.border}`,
            }}>
              <Link href={`/product/${item.id}`} onClick={() => setCartOpen(false)}>
                <SafeImg src={item.img} alt={item.name}
                  style={{ width: 76, height: 76, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
              </Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>{item.cat}</p>
                <Link href={`/product/${item.id}`} onClick={() => setCartOpen(false)}>
                  <p style={{
                    fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 3,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                  }}>{item.name}</p>
                </Link>
                {item.selectedSize  && <p style={{ fontSize: 11, color: T.muted }}>সাইজ: {item.selectedSize}</p>}
                {item.selectedColor && <p style={{ fontSize: 11, color: T.muted }}>রঙ: {item.selectedColor}</p>}
                <p style={{ color: T.coral, fontWeight: 800, fontSize: 14, margin: "4px 0 8px" }}>{fmt(item.price)}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <button onClick={() => updateQty(item.cartKey, item.qty - 1)}
                    style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 5, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Ic n="minus" s={12} c={T.champagne} />
                  </button>
                  <span style={{ fontWeight: 800, minWidth: 24, textAlign: "center", fontSize: 14 }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.cartKey, item.qty + 1)}
                    style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 5, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Ic n="plus" s={12} c={T.champagne} />
                  </button>
                  <button onClick={() => { removeCart(item.cartKey); toast("পণ্য বাদ দেওয়া হয়েছে"); }}
                    style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}>
                    <Ic n="trash" s={15} c={T.danger} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
            {/* Free shipping progress */}
            {sub < FREE_SHIP ? (
              <div style={{ marginBottom: 12 }}>
                <div style={{ background: T.raised, borderRadius: 5, height: 5, overflow: "hidden", marginBottom: 5 }}>
                  <div style={{ background: T.ok, height: "100%", width: `${Math.min(100, (sub / FREE_SHIP) * 100)}%`, borderRadius: 5, transition: "width .4s" }} />
                </div>
                <p style={{ fontSize: 11, color: T.muted, textAlign: "center" }}>
                  আরও <strong style={{ color: T.ok }}>{fmt(FREE_SHIP - sub)}</strong> — বিনামূল্যে ডেলিভারি!
                </p>
              </div>
            ) : (
              <div style={{ background: T.ok + "11", border: `1px solid rgba(61,235,160,.2)`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: T.ok, textAlign: "center", fontWeight: 700 }}>
                🎉 বিনামূল্যে ডেলিভারি পাচ্ছেন!
              </div>
            )}

            {/* Coupon */}
            <div style={{ display: "flex", gap: 7, marginBottom: 4 }}>
              <input value={code} onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && applyCode()}
                placeholder="কুপন কোড (KVAD20)"
                style={{
                  flex: 1, background: T.raised, border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: "9px 12px", color: T.champagne, fontSize: 13, fontFamily: "inherit",
                }} />
              <Btn onClick={applyCode} sz="sm" v="outline">প্রয়োগ</Btn>
            </div>
            {couponMsg && <p style={{ fontSize: 12, color: couponMsg[0] === "✓" ? T.ok : T.danger, marginBottom: 8 }}>{couponMsg}</p>}

            {/* Totals */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, marginBottom: 14 }}>
              {[["সাবটোটাল", fmt(sub)], ["ছাড়", disc ? `-${fmt(disc)}` : "—"], ["ডেলিভারি", ship === 0 ? "বিনামূল্যে 🎉" : fmt(ship)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.muted }}>{k}</span>
                  <span style={{ color: k === "ছাড়" && disc ? T.ok : v.includes?.("বিনামূল্যে") ? T.ok : T.champagne, fontWeight: k === "ছাড়" && disc ? 700 : 400 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 20, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                <span>মোট</span><span style={{ color: T.coral }}>{fmt(tot)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Btn v="dark" sz="md" onClick={() => { setCartOpen(false); router.push("/cart"); }}>
                কার্ট দেখুন
              </Btn>
              <Btn v="coral" full sz="md" onClick={() => { setCartOpen(false); router.push("/checkout"); }}>
                চেকআউট <Ic n="arrow" s={15} />
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
