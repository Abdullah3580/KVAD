"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingCart, Star, Plus, Sun, Moon, CheckCircle2 } from "lucide-react";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";

// ১. প্রোডাক্ট এবং কার্ট আইটেমের জন্য ইন্টারফেস তৈরি (এরর ফিক্স করার মূল চাবিকাঠি)
interface Product {
  id: string;
  name: string;
  price: number;
  cat: string;
  rating: number;
  images: string[];
}

interface CartItem extends Product {
  qty: number;
}

export default function ShopPage() {
  const [isDark, setIsDark] = useState(true);
  
  // ২. স্টেটগুলোতে টাইপ ডিফাইন করা <Product[]> এবং <CartItem[]>
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [cartOpen, setCO] = useState(false);
  const [activeCat, setCat] = useState("Bags");
  const [checkoutOpen, setCHK] = useState(false);
  const [orderDone, setOD] = useState(false);

  const T = {
    bg: isDark ? "#080810" : "#F9FAFB",
    card: isDark ? "#0E0E18" : "#FFFFFF",
    raised: isDark ? "#141422" : "#F3F4F6",
    border: isDark ? "#1E1E30" : "#E5E7EB",
    text: isDark ? "#F2E8D9" : "#111827",
    muted: isDark ? "#6E6E88" : "#6B7280",
    coral: "#FF6B4A",
    gold: "#F5C842",
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').eq('is_active', true);
    
    // ডাটা ম্যাপ করার সময় টাইপ নিশ্চিত করা
    const normalised: Product[] = (data || []).map(p => ({
      id: p.id, 
      name: p.product_name || p.name, 
      price: Number(p.sale_price || p.price), 
      cat: p.category_name || p.cat || "Others",
      rating: p.rating_avg || p.rating || 5.0, 
      images: p.images || []
    }));
    
    setProducts(normalised);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ৩. প্যারামিটার 'p' কে Product টাইপ দেওয়া হয়েছে
  const addToCart = (p: Product) => {
    setCart((prev: CartItem[]) => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
    setCO(true);
  };

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  return (
    <div style={{ backgroundColor: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: T.bg + "EE", backdropFilter: "blur(15px)", borderBottom: `1px solid ${T.border}`, padding: "20px 28px" }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: T.coral }}>KVAD</span>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div onClick={() => setIsDark(!isDark)} style={{ cursor: "pointer" }}>{isDark ? <Sun size={22} /> : <Moon size={22} />}</div>
            <div onClick={() => setCO(true)} style={{ position: "relative", cursor: "pointer" }}>
              <ShoppingCart size={22} />
              {cart.length > 0 && <span style={{ position: "absolute", top: -8, right: -8, background: T.coral, color: "#fff", fontSize: 10, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{cart.length}</span>}
            </div>
          </div>
        </div>
      </nav>

      {/* ── HEADER & TABS ── */}
      <header style={{ padding: "60px 28px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900 }}>Exquisite Collection</h1>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 30, flexWrap: "wrap" }}>
          {["Bags", "Saree", "Panjabi", "All"].map(cat => (
            <button key={cat} onClick={() => setCat(cat)} style={{ padding: "10px 25px", borderRadius: 30, background: activeCat === cat ? T.coral : T.card, color: activeCat === cat ? "#fff" : T.muted, border: `1px solid ${T.border}`, cursor: "pointer", transition: "0.3s" }}>{cat}</button>
          ))}
        </div>
      </header>

      {/* ── GRID ── */}
      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 30 }}>
        {products.filter(p => activeCat === "All" || p.cat === activeCat).map(p => (
          <div key={p.id} style={{ background: T.card, borderRadius: 24, overflow: "hidden", border: `1px solid ${T.border}` }}>
            <img src={p.images?.[0]} alt={p.name} style={{ width: "100%", height: 350, objectFit: "cover" }} />
            <div style={{ padding: 25 }}>
              <h3 style={{ fontWeight: 800 }}>{p.name}</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: T.coral }}>৳{p.price.toLocaleString()}</span>
                <button onClick={() => addToCart(p)} style={{ background: T.text, color: T.bg, border: "none", padding: "8px 15px", borderRadius: 10, cursor: "pointer", fontWeight: "bold" }}>Add +</button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* ── OVERLAYS (COMPONENTS) ── */}
      {cartOpen && <CartDrawer cart={cart} T={T} onClose={() => setCO(false)} onCheckout={() => { setCO(false); setCHK(true); }} />}
      
      {checkoutOpen && <CheckoutModal cartTotal={cartTotal} T={T} onCancel={() => setCHK(false)} onSuccess={() => { setCHK(false); setOD(true); setCart([]); }} />}

      {orderDone && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle2 size={80} color={T.coral} />
          <h2 style={{ marginTop: 20, fontWeight: 900 }}>Order Success!</h2>
          <button onClick={() => setOD(false)} style={{ marginTop: 30, background: T.coral, color: "#fff", padding: "12px 30px", borderRadius: 10, border: "none", cursor: "pointer" }}>Back to Shop</button>
        </div>
      )}
    </div>
  );
}