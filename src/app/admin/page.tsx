//src/app/admin/page.tsx
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { T, fmt, STATUS_META, normalise } from "@/lib/constants";
import { Product, Order } from "@/lib/types";
import { Btn, SafeImg, Skeleton } from "@/components/ui";
import { Stars } from "@/components/ui/Ic";
import Ic from "@/components/ui/Ic";

type Tab = "dashboard"|"products"|"orders"|"customers"|"reviews"|"coupons"|"analytics"|"settings"|"shops";

const TABS: {id:Tab; icon:string; label:string}[] = [
  {id:"dashboard", icon:"📊", label:"ড্যাশবোর্ড"},
  {id:"shops",     icon:"🏬", label:"শপ রিকোয়েস্ট"},
  {id:"products",  icon:"📦", label:"পণ্য"},
  {id:"orders",    icon:"🧾", label:"অর্ডার"},
  {id:"customers", icon:"👥", label:"কাস্টমার"},
  {id:"reviews",   icon:"⭐", label:"রিভিউ"},
  {id:"coupons",   icon:"🏷️", label:"কুপন"},
  {id:"analytics", icon:"📈", label:"Analytics"},
  {id:"settings",  icon:"⚙️", label:"সেটিংস"},
];

function StatCard({icon, label, value, color, sub}: {icon:string; label:string; value:string|number; color:string; sub?:string}) {
  return (
    <div className="luxury-card p-5">
      <div className="flex justify-between items-start mb-3">
        <span className="text-3xl">{icon}</span>
        <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" 
              style={{ backgroundColor: `${color}22`, color: color, borderColor: `${color}44` }}>
          LIVE
        </span>
      </div>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="playfair text-2xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground/60">{sub}</p>}
    </div>
  );
}

// Input Component for cleaner forms
const AdminInput = ({ label, ...props }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{label}</label>
    <input 
      {...props} 
      className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
    />
  </div>
);

const BLANK_P = {name:"",cat:"Bags",sub:"",brand:"",price:"",was:"",badge:"",stock:"",images:"",is_active:true,is_featured:false,description:""};
const BLANK_C = {code:"",discount:"",type:"percent",min_order:"0",max_uses:"",expires_at:"",is_active:true};

export default function AdminPage() {
  const {user, loading:authLoading, isAdmin} = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string,string>>({});
  const [shops, setShops] = useState<any[]>([]);

  // Form States
  const [pForm, setPForm] = useState(BLANK_P);
  const [editPId, setEditPId] = useState<number|null>(null);
  const [pSaving, setPSaving] = useState(false);
  const [pMsg, setPMsg] = useState("");
  const [searchP, setSearchP] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [settSaved, setSettSaved] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) { router.push("/"); return; }
    setAuthorized(true);
  }, [user, authLoading, isAdmin, router]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [{data:pd},{data:od},{data:ud},{data:rd},{data:cpd},{data:sd},{data:shd}] = await Promise.all([
        supabase.from("products").select("*").order("id",{ascending:false}),
        supabase.from("orders").select("*").order("created_at",{ascending:false}).limit(200),
        supabase.from("users").select("*").order("created_at",{ascending:false}),
        supabase.from("product_reviews").select("*, products(name)").order("created_at",{ascending:false}),
        supabase.from("coupons").select("*").order("created_at",{ascending:false}),
        supabase.from("site_settings").select("*"),
        supabase.from("shops").select("*").order("created_at",{ascending:false}),
      ]);
      setProducts((pd??[]).map(normalise).filter(Boolean) as Product[]);
      setOrders((od??[]) as Order[]);
      setCustomers(ud??[]);
      setReviews(rd??[]);
      setCoupons(cpd??[]);
      setShops(shd??[]);
      const sMap:Record<string,string> = {};
      (sd??[]).forEach((s:any)=>{ sMap[s.key]=s.value; });
      setSettings(sMap);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) loadAll();
  }, [authorized, loadAll]);

  const totalRev = useMemo(()=>orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+(o.total??0),0),[orders]);

  if (authLoading || !authorized) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchP.toLowerCase()) || p.cat.toLowerCase().includes(searchP.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <nav className="sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r border-border bg-card p-6">
        <p className="playfair mb-8 text-2xl font-black text-primary">KVAD ADMIN</p>
        <div className="flex flex-col gap-1.5">
          {TABS.map(t => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-x-hidden">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        ) : (
          <div className="mx-auto max-w-6xl animate-in fade-in duration-500">
            
            {/* Dashboard View */}
            {tab === "dashboard" && (
              <div className="space-y-8">
                <h1 className="playfair text-3xl font-black">ড্যাশবোর্ড ওভারভিউ</h1>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard icon="💰" label="মোট আয়" value={fmt(totalRev)} color={T.ok}/>
                  <StatCard icon="🧾" label="মোট অর্ডার" value={orders.length} color={T.coral}/>
                  <StatCard icon="⏳" label="পেন্ডিং" value={orders.filter(o=>o.status==="pending").length} color={T.gold}/>
                </div>

                <div className="space-y-4">
                  <h2 className="playfair text-xl font-bold">সাম্প্রতিক অর্ডারসমূহ</h2>
                  <div className="flex flex-col gap-3">
                    {orders.slice(0, 6).map(o => {
                      const st = STATUS_META[o.status??"pending"]??STATUS_META["pending"];
                      return (
                        <div key={o.id} className="luxury-card flex items-center justify-between p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-bold">{o.order_number}</p>
                            <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("bn-BD")}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                                  style={{ backgroundColor: `${st.color}15`, color: st.color }}>
                              {st.icon} {st.label}
                            </span>
                            <span className="text-sm font-bold text-primary">{fmt(o.total)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Products View */}
            {tab === "products" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="playfair text-3xl font-black">পণ্য ব্যবস্থাপনা</h1>
                  <input 
                    className="w-64 rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="পণ্য খুঁজুন..."
                    value={searchP}
                    onChange={e => setSearchP(e.target.value)}
                  />
                </div>

                <div className="luxury-card p-6">
                   <h3 className="playfair mb-6 text-lg font-bold">{editPId ? "পণ্য এডিট করুন" : "নতুন পণ্য যোগ করুন"}</h3>
                   <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      <AdminInput label="পণ্যের নাম" value={pForm.name} onChange={(e:any) => setPForm({...pForm, name: e.target.value})} />
                      <AdminInput label="দাম" value={pForm.price} onChange={(e:any) => setPForm({...pForm, price: e.target.value})} />
                      <AdminInput label="স্টক" value={pForm.stock} onChange={(e:any) => setPForm({...pForm, stock: e.target.value})} />
                      {/* ... অন্যান্য ইনপুট ... */}
                   </div>
                   <div className="mt-6 flex gap-3">
                      <Btn onClick={() => {}} loading={pSaving}>{editPId ? "আপডেট করুন" : "সেভ করুন"}</Btn>
                      {editPId && <Btn v="ghost" onClick={() => {setEditPId(null); setPForm(BLANK_P)}}>বাতিল</Btn>}
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                   {filteredProducts.map(p => (
                     <div key={p.id} className="luxury-card flex items-center gap-4 p-3">
                        <SafeImg src={p.img} className="h-14 w-14 rounded-lg object-cover shadow-sm" />
                        <div className="flex-1">
                          <p className="text-sm font-bold leading-tight">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.cat} • স্টক: {p.stock}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{fmt(p.price)}</p>
                        </div>
                        <div className="flex gap-1 ml-4">
                           <button className="p-2 hover:text-primary transition-colors"><Ic n="edit" s={18}/></button>
                           <button className="p-2 hover:text-destructive transition-colors"><Ic n="trash" s={18}/></button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* অন্যান্য ট্যাবগুলোও একইভাবে মার্জিত ক্লাসে আসবে */}
            {tab !== "dashboard" && tab !== "products" && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <span className="text-5xl mb-4 opacity-20">⚙️</span>
                <p>{TABS.find(t => t.id === tab)?.label} সেকশনটি লোড হচ্ছে...</p>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}