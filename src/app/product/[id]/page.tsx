"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { T, fmt, pct, normalise, DELIVERY_OPTS } from "@/lib/constants";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Btn, Badge, SafeImg, ProductSkeleton, EmptyState, SectionHead, QtyStepper } from "@/components/ui";
import { Stars } from "@/components/ui/Ic";
import ProductCard from "@/components/shop/ProductCard";
import Ic from "@/components/ui/Ic";
import ReviewSection from "@/components/product/ReviewSection";

export default function ProductPage() {
  const { id }   = useParams<{ id: string }>();
  const { addCart, toggleWish, inWish, setCartOpen } = useCart();
  const toast    = useToast();

  const [p,         setP]        = useState<Product | null>(null);
  const [related,   setRelated]  = useState<Product[]>([]);
  const [loading,   setLoading]  = useState(true);
  const [imgIdx,    setImgIdx]   = useState(0);
  const [selColor,  setSelColor] = useState(0);
  const [selSize,   setSelSize]  = useState("");
  const [qty,       setQty]      = useState(1);
  const [tab,       setTab]      = useState<"desc" | "spec" | "ship">("desc");
  const [copied,    setCopied]   = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: row } = await supabase.from("products").select("*").eq("id", id).single();
      if (row) {
        const norm = normalise(row) as Product;
        setP(norm);
        setSelSize(norm.sizes?.[0] ?? "");
        const { data: rel } = await supabase.from("products").select("*")
          .eq("is_active", true).eq("cat", norm.cat).neq("id", norm.id).limit(6);
        setRelated((rel ?? []).map(normalise).filter(Boolean) as Product[]);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <ProductSkeleton />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[200, 80, 120, 60, 100].map((h, i) => (
            <div key={i} className="shimmer" style={{ height: h, borderRadius: 8 }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!p) return <EmptyState icon="🔍" title="পণ্য পাওয়া যায়নি" sub="এই পণ্যটি আর পাওয়া যাচ্ছে না।" action="শপে ফিরুন" onAction={() => window.location.href = "/"} />;

  const d     = pct(p.price, p.was);
  const wished = inWish(p.id);
  const gal   = p.gallery.filter(Boolean);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 20px 80px" }}>
      <style>{`
        .shimmer{background:linear-gradient(90deg,#141422 25%,#2A2A42 50%,#141422 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .playfair{font-family:'Playfair Display',Georgia,serif}
        .fade-in{animation:fadeIn .3s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20, fontSize: 12, color: T.muted }}>
        <Link href="/" style={{ color: T.muted }}>শপ</Link>
        <span>›</span>
        <Link href={`/?cat=${p.cat}`} style={{ color: T.muted }}>{p.cat}</Link>
        <span>›</span>
        <span style={{ color: T.champagne }}>{p.name.slice(0, 40)}{p.name.length > 40 ? "…" : ""}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 48 }}>
        {/* ── Image Gallery ── */}
        <div>
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: T.raised, aspectRatio: "4/3" }}>
            <SafeImg src={gal[imgIdx] || p.img} alt={p.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {d >= 10 && <Badge text={`-${d}%`} type="danger" style={{ position: "absolute", top: 14, left: 14 }} />}
            {p.is_featured && <Badge text="FEATURED" type="gold" style={{ position: "absolute", top: 14, left: d >= 10 ? 72 : 14 }} />}
            {p.stock === 0 && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(8,8,16,.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ background: T.danger, color: "#fff", padding: "8px 24px", borderRadius: 8, fontWeight: 900, fontSize: 18 }}>স্টক শেষ</span>
              </div>
            )}
            {/* Nav arrows */}
            {gal.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i - 1 + gal.length) % gal.length)}
                  style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.6)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic n="chL" s={18} c="#fff"/>
                </button>
                <button onClick={() => setImgIdx(i => (i + 1) % gal.length)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.6)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic n="chR" s={18} c="#fff"/>
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {gal.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>
              {gal.map((src, i) => (
                <div key={i} onClick={() => setImgIdx(i)}
                  style={{ width: 72, height: 72, flexShrink: 0, borderRadius: 9, overflow: "hidden", cursor: "pointer", border: `2px solid ${i === imgIdx ? T.coral : T.border}`, transition: "border-color .15s" }}>
                  <SafeImg src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="fade-in">
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 8px", color: T.muted }}>{p.cat}</span>
            {p.badge && <span style={{ fontSize: 11, background: T.coralG, color: T.coral, borderRadius: 4, padding: "2px 8px" }}>{p.badge}</span>}
          </div>

          <h1 className="playfair" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 10, color: T.champagne }}>{p.name}</h1>

          {p.brand && <p style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>by {p.brand}</p>}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Stars r={p.rating} s={14} />
            <span style={{ fontSize: 13, color: T.muted }}>({p.reviews.toLocaleString()} রিভিউ)</span>
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
            <span className="playfair" style={{ fontSize: 34, fontWeight: 900, color: T.coral }}>{fmt(p.price)}</span>
            {p.was > p.price && <>
              <span style={{ fontSize: 18, color: T.dim, textDecoration: "line-through" }}>{fmt(p.was)}</span>
              <span style={{ fontSize: 13, color: T.ok, fontWeight: 700 }}>৳{(p.was - p.price).toLocaleString()} সাশ্রয়</span>
            </>}
          </div>

          {/* Stock */}
          {p.stock > 0 && p.stock <= 10 && (
            <div style={{ background: T.gold+"15", border: `1px solid ${T.gold}33`, borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 13, color: T.gold, fontWeight: 700 }}>
              ⚠ মাত্র {p.stock} টি বাকি!
            </div>
          )}

          {/* Colors */}
          {p.colors && p.colors.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 12, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>রঙ: <span style={{ color: T.champagne, fontWeight: 700 }}>{p.colors[selColor]}</span></p>
              <div style={{ display: "flex", gap: 8 }}>
                {p.colors.map((c, i) => (
                  <button key={c} onClick={() => setSelColor(i)}
                    style={{ width: 30, height: 30, borderRadius: "50%", border: `3px solid ${i === selColor ? T.coral : T.border}`, cursor: "pointer", background: c.toLowerCase(), transition: "border-color .15s" }} title={c}/>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {p.sizes && p.sizes.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 12, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>সাইজ</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {p.sizes.map(s => (
                  <button key={s} onClick={() => setSelSize(s)}
                    style={{ padding: "7px 16px", background: selSize === s ? T.coral : T.raised, border: `1px solid ${selSize === s ? T.coral : T.border}`, borderRadius: 8, color: selSize === s ? "#000" : T.champagne, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", transition: "all .15s" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>পরিমাণ</p>
            <QtyStepper qty={qty} onDec={() => setQty(q => Math.max(1, q - 1))} onInc={() => setQty(q => Math.min(p.stock, q + 1))} max={p.stock} />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <Btn sz="lg" style={{ flex: 1, minWidth: 160 }}
              disabled={p.stock === 0}
              onClick={() => {
                if (p.stock > 0) {
                  addCart(p, qty, selSize, p.colors?.[selColor]);
                  toast(`${p.name.slice(0, 22)}… ব্যাগে যোগ! 🛍️`);
                  setCartOpen(true);
                }
              }}>
              <Ic n="cart" s={18} c="#000" /> {p.stock === 0 ? "স্টক শেষ" : "ব্যাগে যোগ করুন"}
            </Btn>
            <button onClick={() => { toggleWish(p.id); toast(wished ? "উইশলিস্ট থেকে বাদ" : "উইশলিস্টে যোগ ❤️"); }}
              style={{ padding: "0 18px", background: wished ? T.danger+"11" : T.raised, border: `1px solid ${wished ? T.danger : T.border}`, borderRadius: 10, cursor: "pointer", transition: "all .2s" }}>
              <Ic n="heart" s={20} c={wished ? T.danger : T.muted} solid={wished} />
            </button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ padding: "0 16px", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, cursor: "pointer" }}>
              <Ic n={copied ? "check" : "share"} s={18} c={copied ? T.ok : T.muted} />
            </button>
          </div>

          {/* Delivery info */}
          <div style={{ background: T.raised, borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>ডেলিভারি অপশন</p>
            {DELIVERY_OPTS.map(o => (
              <div key={o.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 13 }}>{o.icon} {o.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: o.cost === 0 ? T.ok : T.champagne }}>{o.cost === 0 ? "বিনামূল্যে" : fmt(o.cost)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Tabs ── */}
      <div style={{ borderBottom: `1px solid ${T.border}`, display: "flex", gap: 0, marginBottom: 24 }}>
        {([["desc","বিবরণ"],["spec","স্পেসিফিকেশন"],["ship","শিপিং"]] as const).map(([k,l])=>(
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: "12px 24px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab===k?700:400, color: tab===k?T.coral:T.muted, borderBottom: `2px solid ${tab===k?T.coral:"transparent"}`, transition: "all .15s", fontFamily: "inherit" }}>
            {l}
          </button>
        ))}
      </div>

      {tab==="desc" && (
        <div style={{ color: T.cream, lineHeight: 1.8, fontSize: 14, maxWidth: 720 }}>
          {p.desc ? p.desc : <span style={{ color: T.muted }}>বিবরণ পাওয়া যায়নি।</span>}
        </div>
      )}
      {tab==="spec" && (
        <div style={{ maxWidth: 480 }}>
          {[["ক্যাটাগরি",p.cat],["ব্র্যান্ড",p.brand||"—"],["স্টক",`${p.stock} টি`],["রেটিং",`${p.rating}/5`]].map(([k,v])=>(
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
              <span style={{ color: T.muted }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      )}
      {tab==="ship" && (
        <div style={{ maxWidth: 540, fontSize: 13, lineHeight: 1.8, color: T.cream }}>
          <p>📦 সাধারণ ডেলিভারি: ৩–৫ কার্যদিবস (বিনামূল্যে ৳৯৯৯+ এ)</p>
          <p>⚡ এক্সপ্রেস: ১–২ কার্যদিবস (+৳৮০)</p>
          <p>🏍️ ঢাকায় একই দিনে: +৳১২০</p>
          <p style={{ marginTop: 12, color: T.muted }}>বিকাশ, নগদ, রকেট ও ক্যাশ অন ডেলিভারি গ্রহণযোগ্য।</p>
        </div>
      )}

      {/* ── Reviews ── */}
      <div style={{ marginTop: 48 }}>
        <ReviewSection productId={Number(id)} />
      </div>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <SectionHead title="সম্পর্কিত পণ্য" sub="আপনার পছন্দ হতে পারে" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
            {related.map(r => <ProductCard key={r.id} p={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
