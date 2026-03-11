"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Edit, Trash2, Save, X, Package, 
  LayoutDashboard 
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   KVAD ADMIN PANEL (TS-V2) · Fixed & Optimized
═══════════════════════════════════════════════════════ */

// ১. প্রোডাক্টের জন্য ইন্টারফেস (টাইপস্ক্রিপ্ট এরর দূর করতে)
interface Product {
  id: string;
  product_name: string;
  sale_price: number;
  original_price: number;
  category_name: string;
  images: string[];
}

const T = {
  bg: "#080810",
  card: "#0E0E18",
  raised: "#141422",
  border: "#1E1E30",
  text: "#F2E8D9",
  muted: "#6E6E88",
  dim: "#363650",
  coral: "#FF6B4A",
  ok: "#3DEBA0",
};

export default function AdminPage() {
  // ২. টাইপ-সেফ স্টেট
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  // ৩. প্রোডাক্ট লোড করা
  const fetchAdminProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    
    if (!error && data) setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAdminProducts(); }, [fetchAdminProducts]);

  // ৪. আপডেট ফাংশন
  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .update({
        sale_price: Number(editData.sale_price),
        original_price: Number(editData.original_price),
        category_name: editData.category_name
      })
      .eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchAdminProducts();
      alert("Updated Successfully!");
    } else {
      alert("Update failed: " + error.message);
    }
  };

  // ৫. ডিলিট ফাংশন
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchAdminProducts();
    }
  };

  return (
    <div style={{ backgroundColor: T.bg, minHeight: "100vh", color: T.text, display: "flex", fontFamily: "Inter, sans-serif" }}>
      
      {/* ── SIDEBAR ── */}
      <aside style={{ width: 260, borderRight: `1px solid ${T.border}`, padding: 30, display: "flex", flexDirection: "column", gap: 40 }}>
        <h2 style={{ color: T.coral, fontWeight: 900, fontSize: 24 }}>KVAD <span style={{fontSize: 12, opacity: 0.5}}>ADMIN</span></h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 15px", background: T.raised, borderRadius: 10, cursor: "pointer", color: T.coral }}>
            <LayoutDashboard size={18} /> <span style={{ fontWeight: 700 }}>Inventory</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 15px", color: T.muted, cursor: "not-allowed" }}>
            <Package size={18} /> <span>Orders (Soon)</span>
          </div>
        </nav>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, padding: 50, overflowY: "auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900 }}>Inventory Management</h1>
            <p style={{ color: T.muted }}>Manage products and real-time pricing.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ background: T.coral, color: "#fff", border: "none", padding: "12px 25px", borderRadius: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <Plus size={20} /> Add Product
          </button>
        </header>

        {loading ? (
          <p style={{ color: T.muted }}>Loading data...</p>
        ) : (
          <div style={{ background: T.card, borderRadius: 24, border: `1px solid ${T.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(255,255,255,0.02)" }}>
                  <th style={{ padding: 20, color: T.muted, fontSize: 13 }}>PRODUCT</th>
                  <th style={{ padding: 20, color: T.muted, fontSize: 13 }}>CATEGORY</th>
                  <th style={{ padding: 20, color: T.muted, fontSize: 13 }}>SALE PRICE</th>
                  <th style={{ padding: 20, color: T.muted, fontSize: 13 }}>ORIGINAL</th>
                  <th style={{ padding: 20, color: T.muted, fontSize: 13 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: 20, display: "flex", alignItems: "center", gap: 15 }}>
                      <img src={p.images?.[0]} style={{ width: 45, height: 45, borderRadius: 8, objectFit: "cover" }} />
                      <span style={{ fontWeight: 700 }}>{p.product_name}</span>
                    </td>
                    <td style={{ padding: 20 }}>
                      {editingId === p.id ? 
                        <input style={{ background: T.raised, color: "#fff", border: `1px solid ${T.border}`, padding: 8, borderRadius: 5, width: 100 }} 
                               defaultValue={p.category_name} onChange={e => setEditData({...editData, category_name: e.target.value})} /> 
                        : <span style={{ color: T.muted }}>{p.category_name}</span>}
                    </td>
                    <td style={{ padding: 20 }}>
                      {editingId === p.id ? 
                        <input type="number" style={{ background: T.raised, color: T.coral, border: `1px solid ${T.border}`, padding: 8, borderRadius: 5, width: 80, fontWeight: 800 }} 
                               defaultValue={p.sale_price} onChange={e => setEditData({...editData, sale_price: Number(e.target.value)})} /> 
                        : <span style={{ fontWeight: 800 }}>৳{p.sale_price}</span>}
                    </td>
                    <td style={{ padding: 20 }}>
                      {editingId === p.id ? 
                        <input type="number" style={{ background: T.raised, color: T.muted, border: `1px solid ${T.border}`, padding: 8, borderRadius: 5, width: 80 }} 
                               defaultValue={p.original_price} onChange={e => setEditData({...editData, original_price: Number(e.target.value)})} /> 
                        : <span style={{ color: T.dim, textDecoration: "line-through" }}>৳{p.original_price}</span>}
                    </td>
                    <td style={{ padding: 20 }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        {editingId === p.id ? (
                          <button onClick={() => handleUpdate(p.id)} style={{ background: T.ok, color: "#000", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}><Save size={16}/></button>
                        ) : (
                          <button onClick={() => { setEditingId(p.id); setEditData(p); }} style={{ background: "none", border: `1px solid ${T.border}`, color: T.text, padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}><Edit size={16}/></button>
                        )}
                        <button onClick={() => handleDelete(p.id)} style={{ background: "none", border: `1px solid ${T.border}`, color: "#ff4466", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ── ADD PRODUCT MODAL ── */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: T.card, padding: 40, borderRadius: 30, width: "100%", maxWidth: 500, border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
               <h2>Add New Product</h2>
               <X onClick={() => setShowAddModal(false)} style={{ cursor: "pointer" }} />
            </div>
            <p style={{ color: T.muted, marginBottom: 20 }}>This section can be linked to a new supabase insert function.</p>
            <button onClick={() => setShowAddModal(false)} style={{ background: T.coral, color: "#fff", padding: "12px 25px", borderRadius: 12, border: "none", width: "100%", fontWeight: 800 }}>Close Modal</button>
          </div>
        </div>
      )}
    </div>
  );
}