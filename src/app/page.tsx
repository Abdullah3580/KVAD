"use client";
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { normalise, fmt, pct } from "@/lib/constants";
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

/* ── Product Row with Glass Effect ── */
function ProductRow({ p }: { p: Product }) {
  const { addCart, toggleWish, inWish, setCartOpen } = useCart();
  const toast = useToast();
  const wished = inWish(p.id);
  const d = pct(p.price, p.was);

  return (
    <div className="glass-card p-6 flex gap-6 group border border-border/50 hover:border-border/70 transition-all duration-300">
      <div className="relative flex-shrink-0">
        <Link href={`/product/${p.id}`}>
          <SafeImg 
            src={p.img} 
            alt={p.name}
            className="w-[148px] h-[118px] object-cover rounded-2xl" 
          />
        </Link>

        {d >= 10 && (
          <span className="absolute top-3 left-3 bg-destructive text-white text-xs font-bold px-3 py-1 rounded-xl">
            -{d}%
          </span>
        )}

        {p.stock === 0 && (
          <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center">
            <span className="bg-destructive px-4 py-1.5 rounded-xl text-sm font-bold">শেষ</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pt-1">
        <div className="flex gap-2 flex-wrap mb-3">
          {p.cat && <span className="text-xs bg-muted/80 px-3 py-1 rounded-full text-muted-foreground backdrop-blur-sm">{p.cat}</span>}
          {p.badge && <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">{p.badge}</span>}
        </div>

        <Link href={`/product/${p.id}`}>
          <h3 className="playfair text-[17px] font-semibold leading-tight mb-2 hover:text-primary transition-colors">
            {p.name}
          </h3>
        </Link>

        {p.brand && <p className="text-xs text-muted-foreground mb-3">by {p.brand}</p>}

        <p className="text-sm text-muted-foreground line-clamp-3 mb-5">
          {(p.desc || "").slice(0, 145)}{(p.desc || "").length > 145 ? "…" : ""}
        </p>

        <div className="flex items-center gap-3">
          <Stars r={p.rating} s={14} />
          <span className="text-xs text-muted-foreground">({p.reviews})</span>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <div className="text-right">
          <p className="playfair text-2xl font-bold">{fmt(p.price)}</p>
          {p.was > p.price && (
            <>
              <p className="text-sm text-muted-foreground line-through">{fmt(p.was)}</p>
              <p className="text-xs text-success">সাশ্রয় {fmt(p.was - p.price)}</p>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/product/${p.id}`} className="glass-card p-3 hover:bg-white/5 transition-colors">
            <Ic n="eye" s={18} />
          </Link>
          <button
            onClick={() => { toggleWish(p.id); toast(wished ? "উইশলিস্ট থেকে বাদ" : "উইশলিস্টে যোগ ❤️"); }}
            className="glass-card p-3 hover:bg-white/5 transition-colors"
          >
            <Ic n="heart" s={18} c={wished ? "text-destructive" : ""} solid={wished} />
          </button>
          <Btn 
            sz="sm" 
            onClick={() => { 
              if (p.stock > 0) { 
                addCart(p); 
                toast(`যোগ হয়েছে! 🛍️`); 
                setCartOpen(true); 
              } 
            }} 
            disabled={p.stock === 0}
          >
            <Ic n="cart" s={15} /> {p.stock === 0 ? "শেষ" : "যোগ"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* Floating Cart Button */
function CartFab() {
  const { cartCount, setCartOpen } = useCart();
  if (cartCount === 0) return null;

  return (
    <button
      onClick={() => setCartOpen(true)}
      className="fixed bottom-24 right-6 z-[500] w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
    >
      <Ic n="cart" s={26} c="#000" />
      <span className="absolute -top-1 -right-1 bg-black text-primary text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
        {cartCount}
      </span>
    </button>
  );
}

/* Main Shop Content */
function ShopContent() {
  const params = useSearchParams();
  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  const [cat, setCat] = useState(params.get("cat") ?? "All");
  const [sort, setSort] = useState(params.get("sort") ?? "featured");
  const [maxP, setMaxP] = useState(10000);
  const [minR, setMinR] = useState(0);
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [cols, setCols] = useState<3 | 4>(4);
  const [showF, setShowF] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  // Fetch Products
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setFetchErr(null);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("id", { ascending: false });

        if (error) throw error;
        setAll((data ?? []).map(normalise).filter(Boolean) as Product[]);
      } catch (e: any) {
        setFetchErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const catCounts = useMemo(() => {
    const cats = ["All", "Bags", "Saree", "Panjabi", "Others"];
    return Object.fromEntries(
      cats.map(c => [c, c === "All" ? all.length : all.filter(p => p.cat === c).length])
    );
  }, [all]);

  const products = useMemo(() => {
    const q = search.toLowerCase();
    return all
      .filter(p => cat === "All" || p.cat === cat)
      .filter(p => p.price <= maxP)
      .filter(p => p.rating >= minR)
      .filter(p => !q || [p.name, p.cat, p.brand, p.desc].some(v => v?.toLowerCase().includes(q)))
      .sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "rating") return b.rating - a.rating;
        if (sort === "discount") return pct(b.price, b.was) - pct(a.price, b.was);
        if (sort === "newest") return b.id - a.id;
        return 0;
      });
  }, [all, cat, maxP, minR, search, sort]);

  const paged = products.slice(0, page * PER_PAGE);
  const hasMore = paged.length < products.length;

  const resetAll = useCallback(() => {
    setCat("All");
    setMinR(0);
    setMaxP(10000);
    setSearch("");
    setPage(1);
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto">
      <HeroBanner />

      {/* Category Showcase - Glass Effect */}
      <div className="px-5 pt-7">
        <SectionHead title="সব ক্যাটাগরি" action="সব পণ্য দেখুন" actionHref="/" />
        <div className="glass-card p-6">
          <CategoryShowcase counts={catCounts} />
        </div>
      </div>

      {/* Flash Sale - Glass Effect */}
      {!loading && all.length > 0 && (
        <div className="px-5 pt-6">
          <div className="glass-card p-6">
            <FlashSale products={all} />
          </div>
        </div>
      )}

      {/* Main Shop Section */}
      <div id="all-products" className="px-5 py-10 flex gap-6">
        {showF && (
          <div className="glass-card p-6 w-80 flex-shrink-0">
            <FilterSidebar 
              cat={cat} 
              setCat={c => { setCat(c); setPage(1); }}
              maxP={maxP} 
              setMaxP={setMaxP} 
              minR={minR} 
              setMinR={setMinR}
              counts={catCounts} 
              onReset={resetAll} 
              loading={loading} 
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <SectionHead 
            title="সকল পণ্য" 
            sub={`${all.length} টি পণ্য উপলব্ধ`} 
          />

          {/* ShopToolbar wrapped in glass */}
          <div className="glass-card p-4 mb-6">
            <ShopToolbar
              count={products.length}
              sort={sort}
              setSort={s => { setSort(s); setPage(1); }}
              view={view}
              setView={setView}
              cols={cols}
              setCols={setCols}
              showFilter={showF}
              setShowFilter={setShowF}
              cat={cat}
              minR={minR}
              maxP={maxP}
              search={search}
              onRemoveCat={() => setCat("All")}
              onRemoveRating={() => setMinR(0)}
              onRemovePrice={() => setMaxP(10000)}
              onRemoveSearch={() => setSearch("")}
              onResetAll={resetAll}
            />
          </div>

          {/* Grid or List View */}
          {!loading && products.length > 0 && (
            view === "grid" ? (
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-6`}>
                {paged.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {paged.map(p => <ProductRow key={p.id} p={p} />)}
              </div>
            )
          )}

          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="text-center mt-12">
              <Btn sz="lg" onClick={() => setPage(p => p + 1)}>
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
    <Suspense fallback={<div className="h-screen flex items-center justify-center">লোড হচ্ছে...</div>}>
      <ShopContent />
      <CartFab />
    </Suspense>
  );
}