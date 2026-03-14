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
  const [pincode,   setPincode]  = useState("");
  const [pinMsg,    setPinMsg]   = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: row } = await supabase.from("products").select("*").eq("id", id).single();
      if (row) {
        const norm = normalise(row) as Product;
        setP(norm);
        setSelSize(norm.sizes?.[0] ?? "");
        /* related */
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

  if (!p) return <EmptyState icon="🔍" title="পণ্য পাওয়া যায়নি" sub="এই পণ্যটি আর পাওয়া যাচ্ছে না।" action="শপে ফিরুন" onAction={() => window.location.href = "/shop"} />;

  const d     = pct(p.price, p.was);
  const wished = inWish(p.id);
  const gal   = p.gallery.filter(Boolean);

  const checkPin = () => {
    if (!pincode.trim()) { setPinMsg("পিন কোড লিখুন"); return; }
    setPinMsg(Math.random() > .3 ? "✓ এই এলাকায় ডেলিভারি হয় (২–৪ দিন)" : "⚠ এই এলাকায় শুধু COD পাওয়া যাবে");
  };

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
      <nav style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: T.muted }}>
        <Link href="/shop" style={{ color: T.muted }}>শপ</Link>
        <span>›</span>
        <Link href={`/shop?cat=${p.cat}`} style={{ color: T.muted }}>{p.cat}</Link>
        <span>›</span>
        <span style={{ color: T.champagne }}>{p.name.slice(0, 40)}{p.name.length > 40 ? "…" : ""}</span>
      </nav>

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 60 }}>
        {/* LEFT — Gallery */}
        <div>
          <div style={{ position: "relative", paddingTop: "100%", borderRadius: 20, overflow: "hidden", background: T.raised, marginBottom: 12 }}>
            <SafeImg src={gal[imgIdx] ?? p.img} alt={p.name}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

            {/* Badges */}
            <div style={{ position: "absolute", top: 14, left: 14, display: "flex", flexDirection: "column", gap: 5 }}>
              {p.badge && <Badge text={p.badge} />}
              {d >= 10  && <Badge text={`-${d}%`} type="danger" />}
              {p.is_featured && <Badge text="TOP" type="gold" />}
            </div>

            {/* Arrows */}
            {gal.length > 1 && <>
              <button onClick={() => setImgIdx(i => (i - 1 + gal.length) % gal.length)}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(8,8,16,.8)", border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic n="chL" s={17} c={T.champagne} />
              </button>
              <button onClick={() => setImgIdx(i => (i + 1) % gal.length)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(8,8,16,.8)", border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic n="chR" s={17} c={T.champagne} />
              </button>
            </>}
          </div>

          {/* Thumbnails */}
          {gal.length > 1 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
              {gal.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  style={{ width: 72, height: 60, borderRadius: 8, overflow: "hidden", border: `2px solid ${i === imgIdx ? T.coral : T.border}`, cursor: "pointer", padding: 0, flexShrink: 0 }}>
                  <SafeImg src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
              {p.cat}{p.sub ? ` / ${p.sub}` : ""}
              {p.brand && <span style={{ color: T.coral }}> · {p.brand}</span>}
            </p>
            <h1 className="playfair" style={{ fontWeight: 700, fontSize: "clamp(20px,3vw,30px)", lineHeight: 1.2, marginBottom: 10 }}>{p.name}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Stars r={p.rating} />
              <span style={{ fontSize: 13, color: T.muted }}>{p.rating.toFixed(1)} · {p.reviews.toLocaleString()} রিভিউ</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button onClick={() => { toggleWish(p.id); toast(wished ? "উইশলিস্ট থেকে বাদ" : "উইশলিস্টে যোগ ❤️"); }}
                  style={{ background: wished ? T.danger + "11" : "none", border: `1px solid ${wished ? T.danger : T.border}`, borderRadius: 8, padding: "7px 11px", cursor: "pointer" }}>
                  <Ic n="heart" s={17} c={wished ? T.danger : T.muted} solid={wished} />
                </button>
                <button onClick={() => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); toast("লিঙ্ক কপি হয়েছে!"); }}
                  style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 11px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: copied ? T.ok : T.muted }}>
                  <Ic n={copied ? "check" : "copy"} s={14} c={copied ? T.ok : T.muted} />
                  {copied ? "কপি!" : "শেয়ার"}
                </button>
              </div>
            </div>
          </div>

          {/* Price block */}
          <div style={{ background: T.raised, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "baseline", gap: 14 }}>
            <span className="playfair" style={{ fontSize: 36, fontWeight: 800, color: T.coral }}>{fmt(p.price)}</span>
            {p.was > p.price && <>
              <span style={{ fontSize: 18, color: T.dim, textDecoration: "line-through" }}>{fmt(p.was)}</span>
              <span style={{ fontSize: 14, color: T.ok, fontWeight: 700 }}>সাশ্রয় {fmt(p.was - p.price)} ({d}%)</span>
            </>}
          </div>

          {/* Colors */}
          {p.colors?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>রঙ বেছে নিন</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {p.colors.map((col, i) => (
                  <button key={i} onClick={() => setSelColor(i)} title={col}
                    style={{ width: 32, height: 32, borderRadius: "50%", background: col, border: `3px solid ${i === selColor ? T.coral : T.border}`, cursor: "pointer" }} />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {p.sizes?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>সাইজ বেছে নিন</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {p.sizes.map(sz => (
                  <button key={sz} onClick={() => setSelSize(sz)}
                    style={{
                      padding: "8px 18px", background: selSize === sz ? T.coral : T.raised,
                      border: `1px solid ${selSize === sz ? T.coral : T.border}`,
                      borderRadius: 8, color: selSize === sz ? "#000" : T.cream,
                      cursor: "pointer", fontFamily: "inherit", fontSize: 14,
                      fontWeight: selSize === sz ? 800 : 400, transition: "all .15s",
                    }}>{sz}</button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Stock */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <QtyStepper qty={qty} onDec={() => setQty(q => Math.max(1, q - 1))} onInc={() => setQty(q => Math.min(p.stock, q + 1))} max={p.stock} />
            <span style={{ fontSize: 13, color: p.stock === 0 ? T.danger : p.stock < 10 ? T.gold : T.ok }}>
              {p.stock === 0 ? "স্টক নেই ❌" : p.stock < 10 ? `⚠ মাত্র ${p.stock} টি` : "✓ স্টকে আছে"}
            </span>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn v="coral" full sz="lg" disabled={p.stock === 0}
              onClick={() => { addCart(p, qty, selSize || undefined, p.colors?.[selColor]); toast(`${p.name.slice(0, 22)}… ব্যাগে যোগ! 🛍️`); setCartOpen(true); }}>
              <Ic n="cart" s={17} /> {p.stock === 0 ? "স্টক নেই" : "ব্যাগে যোগ করুন"}
            </Btn>
            <Btn v="outline" sz="lg" disabled={p.stock === 0}
              onClick={() => { addCart(p, qty, selSize || undefined, p.colors?.[selColor]); window.location.href = "/checkout"; }}>
              এখনই কিনুন
            </Btn>
          </div>

          {/* Pincode checker */}
          <div style={{ background: T.raised, borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🚚 ডেলিভারি চেক করুন</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={pincode} onChange={e => setPincode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && checkPin()}
                placeholder="পোস্ট কোড / এলাকা"
                style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", color: T.champagne, fontSize: 13, fontFamily: "inherit" }} />
              <Btn sz="sm" v="dark" onClick={checkPin}>চেক</Btn>
            </div>
            {pinMsg && <p style={{ fontSize: 12, color: pinMsg.startsWith("✓") ? T.ok : T.gold, marginTop: 8 }}>{pinMsg}</p>}
          </div>

          {/* Delivery options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DELIVERY_OPTS.map(o => (
              <div key={o.key} style={{ display: "flex", gap: 12, padding: "10px 14px", background: T.raised, borderRadius: 9, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>{o.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 13 }}>{o.label}</p>
                </div>
                <span style={{ fontWeight: 700, fontSize: 13, color: o.cost === 0 ? T.ok : T.champagne }}>
                  {o.cost === 0 ? "বিনামূল্যে" : fmt(o.cost)}
                </span>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[["🔒", "নিরাপদ পেমেন্ট"], ["💯", "১০০% অরিজিনাল"], ["🔄", "৩০ দিন রিটার্ন"], ["📦", "দ্রুত ডেলিভারি"]].map(([ic, l]) => (
              <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.muted }}>
                <span>{ic}</span>{l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description tabs */}
      <div style={{ background: T.card, borderRadius: 18, border: `1px solid ${T.border}`, padding: 28, marginBottom: 48 }}>
        <div style={{ display: "flex", gap: 2, marginBottom: 22, background: T.raised, borderRadius: 10, padding: 5, maxWidth: 360 }}>
          {([["desc", "বিবরণ"], ["spec", "বিস্তারিত"], ["ship", "ডেলিভারি"]] as [string, string][]).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t as any)}
              style={{
                flex: 1, padding: "8px", borderRadius: 7, border: "none",
                cursor: "pointer", background: tab === t ? T.card : "transparent",
                color: tab === t ? T.champagne : T.muted,
                fontFamily: "inherit", fontSize: 13, fontWeight: 700, transition: "all .15s",
              }}>{l}</button>
          ))}
        </div>

        {tab === "desc" && (
          <div>
            <p style={{ fontSize: 14, color: T.cream, lineHeight: 1.9 }}>{p.desc || "পণ্যের বিবরণ শীঘ্রই যোগ করা হবে।"}</p>
            {/* Feature list */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
              {["প্রিমিয়াম মানের উপকরণ", "দীর্ঘস্থায়ী ব্যবহারযোগ্য", "হ্যান্ডক্র্যাফটেড", "গ্যারান্টিযুক্ত"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.cream }}>
                  <span style={{ color: T.ok }}>✓</span>{f}
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "spec" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["ক্যাটাগরি", p.cat], ["ব্র্যান্ড", p.brand || "KVAD"],
              ["সাব-ক্যাটাগরি", p.sub || "—"], ["স্টক", `${p.stock} টি`],
              ["রেটিং", `${p.rating.toFixed(1)} / 5`], ["রিভিউ", p.reviews.toLocaleString()],
            ].map(([k, v]) => (
              <div key={k as string} style={{ padding: "12px 16px", background: T.raised, borderRadius: 9 }}>
                <p style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>{k}</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>{v}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "ship" && (
          <div>
            <p style={{ fontSize: 14, color: T.cream, lineHeight: 1.9, marginBottom: 16 }}>
              ঢাকার মধ্যে সাধারণত ১–২ দিনে, বাইরে ৩–৫ দিনে ডেলিভারি পাওয়া যায়।
              ৳৯৯৯+ অর্ডারে বিনামূল্যে স্ট্যান্ডার্ড ডেলিভারি।
            </p>
            {DELIVERY_OPTS.map(o => (
              <div key={o.key} style={{ display: "flex", gap: 14, padding: "12px 16px", background: T.raised, borderRadius: 10, marginBottom: 8, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>{o.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{o.label}</p>
                </div>
                <span style={{ fontWeight: 700, color: o.cost === 0 ? T.ok : T.champagne }}>{o.cost === 0 ? "বিনামূল্যে" : fmt(o.cost)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <SectionHead title={`আরও ${p.cat} পণ্য`} sub="আপনার পছন্দ হতে পারে" action="সব দেখুন" actionHref={`/shop?cat=${p.cat}`} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
            {related.map(r => <ProductCard key={r.id} p={r} />)}
          </div>
        </div>
      )}
      <ReviewSection productId={Number(id)} />
    </div>
  );
}
