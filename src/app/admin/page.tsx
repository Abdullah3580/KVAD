"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus, Edit, Trash2, Save, X, Package,
  LayoutDashboard, Image as ImageIcon, Tag,
  ToggleLeft, ToggleRight, Star, AlertCircle,
  CheckCircle, RefreshCw, ShoppingBag, TrendingUp,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   KVAD ADMIN PANEL — Full Version
   Products Table columns (from Prisma schema):
   id, name, cat, sub, brand, price, was,
   rating, reviews, badge, stock, images[],
   is_active, is_featured
═══════════════════════════════════════════════════ */

const T = {
  bg:     "#080810",
  card:   "#0E0E18",
  raised: "#141422",
  border: "#1E1E30",
  text:   "#F2E8D9",
  muted:  "#6E6E88",
  dim:    "#363650",
  coral:  "#FF6B4A",
  ok:     "#3DEBA0",
  gold:   "#F5C842",
  danger: "#FF4466",
};

/* ── types ── */
interface Product {
  id: number;
  name: string;
  cat: string | null;
  sub: string | null;
  brand: string | null;
  price: number | null;
  was: number | null;
  rating: number | null;
  reviews: number | null;
  badge: string | null;
  stock: number | null;
  images: string[];
  is_active: boolean | null;
  is_featured: boolean | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string | null;
  total: number;
  shipping_address: string | null;
  created_at: string | null;
  shipping_name: string | null;
}

const CATS = ["Bags", "Saree", "Panjabi", "Electronics", "Beauty", "Home", "Others"];
const BADGES = ["", "NEW", "HOT", "SALE", "LIMITED", "FEATURED"];

/* ── small helpers ── */
const Inp = ({
  label, value, onChange, type = "text", placeholder = "", required = false,
}: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label}{required && <span style={{ color: T.coral }}> *</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8,
        padding: "10px 13px", color: T.text, fontSize: 13,
        fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" as const,
      }}
    />
  </div>
);

const Sel = ({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8,
        padding: "10px 13px", color: T.text, fontSize: 13,
        fontFamily: "inherit", outline: "none", cursor: "pointer",
      }}
    >
      {options.map(o => <option key={o} value={o}>{o || "— None —"}</option>)}
    </select>
  </div>
);

/* ══════════════════════════════════════════════════
   ADD / EDIT PRODUCT MODAL
══════════════════════════════════════════════════ */
function ProductModal({
  initial, onClose, onSaved,
}: {
  initial?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;

  const [form, setForm] = useState({
    name:       initial?.name        ?? "",
    cat:        initial?.cat         ?? "Bags",
    sub:        initial?.sub         ?? "",
    brand:      initial?.brand       ?? "",
    price:      String(initial?.price   ?? ""),
    was:        String(initial?.was     ?? ""),
    stock:      String(initial?.stock   ?? ""),
    rating:     String(initial?.rating  ?? "5.0"),
    reviews:    String(initial?.reviews ?? "0"),
    badge:      initial?.badge       ?? "",
    images:     (initial?.images ?? []).join("\n"),
    is_active:  initial?.is_active   ?? true,
    is_featured: initial?.is_featured ?? false,
  });

  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const set = (key: string) => (v: string | boolean) =>
    setForm(f => ({ ...f, [key]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { setErr("Product name is required."); return; }
    if (!form.price)        { setErr("Price is required."); return; }
    setErr("");
    setSaving(true);

    const payload = {
      name:        form.name.trim(),
      cat:         form.cat   || null,
      sub:         form.sub   || null,
      brand:       form.brand || null,
      price:       parseFloat(form.price) || null,
      was:         parseFloat(form.was)   || null,
      stock:       parseInt(form.stock)   || 0,
      rating:      parseFloat(form.rating) || 5.0,
      reviews:     parseInt(form.reviews)  || 0,
      badge:       form.badge || null,
      images:      form.images.split("\n").map(s => s.trim()).filter(Boolean),
      is_active:   form.is_active,
      is_featured: form.is_featured,
    };

    const { error } = isEdit
      ? await supabase.from("products").update(payload).eq("id", initial!.id)
      : await supabase.from("products").insert([payload]);

    setSaving(false);
    if (error) { setErr("Error: " + error.message); return; }
    onSaved();
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: T.card, borderRadius: 24, width: "100%", maxWidth: 620, border: `1px solid ${T.border}`, maxHeight: "92vh", overflowY: "auto" }}>

        {/* header */}
        <div style={{ padding: "22px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: T.card, zIndex: 1 }}>
          <h2 style={{ fontWeight: 900, fontSize: 20 }}>{isEdit ? "✏️ Edit Product" : "➕ Add New Product"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* error */}
          {err && (
            <div style={{ background: T.danger + "22", border: `1px solid ${T.danger}55`, borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", color: T.danger, fontSize: 13 }}>
              <AlertCircle size={16} /> {err}
            </div>
          )}

          {/* name */}
          <Inp label="Product Name" value={form.name} onChange={set("name")} placeholder="e.g. Premium Leather Bag" required />

          {/* cat + sub */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Sel label="Category" value={form.cat} onChange={set("cat")} options={CATS} />
            <Inp label="Sub-category" value={form.sub} onChange={set("sub")} placeholder="e.g. Tote, Clutch" />
          </div>

          {/* brand + badge */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Inp label="Brand" value={form.brand} onChange={set("brand")} placeholder="e.g. KVAD" />
            <Sel label="Badge" value={form.badge} onChange={set("badge")} options={BADGES} />
          </div>

          {/* price + was */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Inp label="Sale Price (৳)" value={form.price} onChange={set("price")} type="number" placeholder="1200" required />
            <Inp label="Original Price (৳)" value={form.was} onChange={set("was")} type="number" placeholder="1500" />
          </div>

          {/* stock + rating + reviews */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Inp label="Stock" value={form.stock} onChange={set("stock")} type="number" placeholder="50" />
            <Inp label="Rating (0–5)" value={form.rating} onChange={set("rating")} type="number" placeholder="4.5" />
            <Inp label="Reviews" value={form.reviews} onChange={set("reviews")} type="number" placeholder="0" />
          </div>

          {/* images */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Image URLs <span style={{ color: T.dim, fontWeight: 400, textTransform: "none" }}>(one per line)</span>
            </label>
            <textarea
              value={form.images}
              onChange={e => set("images")(e.target.value)}
              placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
              rows={4}
              style={{
                background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8,
                padding: "10px 13px", color: T.text, fontSize: 12,
                fontFamily: "monospace", outline: "none", resize: "vertical", width: "100%", boxSizing: "border-box" as const,
              }}
            />
            {/* image preview */}
            {form.images.split("\n").filter(Boolean).length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                {form.images.split("\n").map(s => s.trim()).filter(Boolean).map((url, i) => (
                  <img key={i} src={url} alt="" onError={e => (e.currentTarget.style.display = "none")}
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}` }} />
                ))}
              </div>
            )}
          </div>

          {/* toggles */}
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { key: "is_active",   label: "Active (visible in shop)", val: form.is_active },
              { key: "is_featured", label: "Featured (shown first)",    val: form.is_featured },
            ].map(({ key, label, val }) => (
              <button key={key} onClick={() => set(key)(!val)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: T.raised, border: `1px solid ${val ? T.ok : T.border}`, borderRadius: 10, padding: "10px 16px", cursor: "pointer", color: val ? T.ok : T.muted, fontFamily: "inherit", fontSize: 13, fontWeight: 700, flex: 1 }}>
                {val ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                {label}
              </button>
            ))}
          </div>

          {/* actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            <button onClick={onClose}
              style={{ flex: 1, background: "none", border: `1px solid ${T.border}`, color: T.muted, padding: "13px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700 }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 2, background: saving ? T.dim : T.coral, color: "#000", border: "none", padding: "13px", borderRadius: 12, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {saving ? <><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Saving…</> : <><CheckCircle size={16} /> {isEdit ? "Save Changes" : "Add Product"}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   ORDERS TAB
══════════════════════════════════════════════════ */
function OrdersTab() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const STATUS_COLOR: Record<string, string> = {
    pending:    T.gold,
    processing: T.coral,
    shipped:    "#4DC4FF",
    delivered:  T.ok,
    cancelled:  T.danger,
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
  };

  if (loading) return <p style={{ color: T.muted, padding: 20 }}>Loading orders…</p>;
  if (orders.length === 0) return (
    <div style={{ textAlign: "center", padding: "80px 0", color: T.muted }}>
      <ShoppingBag size={48} color={T.dim} />
      <p style={{ marginTop: 16, fontSize: 16 }}>No orders yet</p>
    </div>
  );

  return (
    <div style={{ background: T.card, borderRadius: 24, border: `1px solid ${T.border}`, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(255,255,255,0.02)" }}>
            {["ORDER #", "CUSTOMER", "TOTAL", "STATUS", "DATE", "ACTION"].map(h => (
              <th key={h} style={{ padding: 18, color: T.muted, fontSize: 12, letterSpacing: "0.06em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} style={{ borderBottom: `1px solid ${T.border}` }}>
              <td style={{ padding: 18, fontFamily: "monospace", color: T.coral, fontWeight: 700, fontSize: 13 }}>{o.order_number}</td>
              <td style={{ padding: 18, fontSize: 13 }}>{o.shipping_name || o.shipping_address?.slice(0, 30) || "—"}</td>
              <td style={{ padding: 18, fontWeight: 800, color: T.text }}>৳{Number(o.total).toLocaleString()}</td>
              <td style={{ padding: 18 }}>
                <span style={{ background: (STATUS_COLOR[o.status ?? "pending"] ?? T.muted) + "22", color: STATUS_COLOR[o.status ?? "pending"] ?? T.muted, border: `1px solid ${(STATUS_COLOR[o.status ?? "pending"] ?? T.muted)}55`, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" as const }}>
                  {o.status ?? "pending"}
                </span>
              </td>
              <td style={{ padding: 18, fontSize: 12, color: T.muted }}>
                {o.created_at ? new Date(o.created_at).toLocaleDateString("en-BD") : "—"}
              </td>
              <td style={{ padding: 18 }}>
                <select
                  value={o.status ?? "pending"}
                  onChange={e => updateStatus(o.id, e.target.value)}
                  style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 10px", color: T.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit", outline: "none" }}
                >
                  {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN ADMIN PAGE
══════════════════════════════════════════════════ */
export default function AdminPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<"inventory" | "orders">("inventory");
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [search, setSearch]       = useState("");
  const [toast, setToast]         = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("id", { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) { showToast("✅ Product deleted."); fetchProducts(); }
    else showToast("❌ Delete failed: " + error.message);
  };

  const toggleActive = async (p: Product) => {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    fetchProducts();
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.cat ?? "").toLowerCase().includes(search.toLowerCase())
  );

  /* stats */
  const totalProducts = products.length;
  const activeCount   = products.filter(p => p.is_active).length;
  const lowStock      = products.filter(p => (p.stock ?? 0) < 5).length;

  return (
    <div style={{ backgroundColor: T.bg, minHeight: "100vh", color: T.text, display: "flex", fontFamily: "'Inter',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: "fixed", bottom: 30, right: 30, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 22px", fontSize: 14, fontWeight: 700, zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          {toast}
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 240, borderRight: `1px solid ${T.border}`, padding: "30px 20px", display: "flex", flexDirection: "column", gap: 32, flexShrink: 0 }}>
        <div>
          <span style={{ color: T.coral, fontWeight: 900, fontSize: 22 }}>KVAD</span>
          <span style={{ fontSize: 10, color: T.muted, marginLeft: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {([
            { id: "inventory", icon: <LayoutDashboard size={17} />, label: "Inventory" },
            { id: "orders",    icon: <ShoppingBag size={17} />,    label: "Orders" },
          ] as const).map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", background: tab === item.id ? T.raised : "transparent", border: `1px solid ${tab === item.id ? T.border : "transparent"}`, borderRadius: 10, cursor: "pointer", color: tab === item.id ? T.coral : T.muted, fontFamily: "inherit", fontSize: 14, fontWeight: tab === item.id ? 700 : 400, textAlign: "left" as const, width: "100%" }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        {/* stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Total Products", val: totalProducts, color: T.text },
            { label: "Active",         val: activeCount,   color: T.ok },
            { label: "Low Stock (<5)", val: lowStock,      color: lowStock > 0 ? T.gold : T.muted },
          ].map(s => (
            <div key={s.label} style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: s.color, marginTop: 2 }}>{s.val}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, padding: "40px 44px", overflowY: "auto" }}>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900 }}>
              {tab === "inventory" ? "Inventory Management" : "Order Management"}
            </h1>
            <p style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
              {tab === "inventory" ? "Add, edit, and manage all products." : "View and update order statuses."}
            </p>
          </div>
          {tab === "inventory" && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* search */}
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products…"
                style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 14px", color: T.text, fontSize: 13, fontFamily: "inherit", outline: "none", width: 200 }}
              />
              {/* refresh */}
              <button onClick={fetchProducts}
                style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 12px", color: T.muted, cursor: "pointer" }}>
                <RefreshCw size={16} />
              </button>
              {/* add */}
              <button onClick={() => setShowAdd(true)}
                style={{ background: T.coral, color: "#000", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                <Plus size={18} /> Add Product
              </button>
            </div>
          )}
        </div>

        {/* ── INVENTORY TABLE ── */}
        {tab === "inventory" && (
          loading ? (
            <p style={{ color: T.muted }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: T.muted }}>
              <Package size={48} color={T.dim} />
              <p style={{ marginTop: 16 }}>{search ? "No products match your search." : "No products yet. Add one!"}</p>
            </div>
          ) : (
            <div style={{ background: T.card, borderRadius: 20, border: `1px solid ${T.border}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(255,255,255,0.02)" }}>
                    {["PRODUCT", "CATEGORY", "PRICE", "STOCK", "STATUS", "ACTIONS"].map(h => (
                      <th key={h} style={{ padding: "16px 20px", color: T.muted, fontSize: 11, letterSpacing: "0.07em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}`, opacity: p.is_active ? 1 : 0.5 }}>

                      {/* product */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {p.images?.[0]
                            ? <img src={p.images[0]} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0, background: T.raised }} />
                            : <div style={{ width: 44, height: 44, borderRadius: 8, background: T.raised, display: "flex", alignItems: "center", justifyContent: "center" }}><ImageIcon size={18} color={T.dim} /></div>
                          }
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                              <Star size={11} color={T.gold} fill={T.gold} />
                              <span style={{ fontSize: 11, color: T.muted }}>{Number(p.rating ?? 0).toFixed(1)} · {p.reviews ?? 0} reviews</span>
                            </div>
                            {p.badge && <span style={{ fontSize: 10, background: T.coral + "22", color: T.coral, border: `1px solid ${T.coral}44`, borderRadius: 4, padding: "1px 6px", marginTop: 3, display: "inline-block" }}>{p.badge}</span>}
                          </div>
                        </div>
                      </td>

                      {/* category */}
                      <td style={{ padding: "14px 20px" }}>
                        <p style={{ fontSize: 13, color: T.text }}>{p.cat ?? "—"}</p>
                        {p.sub && <p style={{ fontSize: 11, color: T.muted }}>{p.sub}</p>}
                      </td>

                      {/* price */}
                      <td style={{ padding: "14px 20px" }}>
                        <p style={{ fontWeight: 800, color: T.coral, fontSize: 15 }}>৳{Number(p.price ?? 0).toLocaleString()}</p>
                        {p.was && p.was > (p.price ?? 0) && (
                          <p style={{ fontSize: 12, color: T.dim, textDecoration: "line-through" }}>৳{Number(p.was).toLocaleString()}</p>
                        )}
                      </td>

                      {/* stock */}
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: (p.stock ?? 0) === 0 ? T.danger : (p.stock ?? 0) < 5 ? T.gold : T.ok }}>
                          {p.stock ?? 0}
                        </span>
                        <span style={{ fontSize: 11, color: T.muted }}> units</span>
                      </td>

                      {/* status toggle */}
                      <td style={{ padding: "14px 20px" }}>
                        <button onClick={() => toggleActive(p)}
                          style={{ display: "flex", alignItems: "center", gap: 6, background: (p.is_active ? T.ok : T.muted) + "22", border: `1px solid ${p.is_active ? T.ok : T.muted}55`, borderRadius: 20, padding: "4px 12px", cursor: "pointer", color: p.is_active ? T.ok : T.muted, fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>
                          {p.is_active ? <><ToggleRight size={14} /> Active</> : <><ToggleLeft size={14} /> Inactive</>}
                        </button>
                        {p.is_featured && <p style={{ fontSize: 10, color: T.gold, marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}><TrendingUp size={10} /> Featured</p>}
                      </td>

                      {/* actions */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => setEditTarget(p)}
                            style={{ background: "none", border: `1px solid ${T.border}`, color: T.text, padding: "7px 11px", borderRadius: 8, cursor: "pointer" }}>
                            <Edit size={15} />
                          </button>
                          <button onClick={() => handleDelete(p.id)}
                            style={{ background: "none", border: `1px solid ${T.border}`, color: T.danger, padding: "7px 11px", borderRadius: 8, cursor: "pointer" }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && <OrdersTab />}
      </main>

      {/* ── MODALS ── */}
      {showAdd && (
        <ProductModal onClose={() => setShowAdd(false)} onSaved={() => { showToast("✅ Product added!"); fetchProducts(); }} />
      )}
      {editTarget && (
        <ProductModal initial={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { showToast("✅ Product updated!"); fetchProducts(); }} />
      )}
    </div>
  );
}