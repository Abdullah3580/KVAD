"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T, fmt, FREE_SHIP } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";
import { SafeImg, Btn } from "@/components/ui";
import Ic from "@/components/ui/Ic";

export default function CartDrawer() {
  const router = useRouter();
  const { cart, cartOpen, setCartOpen, removeCart, updateQty } = useCart();
  const toast = useToast();
  const [code, setCode]      = useState("");
  const [disc, setDisc]      = useState(0);
  const [couponMsg, setCMsg] = useState("");
  const [cLoading, setCLoading] = useState(false);

  const sub  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = sub >= FREE_SHIP ? 0 : 80;
  const tot  = sub - disc + ship;

  // Fix: coupon validation via DB, not hardcoded
  const applyCode = async () => {
    if (!code.trim()) return;
    setCLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      setDisc(0); setCMsg("অকার্যকর কোড ❌");
    } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setDisc(0); setCMsg("কোডের মেয়াদ শেষ ❌");
    } else if (data.min_order && sub < data.min_order) {
      setDisc(0); setCMsg(`ন্যূনতম অর্ডার ৳${data.min_order} হতে হবে`);
    } else {
      const pct = Number(data.discount ?? 0);
      setDisc(Math.round((sub * pct) / 100));
      setCMsg(`✓ ${pct}% ছাড় প্রয়োগ!`);
    }
    setCLoading(false);
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
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
                  }}>{item.name}</p>
                </Link>
                {item.selectedSize  && <p style={{ fontSize: 11, color: T.muted }}>সাইজ: {item.selectedSize}</p>}
                {item.selectedColor && <p style={{ fontSize: 11, color: T.muted }}>রঙ: {item.selectedColor}</p>}
                <p style={{ color: T.coral, fontWeight: 800, fontSize: 14, margin: "4px 0 8px" }}>{fmt(item.price)}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => updateQty(item.cartKey, item.qty - 1)}
                    style={{ width: 26, height: 26, borderRadius: "50%", background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Ic n="minus" s={12} c={T.muted} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.cartKey, item.qty + 1)}
                    style={{ width: 26, height: 26, borderRadius: "50%", background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Ic n="plus" s={12} c={T.muted} />
                  </button>
                  <button onClick={() => { removeCart(item.cartKey); toast("বাদ দেওয়া হয়েছে"); }}
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
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
            {/* Coupon */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input value={code} onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && applyCode()}
                placeholder="কুপন কোড"
                style={{ flex: 1, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", color: T.champagne, fontSize: 13, fontFamily: "inherit" }} />
              <Btn sz="sm" v="outline" onClick={applyCode} loading={cLoading}>প্রয়োগ</Btn>
            </div>
            {couponMsg && <p style={{ fontSize: 12, color: couponMsg[0] === "✓" ? T.ok : T.danger, marginBottom: 10 }}>{couponMsg}</p>}

            {/* Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: T.muted }}>সাবটোটাল</span><span>{fmt(sub)}</span>
              </div>
              {disc > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.muted }}>কুপন ছাড়</span><span style={{ color: T.ok }}>-{fmt(disc)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: T.muted }}>ডেলিভারি</span>
                <span style={{ color: sub >= FREE_SHIP ? T.ok : undefined }}>{sub >= FREE_SHIP ? "বিনামূল্যে 🎉" : fmt(ship)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 18, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                <span>মোট</span><span style={{ color: T.coral }}>{fmt(tot)}</span>
              </div>
            </div>

            <Btn full sz="lg" onClick={() => { setCartOpen(false); router.push("/checkout"); }}>
              চেকআউট করুন <Ic n="arrow" s={16} />
            </Btn>
            <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 10 }}>
              বিকাশ · নগদ · রকেট · COD গ্রহণযোগ্য
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
