"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T, fmt, FREE_SHIP, COUPONS } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { SafeImg, Btn, EmptyState } from "@/components/ui";
import { Stars } from "@/components/ui/Ic";
import Ic from "@/components/ui/Ic";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeCart, updateQty, cartTotal } = useCart();
  const toast = useToast();
  const [code, setCode]   = useState("");
  const [disc, setDisc]   = useState(0);
  const [cMsg, setCMsg]   = useState("");

  const sub  = cartTotal;
  const ship = sub >= FREE_SHIP ? 0 : cart.length > 0 ? 80 : 0;
  const tot  = sub - disc + ship;

  const applyCode = () => {
    const p = COUPONS[code.trim().toUpperCase()];
    if (p) { setDisc(sub * p / 100); setCMsg(`✓ ${p}% ছাড় প্রয়োগ!`); toast(`${p}% ছাড় পেয়েছেন! 🎉`); }
    else   { setDisc(0); setCMsg("অকার্যকর কোড ❌"); }
  };

  if (cart.length === 0) return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "60px 20px" }}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}`}</style>
      <EmptyState icon="🛒" title="কার্ট খালি"
        sub="এখনই কিছু পণ্য যোগ করুন!"
        action="কেনাকাটা শুরু করুন" onAction={() => router.push("/shop")} />
    </div>
  );

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 20px 80px" }}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}.fade-in{animation:fadeIn .3s ease}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      <h1 className="playfair" style={{ fontSize: 28, fontWeight: 700, marginBottom: 28 }}>আপনার কার্ট ({cart.reduce((s, i) => s + i.qty, 0)} টি)</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28 }}>
        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {cart.map(item => (
            <div key={item.cartKey} className="fade-in" style={{
              display: "flex", gap: 16, padding: 18,
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 14, alignItems: "flex-start",
            }}>
              <Link href={`/product/${item.id}`}>
                <SafeImg src={item.img} alt={item.name}
                  style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 10, flexShrink: 0, cursor: "pointer" }} />
              </Link>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", marginBottom: 3 }}>{item.cat}</p>
                <Link href={`/product/${item.id}`}>
                  <h3 className="playfair" style={{ fontSize: 17, fontWeight: 600, marginBottom: 5, lineHeight: 1.3, cursor: "pointer" }}>{item.name}</h3>
                </Link>
                {item.brand && <p style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>by {item.brand}</p>}
                {item.selectedSize  && <p style={{ fontSize: 12, color: T.muted }}>সাইজ: {item.selectedSize}</p>}
                {item.selectedColor && <p style={{ fontSize: 12, color: T.muted }}>রঙ: {item.selectedColor}</p>}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                  {/* Qty */}
                  <div style={{ display: "flex", border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
                    <button onClick={() => updateQty(item.cartKey, item.qty - 1)}
                      style={{ background: T.raised, border: "none", padding: "7px 13px", cursor: "pointer" }}>
                      <Ic n="minus" s={13} c={T.champagne} />
                    </button>
                    <span style={{ padding: "7px 18px", fontWeight: 800, background: T.card, fontSize: 15, minWidth: 50, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.cartKey, item.qty + 1)}
                      style={{ background: T.raised, border: "none", padding: "7px 13px", cursor: "pointer" }}>
                      <Ic n="plus" s={13} c={T.champagne} />
                    </button>
                  </div>
                  <button onClick={() => { removeCart(item.cartKey); toast("পণ্য বাদ দেওয়া হয়েছে"); }}
                    style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 11px", cursor: "pointer", color: T.danger, display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                    <Ic n="trash" s={14} c={T.danger} /> বাদ দিন
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p className="playfair" style={{ fontSize: 20, fontWeight: 800, color: T.coral }}>{fmt(item.price * item.qty)}</p>
                {item.qty > 1 && <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{fmt(item.price)} × {item.qty}</p>}
              </div>
            </div>
          ))}

          {/* Continue shopping */}
          <Link href="/shop"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: T.coral, fontWeight: 700, marginTop: 6 }}>
            <Ic n="chL" s={14} c={T.coral} /> কেনাকাটা চালিয়ে যান
          </Link>
        </div>

        {/* Summary */}
        <div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, position: "sticky", top: 140 }}>
            <h3 className="playfair" style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>অর্ডার সারসংক্ষেপ</h3>

            {/* Free shipping bar */}
            {sub < FREE_SHIP ? (
              <div style={{ background: T.raised, borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
                <p style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>
                  আরও <strong style={{ color: T.ok }}>{fmt(FREE_SHIP - sub)}</strong> যোগ করলে বিনামূল্যে ডেলিভারি!
                </p>
                <div style={{ background: T.border, borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ background: T.ok, height: "100%", width: `${Math.min(100, (sub / FREE_SHIP) * 100)}%`, borderRadius: 4, transition: "width .4s" }} />
                </div>
              </div>
            ) : (
              <div style={{ background: T.ok + "11", border: `1px solid rgba(61,235,160,.2)`, borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: T.ok, fontWeight: 700 }}>
                🎉 বিনামূল্যে ডেলিভারি পাচ্ছেন!
              </div>
            )}

            {/* Coupon */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>কুপন কোড</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={code} onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && applyCode()}
                  placeholder="e.g. KVAD20"
                  style={{ flex: 1, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", color: T.champagne, fontSize: 13, fontFamily: "inherit" }} />
                <Btn onClick={applyCode} sz="sm" v="outline">প্রয়োগ</Btn>
              </div>
              {cMsg && <p style={{ fontSize: 12, color: cMsg[0] === "✓" ? T.ok : T.danger, marginTop: 6 }}>{cMsg}</p>}
              <p style={{ fontSize: 11, color: T.dim, marginTop: 6 }}>কোড: KVAD20 · WELCOME10 · EID25</p>
            </div>

            {/* Totals */}
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16, display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                ["সাবটোটাল", fmt(sub), ""],
                ["ছাড়", disc ? `-${fmt(disc)}` : "—", disc ? T.ok : ""],
                ["ডেলিভারি", ship === 0 ? "বিনামূল্যে 🎉" : fmt(ship), ship === 0 ? T.ok : ""],
              ].map(([k, v, c]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: T.muted }}>{k}</span>
                  <span style={{ fontWeight: c ? 700 : 400, color: c || T.champagne }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 22, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                <span>মোট</span><span style={{ color: T.coral }}>{fmt(tot)}</span>
              </div>
            </div>

            <Btn v="coral" full sz="lg" onClick={() => router.push("/checkout")}>
              চেকআউট <Ic n="arrow" s={16} />
            </Btn>

            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14, fontSize: 11, color: T.dim }}>
              {["🔒 SSL সুরক্ষিত", "📦 দ্রুত ডেলিভারি", "🔄 রিটার্ন সুবিধা"].map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
