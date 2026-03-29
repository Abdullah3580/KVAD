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

function StatCard({icon,label,value,color,sub}:{icon:string;label:string;value:string|number;color:string;sub?:string}) {
  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px 22px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <span style={{fontSize:26}}>{icon}</span>
        <span style={{fontSize:10,background:color+"22",color,border:`1px solid ${color}44`,borderRadius:20,padding:"3px 10px",fontWeight:700}}>LIVE</span>
      </div>
      <p style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>{label}</p>
      <p className="playfair" style={{fontSize:26,fontWeight:800,color}}>{value}</p>
      {sub && <p style={{fontSize:11,color:T.dim,marginTop:4}}>{sub}</p>}
    </div>
  );
}

const BLANK_P = {name:"",cat:"Bags",sub:"",brand:"",price:"",was:"",badge:"",stock:"",images:"",is_active:true,is_featured:false,description:""};
const BLANK_C = {code:"",discount:"",type:"percent",min_order:"0",max_uses:"",expires_at:"",is_active:true};

export default function AdminPage() {
  const {user, loading:authLoading, isAdmin} = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);

  const [products,  setProducts]  = useState<Product[]>([]);
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [reviews,   setReviews]   = useState<any[]>([]);
  const [coupons,   setCoupons]   = useState<any[]>([]);
  const [settings,  setSettings]  = useState<Record<string,string>>({});
  const [shops,     setShops]     = useState<any[]>([]);

  const [pForm,   setPForm]   = useState(BLANK_P);
  const [editPId, setEditPId] = useState<number|null>(null);
  const [pSaving, setPSaving] = useState(false);
  const [pMsg,    setPMsg]    = useState("");
  const [cForm,   setCForm]   = useState(BLANK_C);
  const [editCId, setEditCId] = useState<string|null>(null);
  const [cSaving, setCSaving] = useState(false);
  const [searchP,     setSearchP]     = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [settSaved,   setSettSaved]   = useState(false);

  /* ── Auth check ── */
  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) { router.push("/"); return; }
    setAuthorized(true);
  }, [user, authLoading, isAdmin, router]);

  /* ── Fix: load data only after authorized ── */
  const loadAll = useCallback(async () => {
    setLoading(true);
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
    setLoading(false);
  }, []);

  // Fix: load only after authorized
  useEffect(() => {
    if (authorized) loadAll();
  }, [authorized, loadAll]);

  /* ── Dashboard stats ── */
  const totalRev = useMemo(()=>orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+(o.total??0),0),[orders]);
  const pendingCount = orders.filter(o=>o.status==="pending").length;

  /* ── Product save ── */
  const saveProduct = async () => {
    if (!pForm.name||!pForm.price) { setPMsg("নাম ও দাম আবশ্যিক"); return; }
    setPSaving(true);
    const imgs = pForm.images.split(",").map(s=>s.trim()).filter(Boolean);
    const payload = {
      name:pForm.name, cat:pForm.cat, sub:pForm.sub, brand:pForm.brand,
      price:+pForm.price, was:+(pForm.was||pForm.price), badge:pForm.badge||null,
      stock:+(pForm.stock||0), images:imgs, description:pForm.description,
      is_active:pForm.is_active, is_featured:pForm.is_featured,
    };
    const { error } = editPId
      ? await supabase.from("products").update(payload).eq("id",editPId)
      : await supabase.from("products").insert(payload);
    setPMsg(error ? "❌ "+error.message : editPId ? "✅ আপডেট হয়েছে" : "✅ পণ্য যোগ হয়েছে");
    if (!error) { setPForm(BLANK_P); setEditPId(null); loadAll(); }
    setPSaving(false);
  };

  /* ── Coupon save ── */
  const saveCoupon = async () => {
    if (!cForm.code||!cForm.discount) return;
    setCSaving(true);
    const payload = {
      code:cForm.code.toUpperCase(), discount:+cForm.discount, type:cForm.type,
      min_order:+(cForm.min_order||0), is_active:cForm.is_active,
      ...(cForm.max_uses ? {max_uses:+cForm.max_uses} : {}),
      ...(cForm.expires_at ? {expires_at:cForm.expires_at} : {}),
    };
    const { error } = editCId
      ? await supabase.from("coupons").update(payload).eq("id",editCId)
      : await supabase.from("coupons").insert(payload);
    if (!error) { setCForm(BLANK_C); setEditCId(null); loadAll(); }
    setCSaving(false);
  };

  /* ── Order status update ── */
  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({status}).eq("id",id);
    setOrders(prev => prev.map(o => o.id===id ? {...o,status} : o));
  };

  /* ── Settings save ── */
  const saveSettings = async () => {
    const upserts = Object.entries(settings).map(([key,value])=>({key,value}));
    await supabase.from("site_settings").upsert(upserts);
    setSettSaved(true);
    setTimeout(()=>setSettSaved(false), 2500);
  };

  /* ── Shop approval ── */
  const updateShop = async (id: string, status: string) => {
    await supabase.from("shops").update({status}).eq("id",id);
    setShops(prev=>prev.map(s=>s.id===id?{...s,status}:s));
  };

  if (authLoading || !authorized) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
      <div className="spin" style={{width:40,height:40,border:`3px solid ${T.border}`,borderTopColor:T.coral,borderRadius:"50%"}}/>
    </div>
  );

  const filteredProducts = searchP
    ? products.filter(p=>p.name.toLowerCase().includes(searchP.toLowerCase())||p.cat.toLowerCase().includes(searchP.toLowerCase()))
    : products;

  const filteredOrders = orderFilter==="all" ? orders : orders.filter(o=>o.status===orderFilter);

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}.shimmer{background:linear-gradient(90deg,#141422 25%,#2A2A42 50%,#141422 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Sidebar */}
      <nav style={{width:220,flexShrink:0,background:T.card,borderRight:`1px solid ${T.border}`,padding:"24px 14px",display:"flex",flexDirection:"column",gap:4,position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <p className="playfair" style={{fontWeight:900,fontSize:22,color:T.coral,marginBottom:20,paddingLeft:8}}>KVAD Admin</p>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",background:tab===t.id?T.coralG:"transparent",color:tab===t.id?T.coral:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:tab===t.id?700:400,transition:"all .15s",textAlign:"left"}}>
            <span style={{fontSize:18}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      {/* Main */}
      <main style={{flex:1,padding:"28px 32px",overflowY:"auto"}}>
        {loading ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
            {[...Array(8)].map((_,i)=><Skeleton key={i} h={120} r={14}/>)}
          </div>
        ) : (
          <>
            {/* ── DASHBOARD ── */}
            {tab==="dashboard" && (
              <div>
                <h1 className="playfair" style={{fontSize:28,fontWeight:800,marginBottom:24}}>ড্যাশবোর্ড</h1>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:28}}>
                  <StatCard icon="💰" label="মোট আয়" value={fmt(totalRev)} color={T.ok}/>
                  <StatCard icon="🧾" label="মোট অর্ডার" value={orders.length} color={T.coral}/>
                  <StatCard icon="⏳" label="পেন্ডিং" value={pendingCount} color={T.gold}/>
                  <StatCard icon="📦" label="পণ্য" value={products.length} color={T.sky}/>
                  <StatCard icon="👥" label="কাস্টমার" value={customers.length} color={T.purple}/>
                  <StatCard icon="⭐" label="রিভিউ" value={reviews.length} color={T.teal}/>
                </div>
                <h2 className="playfair" style={{fontSize:18,fontWeight:700,marginBottom:14}}>সাম্প্রতিক অর্ডার</h2>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {orders.slice(0,5).map(o=>{
                    const st=STATUS_META[o.status??"pending"]??STATUS_META["pending"];
                    return (
                      <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:T.card,border:`1px solid ${T.border}`,borderRadius:11,padding:"12px 16px"}}>
                        <div>
                          <p style={{fontWeight:700,fontSize:13}}>{o.order_number}</p>
                          <p style={{fontSize:11,color:T.muted}}>{new Date(o.created_at).toLocaleDateString("bn-BD")}</p>
                        </div>
                        <span style={{fontSize:11,background:st.color+"22",color:st.color,padding:"3px 10px",borderRadius:20,fontWeight:700}}>{st.icon} {st.label}</span>
                        <span style={{fontWeight:700,color:T.coral}}>{fmt(o.total)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── SHOPS ── */}
            {tab==="shops" && (
              <div>
                <h1 className="playfair" style={{fontSize:28,fontWeight:800,marginBottom:24}}>শপ রিকোয়েস্ট</h1>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {shops.length===0 && <p style={{color:T.muted}}>কোনো রিকোয়েস্ট নেই</p>}
                  {shops.map(s=>(
                    <div key={s.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                      <div>
                        <p style={{fontWeight:700,fontSize:15}}>{s.shop_name}</p>
                        <p style={{fontSize:12,color:T.muted}}>{s.business_email} · {s.contact_number}</p>
                        <p style={{fontSize:12,color:T.muted,marginTop:4,maxWidth:400}}>{s.shop_description}</p>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:700,background:s.status==="approved"?T.ok+"22":s.status==="rejected"?T.danger+"22":T.gold+"22",color:s.status==="approved"?T.ok:s.status==="rejected"?T.danger:T.gold}}>{s.status}</span>
                        {s.status==="pending" && (
                          <>
                            <Btn sz="sm" v="ok" onClick={()=>updateShop(s.id,"approved")}>অনুমোদন</Btn>
                            <Btn sz="sm" v="danger" onClick={()=>updateShop(s.id,"rejected")}>প্রত্যাখ্যান</Btn>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PRODUCTS ── */}
            {tab==="products" && (
              <div>
                <h1 className="playfair" style={{fontSize:28,fontWeight:800,marginBottom:24}}>পণ্য ব্যবস্থাপনা</h1>
                {/* Product form */}
                <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:22,marginBottom:22}}>
                  <h3 className="playfair" style={{fontWeight:700,fontSize:18,marginBottom:16}}>{editPId?"পণ্য সম্পাদনা":"নতুন পণ্য যোগ"}</h3>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                    {([["name","নাম *"],["sub","সাব-ক্যাটাগরি"],["brand","ব্র্যান্ড"],["price","দাম *"],["was","আগের দাম"],["stock","স্টক"],["badge","ব্যাজ"]] as [keyof typeof BLANK_P,string][]).map(([k,lbl])=>(
                      <div key={k}>
                        <p style={{fontSize:11,color:T.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>{lbl}</p>
                        <input value={pForm[k] as string} onChange={e=>setPForm(f=>({...f,[k]:e.target.value}))}
                          style={{width:"100%",background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",color:T.champagne,fontSize:13,fontFamily:"inherit"}}/>
                      </div>
                    ))}
                    <div>
                      <p style={{fontSize:11,color:T.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>ক্যাটাগরি</p>
                      <select value={pForm.cat} onChange={e=>setPForm(f=>({...f,cat:e.target.value}))}
                        style={{width:"100%",background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",color:T.champagne,fontSize:13,fontFamily:"inherit"}}>
                        {["Bags","Saree","Panjabi","Others"].map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{marginTop:14}}>
                    <p style={{fontSize:11,color:T.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>ছবির URL (কমা দিয়ে আলাদা করুন)</p>
                    <textarea value={pForm.images} onChange={e=>setPForm(f=>({...f,images:e.target.value}))} rows={2}
                      style={{width:"100%",background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",color:T.champagne,fontSize:13,fontFamily:"inherit",resize:"vertical"}}/>
                  </div>
                  <div style={{marginTop:14}}>
                    <p style={{fontSize:11,color:T.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>বিবরণ</p>
                    <textarea value={pForm.description} onChange={e=>setPForm(f=>({...f,description:e.target.value}))} rows={3}
                      style={{width:"100%",background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",color:T.champagne,fontSize:13,fontFamily:"inherit",resize:"vertical"}}/>
                  </div>
                  <div style={{display:"flex",gap:16,marginTop:14,alignItems:"center"}}>
                    <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:T.muted}}>
                      <input type="checkbox" checked={pForm.is_active} onChange={e=>setPForm(f=>({...f,is_active:e.target.checked}))} style={{accentColor:T.coral}}/> সক্রিয়
                    </label>
                    <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:T.muted}}>
                      <input type="checkbox" checked={pForm.is_featured} onChange={e=>setPForm(f=>({...f,is_featured:e.target.checked}))} style={{accentColor:T.coral}}/> ফিচার্ড
                    </label>
                  </div>
                  <div style={{display:"flex",gap:10,marginTop:16,alignItems:"center"}}>
                    <Btn onClick={saveProduct} loading={pSaving}>{editPId?"আপডেট করুন":"পণ্য যোগ করুন"}</Btn>
                    {editPId && <Btn v="ghost" onClick={()=>{setPForm(BLANK_P);setEditPId(null);setPMsg("");}}>বাতিল</Btn>}
                    {pMsg && <p style={{fontSize:12,color:pMsg[0]==="✅"?T.ok:T.danger}}>{pMsg}</p>}
                  </div>
                </div>
                {/* Search */}
                <input value={searchP} onChange={e=>setSearchP(e.target.value)} placeholder="পণ্য খুঁজুন…"
                  style={{width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.champagne,fontSize:13,fontFamily:"inherit",marginBottom:14}}/>
                {/* List */}
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {filteredProducts.map(p=>(
                    <div key={p.id} style={{display:"flex",gap:12,alignItems:"center",background:T.card,border:`1px solid ${T.border}`,borderRadius:11,padding:"10px 14px"}}>
                      <SafeImg src={p.img} alt={p.name} style={{width:52,height:52,objectFit:"cover",borderRadius:8,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontWeight:700,fontSize:13,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.name}</p>
                        <p style={{fontSize:11,color:T.muted}}>{p.cat} · স্টক: {p.stock}</p>
                      </div>
                      <span style={{fontWeight:700,color:T.coral,flexShrink:0}}>{fmt(p.price)}</span>
                      <div style={{display:"flex",gap:6}}>
                        <Btn sz="xs" v="ghost" onClick={()=>{setEditPId(p.id);setPForm({name:p.name,cat:p.cat,sub:p.sub,brand:p.brand,price:String(p.price),was:String(p.was),badge:p.badge??'',stock:String(p.stock),images:(p.gallery??[]).join(", "),is_active:p.is_active,is_featured:p.is_featured,description:p.desc??''});setPMsg("");setTab("products");}}>
                          <Ic n="edit" s={13}/>
                        </Btn>
                        <Btn sz="xs" v="danger" onClick={async()=>{ if(confirm("মুছে ফেলবেন?")){ await supabase.from("products").delete().eq("id",p.id); loadAll(); }}}>
                          <Ic n="trash" s={13}/>
                        </Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ORDERS ── */}
            {tab==="orders" && (
              <div>
                <h1 className="playfair" style={{fontSize:28,fontWeight:800,marginBottom:24}}>অর্ডার ব্যবস্থাপনা</h1>
                <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                  {["all","pending","processing","shipped","delivered","cancelled"].map(s=>(
                    <button key={s} onClick={()=>setOrderFilter(s)} style={{padding:"6px 14px",background:orderFilter===s?T.coral:T.raised,border:`1px solid ${orderFilter===s?T.coral:T.border}`,borderRadius:20,color:orderFilter===s?"#000":T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,transition:"all .15s"}}>
                      {s==="all"?"সব":STATUS_META[s]?.label??s}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {filteredOrders.map(o=>{
                    const st=STATUS_META[o.status??"pending"]??STATUS_META["pending"];
                    return (
                      <div key={o.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 18px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                          <div>
                            <p style={{fontWeight:700}}>{o.order_number}</p>
                            <p style={{fontSize:12,color:T.muted}}>{new Date(o.created_at).toLocaleString("bn-BD")}</p>
                            {o.shipping_name && <p style={{fontSize:12,color:T.muted}}>{o.shipping_name} · {o.shipping_city}</p>}
                          </div>
                          <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                            <span style={{fontWeight:700,color:T.coral,fontSize:16}}>{fmt(o.total)}</span>
                            <select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}
                              style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 10px",color:T.champagne,fontSize:12,fontFamily:"inherit",cursor:"pointer"}}>
                              {["pending","processing","shipped","delivered","cancelled"].map(s=>(
                                <option key={s} value={s}>{STATUS_META[s]?.label??s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── CUSTOMERS ── */}
            {tab==="customers" && (
              <div>
                <h1 className="playfair" style={{fontSize:28,fontWeight:800,marginBottom:24}}>কাস্টমার</h1>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {customers.map(c=>(
                    <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:T.card,border:`1px solid ${T.border}`,borderRadius:11,padding:"12px 16px",flexWrap:"wrap",gap:8}}>
                      <div>
                        <p style={{fontWeight:700,fontSize:13}}>{c.full_name||"—"}</p>
                        <p style={{fontSize:12,color:T.muted}}>{c.email}</p>
                        {c.phone && <p style={{fontSize:12,color:T.muted}}>{c.phone}</p>}
                      </div>
                      <span style={{fontSize:11,background:c.role==="admin"?T.coral+"22":T.raised,color:c.role==="admin"?T.coral:T.muted,padding:"3px 10px",borderRadius:20,fontWeight:700}}>{c.role??"customer"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── REVIEWS ── */}
            {tab==="reviews" && (
              <div>
                <h1 className="playfair" style={{fontSize:28,fontWeight:800,marginBottom:24}}>রিভিউ</h1>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {reviews.map(r=>(
                    <div key={r.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 18px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div>
                          <p style={{fontWeight:700,fontSize:13}}>{r.user_name}</p>
                          <p style={{fontSize:11,color:T.muted}}>{r.products?.name??""}</p>
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <Stars r={r.rating} s={13}/>
                          <Btn sz="xs" v="danger" onClick={async()=>{ if(confirm("রিভিউ মুছবেন?")){ await supabase.from("product_reviews").delete().eq("id",r.id); loadAll(); }}}>
                            <Ic n="trash" s={13}/>
                          </Btn>
                        </div>
                      </div>
                      <p style={{fontSize:13,color:T.cream,lineHeight:1.6}}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── COUPONS ── */}
            {tab==="coupons" && (
              <div>
                <h1 className="playfair" style={{fontSize:28,fontWeight:800,marginBottom:24}}>কুপন ব্যবস্থাপনা</h1>
                <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:22,marginBottom:22}}>
                  <h3 className="playfair" style={{fontWeight:700,fontSize:18,marginBottom:16}}>{editCId?"কুপন সম্পাদনা":"নতুন কুপন"}</h3>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                    {([["code","কোড *"],["discount","ছাড় (%) *"],["min_order","ন্যূনতম অর্ডার"],["max_uses","সর্বোচ্চ ব্যবহার"],["expires_at","মেয়াদ শেষ (YYYY-MM-DD)"]] as [keyof typeof BLANK_C,string][]).map(([k,lbl])=>(
                      <div key={k}>
                        <p style={{fontSize:11,color:T.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>{lbl}</p>
                        <input value={cForm[k] as string} onChange={e=>setCForm(f=>({...f,[k]:e.target.value}))}
                          style={{width:"100%",background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",color:T.champagne,fontSize:13,fontFamily:"inherit"}}/>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:10,marginTop:16,alignItems:"center"}}>
                    <Btn onClick={saveCoupon} loading={cSaving}>{editCId?"আপডেট":"কুপন যোগ"}</Btn>
                    {editCId && <Btn v="ghost" onClick={()=>{setCForm(BLANK_C);setEditCId(null);}}>বাতিল</Btn>}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {coupons.map(c=>(
                    <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:T.card,border:`1px solid ${T.border}`,borderRadius:11,padding:"12px 16px",flexWrap:"wrap",gap:8}}>
                      <div>
                        <p style={{fontWeight:900,fontSize:14,color:T.coral,letterSpacing:".05em"}}>{c.code}</p>
                        <p style={{fontSize:12,color:T.muted}}>{c.discount}% ছাড় · ন্যূন: ৳{c.min_order??0}{c.expires_at?` · মেয়াদ: ${c.expires_at.slice(0,10)}`:""}</p>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <Btn sz="xs" v="ghost" onClick={()=>{setEditCId(c.id);setCForm({code:c.code,discount:String(c.discount),type:c.type??"percent",min_order:String(c.min_order??0),max_uses:String(c.max_uses??""),expires_at:c.expires_at?.slice(0,10)??"",is_active:c.is_active??true});}}>
                          <Ic n="edit" s={13}/>
                        </Btn>
                        <Btn sz="xs" v="danger" onClick={async()=>{ await supabase.from("coupons").delete().eq("id",c.id); loadAll(); }}>
                          <Ic n="trash" s={13}/>
                        </Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {tab==="analytics" && (
              <div>
                <h1 className="playfair" style={{fontSize:28,fontWeight:800,marginBottom:24}}>Analytics</h1>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16}}>
                  <StatCard icon="💰" label="মোট আয়" value={fmt(totalRev)} color={T.ok}/>
                  <StatCard icon="📦" label="ডেলিভার হয়েছে" value={orders.filter(o=>o.status==="delivered").length} color={T.teal}/>
                  <StatCard icon="❌" label="বাতিল" value={orders.filter(o=>o.status==="cancelled").length} color={T.danger}/>
                  <StatCard icon="⭐" label="মোট রিভিউ" value={reviews.length} color={T.gold}/>
                </div>
              </div>
            )}

            {/* ── SETTINGS ── */}
            {tab==="settings" && (
              <div>
                <h1 className="playfair" style={{fontSize:28,fontWeight:800,marginBottom:24}}>সেটিংস</h1>
                <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:24}}>
                  {Object.entries(settings).map(([k,v])=>(
                    <div key={k} style={{marginBottom:16}}>
                      <p style={{fontSize:11,color:T.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>{k}</p>
                      <input value={v} onChange={e=>setSettings(s=>({...s,[k]:e.target.value}))}
                        style={{width:"100%",background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 12px",color:T.champagne,fontSize:13,fontFamily:"inherit"}}/>
                    </div>
                  ))}
                  <Btn onClick={saveSettings}>{settSaved?"✅ সংরক্ষিত":"সংরক্ষণ করুন"}</Btn>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
