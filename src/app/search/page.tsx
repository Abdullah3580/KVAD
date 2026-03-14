"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { T, normalise, pct, SORT_OPTS } from "@/lib/constants";
import { Product } from "@/lib/types";
import ProductCard from "@/components/shop/ProductCard";
import { ProductSkeleton, EmptyState, SectionHead } from "@/components/ui";
import Ic from "@/components/ui/Ic";

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const q0 = params.get("q") ?? "";
  const [q, setQ] = useState(q0);
  const [input, setInput] = useState(q0);
  const [all,  setAll]  = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("rating");
  const [cat, setCat] = useState("All");

  useEffect(()=>{
    if (!q.trim()) return;
    (async()=>{
      setLoading(true);
      const sq = `%${q}%`;
      const { data } = await supabase.from("products").select("*").eq("is_active",true)
        .or(`name.ilike.${sq},cat.ilike.${sq},sub.ilike.${sq},brand.ilike.${sq}`).limit(80);
      setAll((data??[]).map(normalise).filter(Boolean) as Product[]);
      setLoading(false);
    })();
  },[q]);

  const results = useMemo(()=>{
    return all
      .filter(p=>cat==="All"||p.cat===cat)
      .sort((a,b)=>{
        if (sort==="price-asc")  return a.price-b.price;
        if (sort==="price-desc") return b.price-a.price;
        if (sort==="discount")   return pct(b.price,b.was)-pct(a.price,a.was);
        return b.rating-a.rating;
      });
  },[all,sort,cat]);

  const cats = ["All", ...Array.from(new Set(all.map(p=>p.cat).filter(Boolean)))];

  const doSearch = () => {
    const t = input.trim();
    if (t) { setQ(t); router.replace(`/search?q=${encodeURIComponent(t)}`); }
  };

  return (
    <div style={{ maxWidth:1400, margin:"0 auto", padding:"28px 20px 80px" }}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}.fade-in{animation:fadeIn .3s ease}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.shimmer{background:linear-gradient(90deg,#141422 25%,#2A2A42 50%,#141422 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Search bar */}
      <div style={{ maxWidth:640, margin:"0 auto 28px" }}>
        <form onSubmit={e=>{e.preventDefault();doSearch();}} style={{ display:"flex", gap:10 }}>
          <div style={{ position:"relative", flex:1 }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}><Ic n="search" s={18} c={T.muted}/></span>
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="পণ্য, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন…"
              style={{ width:"100%", background:T.raised, border:`2px solid ${T.border}`, borderRadius:12, padding:"14px 14px 14px 46px", color:T.champagne, fontSize:15, fontFamily:"inherit" }}
              onFocus={e=>(e.target.style.borderColor=T.coral)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
          </div>
          <button type="submit" style={{ background:T.coral, border:"none", borderRadius:12, padding:"0 24px", color:"#000", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>খুঁজুন</button>
        </form>
      </div>

      {q && (
        <>
          <SectionHead title={`"${q}" — ${results.length} টি ফলাফল`} />

          {/* Filters */}
          <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {cats.map(c=>(
                <button key={c} onClick={()=>setCat(c)} style={{ padding:"6px 14px", background:cat===c?T.coral:T.raised, border:`1px solid ${cat===c?T.coral:T.border}`, borderRadius:20, color:cat===c?"#000":T.muted, cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>{c}</button>
              ))}
            </div>
            <div style={{ flex:1 }}/>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{ background:T.raised, border:`1px solid ${T.border}`, borderRadius:9, padding:"8px 12px", color:T.champagne, fontSize:13, fontFamily:"inherit" }}>
              {SORT_OPTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>

          {loading && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
              {[1,2,3,4,5,6].map(i=><ProductSkeleton key={i}/>)}
            </div>
          )}
          {!loading && results.length===0 && (
            <EmptyState icon="🔍" title="কোনো ফলাফল নেই" sub={`"${q}" এর জন্য কিছু পাওয়া যায়নি। অন্য শব্দ চেষ্টা করুন।`} action="সব পণ্য দেখুন" onAction={()=>window.location.href="/shop"}/>
          )}
          {!loading && results.length>0 && (
            <div className="fade-in" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
              {results.map(p=><ProductCard key={p.id} p={p}/>)}
            </div>
          )}
        </>
      )}

      {!q && (
        <div style={{ textAlign:"center", paddingTop:60, color:T.muted }}>
          <div style={{ fontSize:72, marginBottom:16 }}>🔍</div>
          <h2 className="playfair" style={{ fontSize:26, fontWeight:700, color:T.champagne, marginBottom:8 }}>কী খুঁজছেন?</h2>
          <p style={{ fontSize:15 }}>উপরে লিখুন — আমরা খুঁজে দেব</p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginTop:24 }}>
            {["ব্যাগ","শাড়ি","পাঞ্জাবি","লেদার","হ্যান্ডব্যাগ"].map(s=>(
              <button key={s} onClick={()=>{setInput(s);setQ(s);router.replace(`/search?q=${encodeURIComponent(s)}`);}}
                style={{ padding:"8px 18px", background:T.raised, border:`1px solid ${T.border}`, borderRadius:20, color:T.muted, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent/></Suspense>;
}
