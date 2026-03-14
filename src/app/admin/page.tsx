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

type Tab = "dashboard"|"products"|"orders"|"customers"|"reviews"|"coupons"|"analytics"|"settings";

const TABS: {id:Tab; icon:string; label:string}[] = [
  {id:"dashboard",  icon:"📊", label:"ড্যাশবোর্ড"},
  {id:"products",   icon:"📦", label:"পণ্য"},
  {id:"orders",     icon:"🧾", label:"অর্ডার"},
  {id:"customers",  icon:"👥", label:"কাস্টমার"},
  {id:"reviews",    icon:"⭐", label:"রিভিউ"},
  {id:"coupons",    icon:"🏷️", label:"কুপন"},
  {id:"analytics",  icon:"📈", label:"Analytics"},
  {id:"settings",   icon:"⚙️", label:"সেটিংস"},
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
  const {user, loading:authLoading} = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab]   = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);

  /* data */
  const [products,  setProducts]  = useState<Product[]>([]);
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [reviews,   setReviews]   = useState<any[]>([]);
  const [coupons,   setCoupons]   = useState<any[]>([]);
  const [settings,  setSettings]  = useState<Record<string,string>>({});

  /* forms */
  const [pForm, setPForm] = useState(BLANK_P);
  const [editPId, setEditPId] = useState<number|null>(null);
  const [pSaving, setPSaving] = useState(false);
  const [pMsg,    setPMsg]    = useState("");
  const [cForm,   setCForm]   = useState(BLANK_C);
  const [editCId, setEditCId] = useState<string|null>(null);
  const [cSaving, setCSaving] = useState(false);

  /* filters */
  const [searchP,     setSearchP]     = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [settSaved,   setSettSaved]   = useState(false);

  /* ── Auth check ── */
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/shop"); return; }
    supabase.from("users").select("role").eq("id", user.id).single().then(({data, error}) => {
  console.log("ROLE CHECK:", data, error);
  if (data?.role !== "admin") { router.push("/shop"); return; }
  setAuthorized(true);
});
  }, [user, authLoading]);

  /* ── Load all data ── */
  const loadAll = useCallback(async () => {
    setLoading(true);
    const [
      {data:pd}, {data:od}, {data:ud}, {data:rd}, {data:cpd}, {data:sd}
    ] = await Promise.all([
      supabase.from("products").select("*").order("id",{ascending:false}),
      supabase.from("orders").select("*").order("created_at",{ascending:false}).limit(200),
      supabase.from("users").select("*").order("created_at",{ascending:false}),
      supabase.from("product_reviews").select("*, products(name)").order("created_at",{ascending:false}),
      supabase.from("coupons").select("*").order("created_at",{ascending:false}),
      supabase.from("site_settings").select("*"),
    ]);
    setProducts((pd??[]).map(normalise).filter(Boolean) as Product[]);
    setOrders((od??[]) as Order[]);
    setCustomers(ud??[]);
    setReviews(rd??[]);
    setCoupons(cpd??[]);
    const sMap:Record<string,string> = {};
    (sd??[]).forEach((s:any) => { sMap[s.key] = s.value; });
    setSettings(sMap);
    setLoading(false);
  }, []);

  useEffect(() => { if (authorized) loadAll(); }, [authorized]);

  /* ── Product CRUD ── */
  const saveProduct = async () => {
    if (!pForm.name||!pForm.price) { setPMsg("নাম ও দাম আবশ্যক"); return; }
    setPSaving(true); setPMsg("");
    const imgs = pForm.images.split(",").map(s=>s.trim()).filter(Boolean);
    const payload = {name:pForm.name,cat:pForm.cat,sub:pForm.sub,brand:pForm.brand,price:+pForm.price,was:+pForm.was||+pForm.price,badge:pForm.badge||null,stock:+pForm.stock||0,images:imgs,is_active:pForm.is_active,is_featured:pForm.is_featured,description:pForm.description};
    const {error} = editPId
      ? await supabase.from("products").update(payload).eq("id",editPId)
      : await supabase.from("products").insert(payload);
    if (error) setPMsg("❌ "+error.message);
    else { setPMsg(editPId?"✅ আপডেট হয়েছে":"✅ পণ্য যোগ হয়েছে"); await loadAll(); setPForm(BLANK_P); setEditPId(null); }
    setPSaving(false);
  };
  const deleteProduct = async (id:number) => {
    if (!confirm("এই পণ্য মুছে ফেলবেন?")) return;
    await supabase.from("products").delete().eq("id",id);
    setProducts(p=>p.filter(x=>x.id!==id));
  };
  const toggleProductActive = async (p:Product) => {
    await supabase.from("products").update({is_active:!p.is_active}).eq("id",p.id);
    setProducts(prev=>prev.map(x=>x.id===p.id?{...x,is_active:!p.is_active}:x));
  };

  /* ── Order ── */
  const updateOrderStatus = async (id:string, status:string) => {
    await supabase.from("orders").update({status}).eq("id",id);
    setOrders(prev=>prev.map(o=>o.id===id?{...o,status}:o));
  };

  /* ── Customer ── */
  const updateCustomerRole = async (id:string, role:string) => {
    await supabase.from("users").update({role}).eq("id",id);
    setCustomers(prev=>prev.map(c=>c.id===id?{...c,role}:c));
  };

  /* ── Reviews ── */
  const deleteReview = async (id:string) => {
    if (!confirm("এই রিভিউ মুছবেন?")) return;
    await supabase.from("product_reviews").delete().eq("id",id);
    setReviews(prev=>prev.filter(r=>r.id!==id));
  };

  /* ── Coupons ── */
  const saveCoupon = async () => {
    if (!cForm.code||!cForm.discount) { alert("কোড ও ছাড় আবশ্যক"); return; }
    setCSaving(true);
    const payload = {code:cForm.code.toUpperCase(),discount:+cForm.discount,type:cForm.type,min_order:+cForm.min_order,max_uses:cForm.max_uses?+cForm.max_uses:null,expires_at:cForm.expires_at||null,is_active:cForm.is_active,used_count:0};
    const {error} = editCId
      ? await supabase.from("coupons").update(payload).eq("id",editCId)
      : await supabase.from("coupons").insert(payload);
    if (!error) { await loadAll(); setCForm(BLANK_C); setEditCId(null); }
    setCSaving(false);
  };
  const toggleCoupon = async (id:string, val:boolean) => {
    await supabase.from("coupons").update({is_active:val}).eq("id",id);
    setCoupons(prev=>prev.map(c=>c.id===id?{...c,is_active:val}:c));
  };
  const deleteCoupon = async (id:string) => {
    if (!confirm("এই কুপন মুছবেন?")) return;
    await supabase.from("coupons").delete().eq("id",id);
    setCoupons(prev=>prev.filter(c=>c.id!==id));
  };

  /* ── Settings ── */
  const saveSetting = async (key:string, value:string) => {
    await supabase.from("site_settings").upsert({key,value},{onConflict:"key"});
    setSettings(prev=>({...prev,[key]:value}));
  };
  const saveAllSettings = async () => {
    await Promise.all(Object.entries(settings).map(([k,v])=>saveSetting(k,v)));
    setSettSaved(true); setTimeout(()=>setSettSaved(false),2000);
  };

  /* ── Analytics ── */
  const stats = useMemo(()=>({
    revenue:     orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+(+o.total),0),
    orders:      orders.length,
    pending:     orders.filter(o=>o.status==="pending").length,
    delivered:   orders.filter(o=>o.status==="delivered").length,
    products:    products.length,
    active:      products.filter(p=>p.is_active).length,
    lowStock:    products.filter(p=>p.stock>0&&p.stock<=5).length,
    outOfStock:  products.filter(p=>p.stock===0).length,
    customers:   customers.length,
    reviews:     reviews.length,
    avgRating:   reviews.length>0 ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : "—",
    activeCoupons: coupons.filter(c=>c.is_active).length,
  }),[orders,products,customers,reviews,coupons]);

  const filteredProducts = useMemo(()=>products.filter(p=>!searchP||(p.name+" "+p.cat+" "+(p.brand??"")).toLowerCase().includes(searchP.toLowerCase())),[products,searchP]);
  const filteredOrders   = useMemo(()=>orderFilter==="all"?orders:orders.filter(o=>o.status===orderFilter),[orders,orderFilter]);

  if (authLoading || !authorized) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",color:T.muted,fontSize:16}}>
      {authLoading ? "লোড হচ্ছে…" : "অ্যাক্সেস নেই"}
    </div>
  );

  /* ── INPUT helper ── */
  const Inp = ({label,value,onChange,type="text",placeholder,full=false}:{label:string;value:string;onChange:(v:string)=>void;type?:string;placeholder?:string;full?:boolean}) => (
    <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:full?"1/-1":"auto"}}>
      <label style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.champagne,fontSize:13,fontFamily:"inherit",width:"100%"}}
        onFocus={e=>(e.target.style.borderColor=T.coral)} onBlur={e=>(e.target.style.borderColor=T.border)} />
    </div>
  );

  return (
    <div style={{display:"flex",minHeight:"calc(100vh - 120px)",background:T.bg}}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}.fade-in{animation:fadeIn .3s ease}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* Sidebar */}
      <aside style={{width:210,background:T.card,borderRight:`1px solid ${T.border}`,padding:"20px 10px",flexShrink:0,position:"sticky",top:0,height:"fit-content"}}>
        <p style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",padding:"0 10px",marginBottom:14}}>Admin Panel</p>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{width:"100%",padding:"11px 14px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:tab===t.id?700:400,background:tab===t.id?"var(--coral-g)":"transparent",color:tab===t.id?T.coral:T.muted,display:"flex",alignItems:"center",gap:9,marginBottom:3,transition:"all .15s",textAlign:"left"}}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
        <div style={{height:1,background:T.border,margin:"12px 0"}}/>
        <a href="/shop" target="_blank"
          style={{display:"flex",alignItems:"center",gap:9,padding:"10px 14px",fontSize:12,color:T.muted,transition:"color .15s"}}
          onMouseEnter={e=>(e.currentTarget.style.color=T.coral)}
          onMouseLeave={e=>(e.currentTarget.style.color=T.muted)}>
          <Ic n="eye" s={14} c={T.muted}/> শপ দেখুন
        </a>
      </aside>

      {/* Main content */}
      <main style={{flex:1,padding:28,overflowX:"auto"}}>

        {/* ════ DASHBOARD ════ */}
        {tab==="dashboard" && (
          <div className="fade-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h2 className="playfair" style={{fontSize:24,fontWeight:700}}>ড্যাশবোর্ড</h2>
              <Btn v="dark" sz="sm" onClick={loadAll}><Ic n="refresh" s={13}/> রিফ্রেশ</Btn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:14,marginBottom:28}}>
              <StatCard icon="💰" label="মোট রাজস্ব"    value={fmt(stats.revenue)}    color={T.ok}     sub={`${stats.delivered} ডেলিভার`}/>
              <StatCard icon="🧾" label="মোট অর্ডার"    value={stats.orders}           color={T.coral}  sub={`${stats.pending} পেন্ডিং`}/>
              <StatCard icon="📦" label="মোট পণ্য"      value={stats.products}         color={T.sky}    sub={`${stats.active} অ্যাক্টিভ`}/>
              <StatCard icon="👥" label="কাস্টমার"       value={stats.customers}        color={T.purple} sub="নিবন্ধিত"/>
              <StatCard icon="⭐" label="রিভিউ"          value={stats.reviews}          color={T.gold}   sub={`গড় ${stats.avgRating}★`}/>
              <StatCard icon="⚠️" label="কম স্টক"       value={stats.lowStock}         color={T.danger} sub={`${stats.outOfStock} শেষ`}/>
            </div>

            {/* Recent orders */}
            <h3 className="playfair" style={{fontWeight:700,fontSize:18,marginBottom:14}}>সাম্প্রতিক অর্ডার</h3>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",marginBottom:24}}>
              {loading ? <div style={{padding:20}}><Skeleton h={200}/></div> :
              orders.slice(0,8).map((o,i)=>{
                const st=STATUS_META[o.status??"pending"]??STATUS_META.pending;
                return (
                  <div key={o.id} style={{display:"grid",gridTemplateColumns:"140px 1fr 100px 120px 90px",gap:12,padding:"12px 18px",borderBottom:i<7?`1px solid ${T.border}`:"none",alignItems:"center"}}>
                    <span className="playfair" style={{fontWeight:700,color:T.coral,fontSize:13}}>{o.order_number}</span>
                    <span style={{fontSize:12,color:T.muted,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{o.shipping_name??o.shipping_city??""}</span>
                    <span style={{fontSize:11,color:T.muted,textTransform:"uppercase"}}>{o.payment_method??"—"}</span>
                    <span style={{background:st.color+"22",color:st.color,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,display:"inline-block"}}>{st.icon} {st.label}</span>
                    <span className="playfair" style={{fontWeight:700,color:T.coral}}>{fmt(+o.total)}</span>
                  </div>
                );
              })}
            </div>

            {/* Low stock */}
            {stats.lowStock>0 && (
              <>
                <h3 className="playfair" style={{fontWeight:700,fontSize:18,marginBottom:14,color:T.gold}}>⚠️ কম স্টক সতর্কতা</h3>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {products.filter(p=>p.stock>=0&&p.stock<=5).map(p=>(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",background:T.card,border:`1px solid rgba(245,200,66,.2)`,borderRadius:10}}>
                      <SafeImg src={p.img} alt={p.name} style={{width:40,height:40,objectFit:"cover",borderRadius:7,flexShrink:0}}/>
                      <span style={{flex:1,fontWeight:700,fontSize:13}}>{p.name}</span>
                      <span style={{color:p.stock===0?T.danger:T.gold,fontWeight:700,fontSize:13}}>{p.stock===0?"স্টক শেষ":`${p.stock} টি বাকি`}</span>
                      <Btn sz="xs" v="outline" onClick={()=>{setTab("products");setEditPId(p.id);setPForm({name:p.name,cat:p.cat,sub:p.sub,brand:p.brand,price:String(p.price),was:String(p.was),badge:p.badge??"",stock:String(p.stock),images:(p.gallery??[]).join(", "),is_active:p.is_active,is_featured:p.is_featured,description:p.desc??""});}}>আপডেট</Btn>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════ PRODUCTS ════ */}
        {tab==="products" && (
          <div className="fade-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 className="playfair" style={{fontSize:22,fontWeight:700}}>পণ্য ব্যবস্থাপনা ({products.length})</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"380px 1fr",gap:24,alignItems:"start"}}>
              {/* Form */}
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:22,position:"sticky",top:20}}>
                <h3 className="playfair" style={{fontWeight:700,fontSize:17,marginBottom:18}}>{editPId?"পণ্য সম্পাদনা":"নতুন পণ্য যোগ"}</h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <Inp label="পণ্যের নাম *" value={pForm.name} onChange={v=>setPForm(f=>({...f,name:v}))} placeholder="নাম" full />
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    <label style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".05em"}}>ক্যাটাগরি</label>
                    <select value={pForm.cat} onChange={e=>setPForm(f=>({...f,cat:e.target.value}))}
                      style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.champagne,fontSize:13,fontFamily:"inherit"}}>
                      {["Bags","Saree","Panjabi","Others"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <Inp label="সাব-ক্যাট" value={pForm.sub} onChange={v=>setPForm(f=>({...f,sub:v}))} placeholder="উপ ক্যাটাগরি" />
                  <Inp label="ব্র্যান্ড" value={pForm.brand} onChange={v=>setPForm(f=>({...f,brand:v}))} placeholder="ব্র্যান্ড" />
                  <Inp label="দাম (৳) *" value={pForm.price} onChange={v=>setPForm(f=>({...f,price:v}))} type="number" placeholder="০" />
                  <Inp label="আগের দাম (৳)" value={pForm.was} onChange={v=>setPForm(f=>({...f,was:v}))} type="number" placeholder="০" />
                  <Inp label="স্টক" value={pForm.stock} onChange={v=>setPForm(f=>({...f,stock:v}))} type="number" placeholder="০" />
                  <Inp label="ব্যাজ" value={pForm.badge} onChange={v=>setPForm(f=>({...f,badge:v}))} placeholder="HOT, NEW…" />
                  <Inp label="ছবির URL (comma দিয়ে আলাদা করুন)" value={pForm.images} onChange={v=>setPForm(f=>({...f,images:v}))} placeholder="https://…" full />
                  {/* Image preview */}
                  {pForm.images.split(",")[0]?.trim() && (
                    <div style={{gridColumn:"1/-1"}}>
                      <img src={pForm.images.split(",")[0].trim()} alt="preview" onError={e=>(e.currentTarget.style.display="none")}
                        style={{width:"100%",height:140,objectFit:"cover",borderRadius:8,border:`1px solid ${T.border}`}} />
                    </div>
                  )}
                  <div style={{gridColumn:"1/-1",display:"flex",flexDirection:"column",gap:5}}>
                    <label style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".05em"}}>বিবরণ</label>
                    <textarea value={pForm.description} onChange={e=>setPForm(f=>({...f,description:e.target.value}))} rows={3}
                      style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.champagne,fontSize:13,fontFamily:"inherit",resize:"vertical"}} />
                  </div>
                  <div style={{gridColumn:"1/-1",display:"flex",gap:20}}>
                    {[["is_active","সক্রিয়",T.ok],["is_featured","ফিচার্ড",T.gold]].map(([k,l,c])=>(
                      <label key={k} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:13}}>
                        <input type="checkbox" checked={(pForm as any)[k]} onChange={e=>setPForm(f=>({...f,[k]:e.target.checked}))}
                          style={{accentColor:c,width:16,height:16}} /> {l}
                      </label>
                    ))}
                  </div>
                </div>
                {pMsg && <p style={{fontSize:12,color:pMsg[0]==="✅"?T.ok:T.danger,marginTop:10}}>{pMsg}</p>}
                <div style={{display:"flex",gap:8,marginTop:14}}>
                  <Btn full onClick={saveProduct} loading={pSaving}><Ic n="check" s={14}/> {editPId?"আপডেট":"যোগ করুন"}</Btn>
                  {editPId && <Btn v="ghost" onClick={()=>{setEditPId(null);setPForm(BLANK_P);setPMsg("");}}>বাতিল</Btn>}
                </div>
              </div>

              {/* Product list */}
              <div>
                <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center"}}>
                  <input value={searchP} onChange={e=>setSearchP(e.target.value)} placeholder="পণ্য খুঁজুন…"
                    style={{flex:1,background:T.raised,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 14px",color:T.champagne,fontSize:13,fontFamily:"inherit"}} />
                  <span style={{fontSize:13,color:T.muted,whiteSpace:"nowrap"}}>{filteredProducts.length} টি</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {filteredProducts.map(p=>(
                    <div key={p.id} style={{display:"flex",gap:12,padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:12,alignItems:"center",transition:"border-color .2s"}}
                      onMouseEnter={e=>(e.currentTarget.style.borderColor=T.borderLt)}
                      onMouseLeave={e=>(e.currentTarget.style.borderColor=T.border)}>
                      <SafeImg src={p.img} alt={p.name} style={{width:52,height:52,objectFit:"cover",borderRadius:8,flexShrink:0}} />
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontWeight:700,fontSize:13,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.name}</p>
                        <p style={{fontSize:11,color:T.muted}}>{p.cat}{p.brand?` · ${p.brand}`:""}</p>
                        <p style={{fontSize:11,color:T.coral,fontWeight:700,marginTop:2}}>{fmt(p.price)}</p>
                      </div>
                      <span style={{fontSize:12,color:p.stock===0?T.danger:p.stock<=5?T.gold:T.ok,fontWeight:700,minWidth:60,textAlign:"center"}}>{p.stock===0?"শেষ":`${p.stock} টি`}</span>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>toggleProductActive(p)} title={p.is_active?"নিষ্ক্রিয়":"সক্রিয়"}
                          style={{background:p.is_active?"rgba(61,235,160,.1)":"rgba(255,68,102,.1)",border:`1px solid ${p.is_active?T.ok:T.danger}`,borderRadius:7,padding:"6px 8px",cursor:"pointer"}}>
                          <Ic n={p.is_active?"check":"x"} s={13} c={p.is_active?T.ok:T.danger} />
                        </button>
                        <button onClick={()=>{setEditPId(p.id);setPForm({name:p.name,cat:p.cat,sub:p.sub,brand:p.brand,price:String(p.price),was:String(p.was),badge:p.badge??"",stock:String(p.stock),images:(p.gallery??[]).join(", "),is_active:p.is_active,is_featured:p.is_featured,description:p.desc??""});window.scrollTo({top:0,behavior:"smooth"});}}
                          style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 8px",cursor:"pointer"}}>
                          <Ic n="edit" s={13} c={T.sky} />
                        </button>
                        <button onClick={()=>deleteProduct(p.id)}
                          style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 8px",cursor:"pointer"}}>
                          <Ic n="trash" s={13} c={T.danger} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ ORDERS ════ */}
        {tab==="orders" && (
          <div className="fade-in">
            <h2 className="playfair" style={{fontSize:22,fontWeight:700,marginBottom:18}}>অর্ডার ব্যবস্থাপনা ({orders.length})</h2>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {["all","pending","processing","shipped","delivered","cancelled"].map(s=>{
                const meta=STATUS_META[s];
                return (
                  <button key={s} onClick={()=>setOrderFilter(s)}
                    style={{padding:"7px 14px",background:orderFilter===s?(meta?.color??T.coral):T.raised,border:`1px solid ${orderFilter===s?(meta?.color??T.coral):T.border}`,borderRadius:20,color:orderFilter===s?"#000":T.muted,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",transition:"all .15s"}}>
                    {meta?`${meta.icon} ${meta.label}`:"সব"} ({s==="all"?orders.length:orders.filter(o=>o.status===s).length})
                  </button>
                );
              })}
            </div>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"140px 1fr 100px 120px 90px 150px",gap:12,padding:"11px 16px",background:T.raised,borderBottom:`1px solid ${T.border}`}}>
                {["অর্ডার","কাস্টমার","পেমেন্ট","স্ট্যাটাস","মোট","পরিবর্তন"].map(h=>(
                  <span key={h} style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".06em"}}>{h}</span>
                ))}
              </div>
              {filteredOrders.slice(0,100).map((o,i)=>{
                const st=STATUS_META[o.status??"pending"]??STATUS_META.pending;
                return (
                  <div key={o.id} style={{display:"grid",gridTemplateColumns:"140px 1fr 100px 120px 90px 150px",gap:12,padding:"12px 16px",borderBottom:i<filteredOrders.length-1?`1px solid ${T.border}`:"none",alignItems:"center",transition:"background .15s"}}
                    onMouseEnter={e=>(e.currentTarget.style.background=T.raised+"88")}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <span className="playfair" style={{fontWeight:700,color:T.coral,fontSize:13}}>{o.order_number}</span>
                    <div>
                      <p style={{fontSize:13,fontWeight:600}}>{o.shipping_name??"—"}</p>
                      <p style={{fontSize:11,color:T.muted}}>{o.shipping_city??""}</p>
                    </div>
                    <span style={{fontSize:11,color:T.muted,textTransform:"uppercase"}}>{o.payment_method??"—"}</span>
                    <span style={{background:st.color+"22",color:st.color,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,display:"inline-block",whiteSpace:"nowrap"}}>{st.icon} {st.label}</span>
                    <span className="playfair" style={{fontWeight:700,color:T.coral,fontSize:14}}>{fmt(+o.total)}</span>
                    <select value={o.status??""} onChange={e=>updateOrderStatus(o.id,e.target.value)}
                      style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:7,padding:"7px 9px",color:T.champagne,fontSize:12,fontFamily:"inherit",cursor:"pointer",width:"100%"}}>
                      {["pending","processing","shipped","delivered","cancelled"].map(s=>(
                        <option key={s} value={s}>{STATUS_META[s]?.label??s}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ CUSTOMERS ════ */}
        {tab==="customers" && (
          <div className="fade-in">
            <h2 className="playfair" style={{fontSize:22,fontWeight:700,marginBottom:18}}>কাস্টমার ব্যবস্থাপনা ({customers.length})</h2>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 100px 80px 120px",gap:12,padding:"11px 16px",background:T.raised,borderBottom:`1px solid ${T.border}`}}>
                {["নাম","ইমেইল","ফোন","অর্ডার","Role"].map(h=>(
                  <span key={h} style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".06em"}}>{h}</span>
                ))}
              </div>
              {customers.map((c,i)=>(
                <div key={c.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 100px 80px 120px",gap:12,padding:"12px 16px",borderBottom:i<customers.length-1?`1px solid ${T.border}`:"none",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,107,74,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:T.coral,flexShrink:0}}>
                      {c.full_name?.[0]?.toUpperCase()??c.email?.[0]?.toUpperCase()}
                    </div>
                    <span style={{fontWeight:700,fontSize:13,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{c.full_name??"—"}</span>
                  </div>
                  <span style={{fontSize:12,color:T.muted,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{c.email}</span>
                  <span style={{fontSize:12,color:T.muted}}>{c.phone??"—"}</span>
                  <span style={{fontSize:13,fontWeight:700,color:T.coral,textAlign:"center"}}>{orders.filter(o=>o.user_id===c.id).length}</span>
                  <select value={c.role??"customer"} onChange={e=>updateCustomerRole(c.id,e.target.value)}
                    style={{background:c.role==="admin"?"rgba(255,107,74,.1)":T.raised,border:`1px solid ${c.role==="admin"?T.coral:T.border}`,borderRadius:7,padding:"6px 9px",color:c.role==="admin"?T.coral:T.champagne,fontSize:12,fontFamily:"inherit",cursor:"pointer"}}>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ))}
              {customers.length===0 && (
                <div style={{padding:"40px",textAlign:"center",color:T.muted}}>কোনো কাস্টমার নেই</div>
              )}
            </div>
          </div>
        )}

        {/* ════ REVIEWS ════ */}
        {tab==="reviews" && (
          <div className="fade-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h2 className="playfair" style={{fontSize:22,fontWeight:700}}>রিভিউ ব্যবস্থাপনা ({reviews.length})</h2>
              <div style={{display:"flex",gap:10,fontSize:13,color:T.muted}}>
                <span>গড় রেটিং: <strong style={{color:T.gold}}>{stats.avgRating}★</strong></span>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {reviews.map(r=>(
                <div key={r.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 18px",display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,fontSize:14}}>{r.user_name}</span>
                      <Stars r={r.rating} s={13}/>
                      <span style={{fontSize:11,color:T.muted}}>{new Date(r.created_at).toLocaleDateString("bn-BD")}</span>
                      <span style={{fontSize:11,color:T.sky}}>📦 {r.products?.name??`পণ্য #${r.product_id}`}</span>
                      <span style={{fontSize:11,color:T.muted}}>👍 {r.helpful}</span>
                    </div>
                    <p style={{fontSize:13,color:T.cream,lineHeight:1.7}}>{r.comment}</p>
                  </div>
                  <button onClick={()=>deleteReview(r.id)}
                    style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 8px",cursor:"pointer",flexShrink:0}}>
                    <Ic n="trash" s={14} c={T.danger}/>
                  </button>
                </div>
              ))}
              {reviews.length===0 && (
                <div style={{padding:"60px",textAlign:"center",color:T.muted}}>কোনো রিভিউ নেই</div>
              )}
            </div>
          </div>
        )}

        {/* ════ COUPONS ════ */}
        {tab==="coupons" && (
          <div className="fade-in">
            <h2 className="playfair" style={{fontSize:22,fontWeight:700,marginBottom:18}}>কুপন ব্যবস্থাপনা</h2>
            <div style={{display:"grid",gridTemplateColumns:"360px 1fr",gap:24,alignItems:"start"}}>
              {/* Coupon form */}
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:22,position:"sticky",top:20}}>
                <h3 className="playfair" style={{fontWeight:700,fontSize:17,marginBottom:16}}>{editCId?"কুপন সম্পাদনা":"নতুন কুপন"}
                </h3>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <Inp label="কুপন কোড *" value={cForm.code} onChange={v=>setCForm(f=>({...f,code:v.toUpperCase()}))} placeholder="KVAD20" />
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <Inp label="ছাড়ের পরিমাণ *" value={cForm.discount} onChange={v=>setCForm(f=>({...f,discount:v}))} type="number" placeholder="20" />
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      <label style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".05em"}}>ধরন</label>
                      <select value={cForm.type} onChange={e=>setCForm(f=>({...f,type:e.target.value}))}
                        style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.champagne,fontSize:13,fontFamily:"inherit"}}>
                        <option value="percent">% শতাংশ</option>
                        <option value="fixed">৳ নির্দিষ্ট</option>
                      </select>
                    </div>
                  </div>
                  <Inp label="সর্বনিম্ন অর্ডার (৳)" value={cForm.min_order} onChange={v=>setCForm(f=>({...f,min_order:v}))} type="number" placeholder="0" />
                  <Inp label="সর্বোচ্চ ব্যবহার" value={cForm.max_uses} onChange={v=>setCForm(f=>({...f,max_uses:v}))} type="number" placeholder="সীমাহীন" />
                  <Inp label="মেয়াদ শেষ" value={cForm.expires_at} onChange={v=>setCForm(f=>({...f,expires_at:v}))} type="date" />
                  <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:13}}>
                    <input type="checkbox" checked={cForm.is_active} onChange={e=>setCForm(f=>({...f,is_active:e.target.checked}))}
                      style={{accentColor:T.coral,width:16,height:16}} /> সক্রিয়
                  </label>
                </div>
                <div style={{display:"flex",gap:8,marginTop:14}}>
                  <Btn full onClick={saveCoupon} loading={cSaving}><Ic n="tag" s={14}/> {editCId?"আপডেট":"তৈরি করুন"}</Btn>
                  {editCId && <Btn v="ghost" onClick={()=>{setEditCId(null);setCForm(BLANK_C);}}>বাতিল</Btn>}
                </div>
              </div>

              {/* Coupon list */}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {coupons.length===0 && !loading && (
                  <div style={{padding:"60px",textAlign:"center",color:T.muted,background:T.card,borderRadius:14,border:`1px solid ${T.border}`}}>কোনো কুপন নেই</div>
                )}
                {coupons.map(c=>(
                  <div key={c.id} style={{background:T.card,border:`1px solid ${c.is_active?T.coral+"44":T.border}`,borderRadius:13,padding:"14px 18px",display:"flex",gap:14,alignItems:"center"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5,flexWrap:"wrap"}}>
                        <span className="playfair" style={{fontWeight:800,fontSize:18,color:T.coral}}>{c.code}</span>
                        <span style={{background:c.is_active?"rgba(61,235,160,.1)":"rgba(255,68,102,.1)",color:c.is_active?T.ok:T.danger,border:`1px solid ${c.is_active?T.ok:T.danger}`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>
                          {c.is_active?"সক্রিয়":"নিষ্ক্রিয়"}
                        </span>
                        <span style={{fontSize:13,fontWeight:700,color:T.gold}}>
                          {c.type==="percent"?`${c.discount}% ছাড়`:`৳${c.discount} ছাড়`}
                        </span>
                      </div>
                      <div style={{display:"flex",gap:16,fontSize:11,color:T.muted,flexWrap:"wrap"}}>
                        {c.min_order>0 && <span>সর্বনিম্ন: {fmt(c.min_order)}</span>}
                        {c.max_uses && <span>সর্বোচ্চ: {c.max_uses}x</span>}
                        <span>ব্যবহার: {c.used_count??0}x</span>
                        {c.expires_at && <span>মেয়াদ: {new Date(c.expires_at).toLocaleDateString("bn-BD")}</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>toggleCoupon(c.id,!c.is_active)}
                        style={{background:c.is_active?"rgba(255,68,102,.1)":"rgba(61,235,160,.1)",border:`1px solid ${c.is_active?T.danger:T.ok}`,borderRadius:7,padding:"6px 10px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",color:c.is_active?T.danger:T.ok}}>
                        {c.is_active?"বন্ধ":"চালু"}
                      </button>
                      <button onClick={()=>{setEditCId(c.id);setCForm({code:c.code,discount:String(c.discount),type:c.type??"percent",min_order:String(c.min_order??0),max_uses:c.max_uses?String(c.max_uses):"",expires_at:c.expires_at?.slice(0,10)??"",is_active:c.is_active});}}
                        style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 8px",cursor:"pointer"}}>
                        <Ic n="edit" s={13} c={T.sky}/>
                      </button>
                      <button onClick={()=>deleteCoupon(c.id)}
                        style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 8px",cursor:"pointer"}}>
                        <Ic n="trash" s={13} c={T.danger}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ ANALYTICS ════ */}
        {tab==="analytics" && (
          <div className="fade-in">
            <h2 className="playfair" style={{fontSize:22,fontWeight:700,marginBottom:22}}>Analytics</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:14,marginBottom:28}}>
              <StatCard icon="💰" label="মোট রাজস্ব"    value={fmt(stats.revenue)}    color={T.ok}/>
              <StatCard icon="🧾" label="মোট অর্ডার"    value={stats.orders}           color={T.coral}/>
              <StatCard icon="🎉" label="ডেলিভার"        value={stats.delivered}        color={T.teal}/>
              <StatCard icon="📦" label="অ্যাক্টিভ পণ্য" value={stats.active}          color={T.sky}/>
              <StatCard icon="⭐" label="মোট রিভিউ"      value={stats.reviews}          color={T.gold}  sub={`গড় ${stats.avgRating}★`}/>
              <StatCard icon="🏷️" label="সক্রিয় কুপন"   value={stats.activeCoupons}    color={T.purple}/>
            </div>

            {/* Order status breakdown */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:22}}>
                <p className="playfair" style={{fontWeight:700,fontSize:16,marginBottom:16}}>অর্ডার স্ট্যাটাস</p>
                {["pending","processing","shipped","delivered","cancelled"].map(s=>{
                  const meta=STATUS_META[s];
                  const count=orders.filter(o=>o.status===s).length;
                  const pct=orders.length>0?Math.round(count/orders.length*100):0;
                  return (
                    <div key={s} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                        <span>{meta.icon} {meta.label}</span>
                        <span style={{fontWeight:700}}>{count} ({pct}%)</span>
                      </div>
                      <div style={{background:T.raised,borderRadius:4,height:8,overflow:"hidden"}}>
                        <div style={{background:meta.color,height:"100%",width:`${pct}%`,borderRadius:4,transition:"width .5s"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:22}}>
                <p className="playfair" style={{fontWeight:700,fontSize:16,marginBottom:16}}>ক্যাটাগরি বিশ্লেষণ</p>
                {["Bags","Saree","Panjabi","Others"].map(cat=>{
                  const count=products.filter(p=>p.cat===cat).length;
                  const max=Math.max(...["Bags","Saree","Panjabi","Others"].map(c=>products.filter(p=>p.cat===c).length),1);
                  return (
                    <div key={cat} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                        <span style={{fontWeight:700}}>{cat}</span>
                        <span style={{color:T.muted}}>{count} পণ্য</span>
                      </div>
                      <div style={{background:T.raised,borderRadius:4,height:8,overflow:"hidden"}}>
                        <div style={{background:T.coral,height:"100%",width:`${Math.round(count/max*100)}%`,borderRadius:4,transition:"width .5s"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top rated products */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:22}}>
              <p className="playfair" style={{fontWeight:700,fontSize:16,marginBottom:14}}>সেরা রেটেড পণ্য (Top 5)</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[...products].sort((a,b)=>b.rating-a.rating).slice(0,5).map((p,i)=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:T.raised,borderRadius:10}}>
                    <span style={{fontWeight:900,color:T.gold,fontSize:16,minWidth:24}}>#{i+1}</span>
                    <SafeImg src={p.img} alt={p.name} style={{width:38,height:38,objectFit:"cover",borderRadius:7}}/>
                    <span style={{flex:1,fontWeight:700,fontSize:13}}>{p.name}</span>
                    <Stars r={p.rating} s={12}/>
                    <span style={{fontSize:12,color:T.muted}}>({p.reviews})</span>
                    <span style={{fontWeight:700,color:T.coral,fontSize:14}}>{fmt(p.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ SETTINGS ════ */}
        {tab==="settings" && (
          <div className="fade-in" style={{maxWidth:640}}>
            <h2 className="playfair" style={{fontSize:22,fontWeight:700,marginBottom:22}}>সাইট সেটিংস</h2>

            {/* General */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:16}}>
              <h3 className="playfair" style={{fontWeight:700,fontSize:17,marginBottom:16}}>🏪 সাধারণ সেটিংস</h3>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[
                  ["announcement_text","Announcement Bar টেক্সট","🔥 ফ্ল্যাশ সেল চলছে | বিকাশ নগদ রকেট COD"],
                  ["free_ship_threshold","ফ্রি শিপিং সীমা (৳)","999"],
                  ["base_ship_cost","বেস ডেলিভারি চার্জ (৳)","80"],
                  ["express_ship_cost","এক্সপ্রেস ডেলিভারি (৳)","120"],
                ].map(([key,label,placeholder])=>(
                  <div key={key} style={{display:"flex",flexDirection:"column",gap:5}}>
                    <label style={{fontSize:12,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</label>
                    <input value={settings[key]??""} onChange={e=>setSettings(prev=>({...prev,[key]:e.target.value}))}
                      placeholder={placeholder}
                      style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 14px",color:T.champagne,fontSize:14,fontFamily:"inherit"}}
                      onFocus={e=>(e.target.style.borderColor=T.coral)}
                      onBlur={e=>(e.target.style.borderColor=T.border)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:16}}>
              <h3 className="playfair" style={{fontWeight:700,fontSize:17,marginBottom:16}}>🔧 Maintenance Mode</h3>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:T.raised,borderRadius:12}}>
                <div>
                  <p style={{fontWeight:700,fontSize:14}}>সাইট রক্ষণাবেক্ষণ মোড</p>
                  <p style={{fontSize:12,color:T.muted,marginTop:3}}>চালু করলে শুধু admin দেখতে পাবেন</p>
                </div>
                <button onClick={()=>setSettings(prev=>({...prev,maintenance:prev.maintenance==="true"?"false":"true"}))}
                  style={{width:52,height:28,borderRadius:14,cursor:"pointer",border:"none",position:"relative",transition:"all .25s",background:settings.maintenance==="true"?T.danger:T.dim}}>
                  <div style={{position:"absolute",top:3,left:settings.maintenance==="true"?26:3,width:22,height:22,borderRadius:"50%",background:"#fff",transition:"all .25s"}}/>
                </button>
              </div>
            </div>

            {/* Multi-store */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginBottom:16}}>
              <h3 className="playfair" style={{fontWeight:700,fontSize:17,marginBottom:16}}>🏬 মাল্টি-স্টোর</h3>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:T.raised,borderRadius:12,marginBottom:14}}>
                <div>
                  <p style={{fontWeight:700,fontSize:14}}>মাল্টি-স্টোর মোড</p>
                  <p style={{fontSize:12,color:T.muted,marginTop:3}}>অন্য বিক্রেতারা স্টোর খুলতে পারবেন</p>
                </div>
                <button onClick={()=>setSettings(prev=>({...prev,multi_store_enabled:prev.multi_store_enabled==="true"?"false":"true"}))}
                  style={{width:52,height:28,borderRadius:14,cursor:"pointer",border:"none",position:"relative",transition:"all .25s",background:settings.multi_store_enabled==="true"?T.ok:T.dim}}>
                  <div style={{position:"absolute",top:3,left:settings.multi_store_enabled==="true"?26:3,width:22,height:22,borderRadius:"50%",background:"#fff",transition:"all .25s"}}/>
                </button>
              </div>
              {settings.multi_store_enabled==="true" && (
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  <label style={{fontSize:12,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".05em"}}>সর্বোচ্চ বিক্রেতা সংখ্যা</label>
                  <input type="number" value={settings.max_sellers??""} onChange={e=>setSettings(prev=>({...prev,max_sellers:e.target.value}))}
                    style={{background:T.raised,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 14px",color:T.champagne,fontSize:14,fontFamily:"inherit",width:180}} />
                </div>
              )}
            </div>

            <Btn v="coral" full sz="lg" onClick={saveAllSettings}>
              {settSaved ? <><Ic n="check" s={16}/> সংরক্ষিত!</> : <><Ic n="check" s={16}/> সব সেটিংস সংরক্ষণ করুন</>}
            </Btn>
          </div>
        )}

      </main>
    </div>
  );
}
