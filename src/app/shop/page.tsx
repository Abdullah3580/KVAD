"use client";
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { T, normalise, fmt, pct } from "@/lib/constants";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import HeroBanner from "@/components/shop/HeroBanner";
import ProductCard from "@/components/shop/ProductCard";
import { FlashSale, CategoryShowcase, FilterSidebar, ShopToolbar } from "@/components/shop/ShopUI";
import { ProductSkeleton, SectionHead, EmptyState, SafeImg, Btn } from "@/components/ui";
import { Stars } from "@/components/ui/Ic";
import Ic from "@/components/ui/Ic";
import Link from "next/link";

/* ── Product Row (list view) ── */
function ProductRow({ p }: { p: Product }) {
  const { addCart, toggleWish, inWish, setCartOpen } = useCart();
  const toast = useToast();
  const wished = inWish(p.id);
  const d = pct(p.price, p.was);

  return (
    <div style={{
      display: "flex", gap: 16, padding: 16,
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 13, alignItems: "flex-start",
      transition: "border-color .2s, box-shadow .2s",
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = T.borderLt; el.style.boxShadow = "0 8px 40px rgba(0,0,0,.6)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = T.border; el.style.boxShadow = "none"; }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Link href={`/product/${p.id}`}>
          <SafeImg src={p.img} alt={p.name}
            style={{ width: 140, height: 110, objectFit: "cover", borderRadius: 10, background: T.raised, cursor: "pointer" }} />
        </Link>
        {d >= 10 && <span style={{ position: "absolute", top: 7, left: 7, background: T.danger, color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 7px", borderRadius: 4 }}>-{d}%</span>}
        {p.stock === 0 && <div style={{ position: "absolute", inset: 0, background: "rgba(8,8,16,.65)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ background: T.danger, color: "#fff", fontSize: 11, fontWeight: 900, padding: "3px 8px", borderRadius: 4 }}>শেষ</span></div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 5, marginBottom: 5, flexWrap: "wrap" }}>
          {p.cat && <span style={{ fontSize: 10, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 4, padding: "1px 7px", color: T.muted }}>{p.cat}</span>}
          {p.badge && <span style={{ fontSize: 10, background: T.coral + "22", color: T.coral, border: `1px solid var(--coral-g)`, borderRadius: 4, padding: "1px 7px" }}>{p.badge}</span>}
        </div>
        <Link href={`/product/${p.id}`}>
          <h3 className="playfair" style={{ fontWeight: 600, fontSize: 17, marginBottom: 4, color: T.champagne, lineHeight: 1.3, cursor: "pointer" }}>{p.name}</h3>
        </Link>
        {p.brand && <p style={{ fontSize: 12, color: T.muted, marginBottom: 5 }}>by {p.brand}</p>}
        <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.7, marginBottom: 6 }}>
          {(p.desc || "").slice(0, 140)}{(p.desc || "").length > 140 ? "…" : ""}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Stars r={p.rating} s={12} />
          <span style={{ fontSize: 11, color: T.muted }}>({p.reviews.toLocaleString()})</span>
          {p.stock > 0 && p.stock <= 10 && <span style={{ fontSize: 11, color: T.gold, fontWeight: 700 }}>· মাত্র {p.stock} টি!</span>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
        <div style={{ textAlign: "right" }}>
          <p className="playfair" style={{ fontSize: 22, fontWeight: 800, color: T.coral }}>{fmt(p.price)}</p>
          {p.was > p.price && <>
            <p style={{ fontSize: 12, color: T.dim, textDecoration: "line-through" }}>{fmt(p.was)}</p>
            <p style={{ fontSize: 11, color: T.ok }}>সাশ্রয় {fmt(p.was - p.price)}</p>
          </>}
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          <Link href={`/product/${p.id}`}
            style={{ padding: "8px 12px", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, display: "flex", alignItems: "center" }}>
            <Ic n="eye" s={15} />
          </Link>
          <button onClick={() => { toggleWish(p.id); toast(wished ? "উইশলিস্ট থেকে বাদ" : "উইশলিস্টে যোগ ❤️"); }}
            style={{ padding: "8px 12px", background: wished ? T.danger + "11" : T.raised, border: `1px solid ${wished ? T.danger : T.border}`, borderRadius: 8, cursor: "pointer" }}>
            <Ic n="heart" s={15} c={wished ? T.danger : T.muted} solid={wished} />
          </button>
          <Btn sz="sm" onClick={() => { if (p.stock > 0) { addCart(p); toast(`যোগ হয়েছে! 🛍️`); setCartOpen(true); } }} disabled={p.stock === 0}>
            <Ic n="cart" s={13} />{p.stock === 0 ? "শেষ" : "যোগ"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ── Floating cart FAB ── */
function CartFab() {
  const { cartCount, setCartOpen } = useCart();
  if (cartCount === 0) return null;
  return (
    <button onClick={() => setCartOpen(true)} className="scale-in"
      style={{
        position: "fixed", bottom: 88, right: 20, zIndex: 500,
        width: 58, height: 58, borderRadius: "50%",
        background: T.coral, border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 8px 32px ${T.coralG}`, cursor: "pointer",
      }}>
      <Ic n="cart" s={24} c="#000" />
      <span style={{
        position: "absolute", top: 6, right: 6,
        background: "#000", color: T.coral, borderRadius: "50%",
        width: 18, height: 18, fontSize: 9, fontWeight: 900,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{cartCount}</span>
    </button>
  );
}

/* ══════════════════ MAIN SHOP ══════════════════ */
function ShopContent() {
  const params = useSearchParams();
  const [all,     setAll]     = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr,setFetchErr]= useState<string | null>(null);

  const [cat,    setCat]    = useState(params.get("cat")  ?? "All");
  const [sort,   setSort]   = useState(params.get("sort") ?? "featured");
  const [maxP,   setMaxP]   = useState(10000);
  const [minR,   setMinR]   = useState(0);
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [view,   setView]   = useState<"grid" | "list">("grid");
  const [cols,   setCols]   = useState<3 | 4>(4);
  const [showF,  setShowF]  = useState(true);
  const [page,   setPage]   = useState(1);
  const PER_PAGE = 20;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setFetchErr(null);
        const { data, error } = await supabase
          .from("products").select("*")
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("id", { ascending: false });
        if (error) throw error;
        setAll((data ?? []).map(normalise).filter(Boolean) as Product[]);
      } catch (e: any) { setFetchErr(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const catCounts = useMemo(() => Object.fromEntries(
    ["All", ...["Bags", "Saree", "Panjabi", "Others"]].map(c => [c, c === "All" ? all.length : all.filter(p => p.cat === c).length])
  ), [all]);

  const products = useMemo(() => {
    const q = search.toLowerCase();
    return all
      .filter(p => cat === "All" || p.cat === cat)
      .filter(p => p.price <= maxP)
      .filter(p => p.rating >= minR)
      .filter(p => !q || [p.name, p.cat, p.sub, p.brand, p.desc].some(v => v?.toLowerCase().includes(q)))
      .sort((a, b) => {
        if (sort === "price-asc")  return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "rating")     return b.rating - a.rating;
        if (sort === "discount")   return pct(b.price, b.was) - pct(a.price, a.was);
        if (sort === "popular")    return b.reviews - a.reviews;
        if (sort === "newest")     return b.id - a.id;
        return 0;
      });
  }, [all, cat, maxP, minR, search, sort]);

  const paged    = products.slice(0, page * PER_PAGE);
  const hasMore  = paged.length < products.length;
  const resetAll = useCallback(() => { setCat("All"); setMinR(0); setMaxP(10000); setSearch(""); setPage(1); }, []);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Hero */}
      <HeroBanner />

      <div style={{ padding: "28px 20px 0" }}>
        {/* Category showcase */}
        <SectionHead title="সব ক্যাটাগরি" action="সব পণ্য দেখুন" actionHref="/shop" />
        <CategoryShowcase counts={catCounts} />
      </div>

      {/* Flash Sale */}
      {!loading && all.length > 0 && (
        <div style={{ padding: "28px 20px 0" }}>
          <FlashSale products={all} />
        </div>
      )}

      {/* Featured */}
      {!loading && all.filter(p => p.is_featured).length > 0 && (
        <div style={{ padding: "28px 20px 0" }}>
          <SectionHead title="ফিচার্ড পণ্য" sub="আমাদের সেরা কিউরেটেড পিক্স" action="সব দেখুন" actionHref="/shop?sort=featured" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
            {all.filter(p => p.is_featured).slice(0, 4).map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {/* Main Shop section */}
      <div id="all-products" style={{ padding: "28px 20px 80px", display: "flex", gap: 24 }}>
        {showF && (
          <FilterSidebar cat={cat} setCat={c => { setCat(c); setPage(1); }}
            maxP={maxP} setMaxP={setMaxP} minR={minR} setMinR={setMinR}
            counts={catCounts} onReset={resetAll} loading={loading} />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <SectionHead title="সকল পণ্য" sub={`${all.length} টি পণ্য উপলব্ধ`} />

          <ShopToolbar
            count={products.length} sort={sort} setSort={s => { setSort(s); setPage(1); }}
            view={view} setView={setView} cols={cols} setCols={setCols}
            showFilter={showF} setShowFilter={setShowF}
            cat={cat} minR={minR} maxP={maxP} search={search}
            onRemoveCat={() => setCat("All")} onRemoveRating={() => setMinR(0)}
            onRemovePrice={() => setMaxP(10000)} onRemoveSearch={() => setSearch("")}
            onResetAll={resetAll}
          />

          {/* Error */}
          {fetchErr && (
            <div style={{ padding: 22, background: T.card, borderRadius: 13, border: `1px solid rgba(255,68,102,.2)`, marginBottom: 18, display: "flex", gap: 12, alignItems: "center" }}>
              <Ic n="warn" s={20} c={T.danger} />
              <div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>পণ্য লোড করা যায়নি</p>
                <p style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>{fetchErr}</p>
                <button onClick={() => window.location.reload()}
                  style={{ fontSize: 12, color: T.coral, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                  <Ic n="refresh" s={13} c={T.coral} /> আবার চেষ্টা করুন
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 16 }}>
              {Array.from({ length: cols * 2 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && !fetchErr && products.length === 0 && (
            <EmptyState icon="🔍" title="পণ্য পাওয়া যায়নি"
              sub="ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন"
              action="সব ফিল্টার বাতিল" onAction={resetAll} />
          )}

          {/* Grid / List */}
          {!loading && !fetchErr && paged.length > 0 && (
            view === "grid"
              ? <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 16 }}>
                  {paged.map(p => <ProductCard key={p.id} p={p} />)}
                </div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {paged.map(p => <ProductRow key={p.id} p={p} />)}
                </div>
          )}

          {/* Load more */}
          {hasMore && !loading && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Btn v="outline" sz="lg" onClick={() => setPage(p => p + 1)}>
                আরও পণ্য দেখুন ({products.length - paged.length} টি বাকি)
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        @keyframes slideInRight{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .fade-in{animation:fadeIn .3s ease forwards}
        .scale-in{animation:scaleIn .26s ease forwards}
        .slide-r{animation:slideInRight .3s cubic-bezier(.25,.46,.45,.94) forwards}
        .playfair{font-family:'Playfair Display',Georgia,serif}
        .shimmer{background:linear-gradient(90deg,#141422 25%,#2A2A42 50%,#141422 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
      `}</style>
      <Suspense>
        <ShopContent />
      </Suspense>
      <CartFab />
    </>
  );
}
