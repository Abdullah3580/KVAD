"use client";
import { useEffect, useState } from "react";
import { T, normalise } from "@/lib/constants";
import { Product } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { SectionHead, EmptyState } from "@/components/ui";
import ProductCard from "@/components/shop/ProductCard";
import { Btn } from "@/components/ui";
import Ic from "@/components/ui/Ic";

export default function WishlistPage() {
  const { wish, toggleWish } = useCart();
  const toast = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      if (wish.length===0) { setItems([]); setLoading(false); return; }
      const { data } = await supabase.from("products").select("*").in("id", wish);
      setItems((data??[]).map(normalise).filter(Boolean) as Product[]);
      setLoading(false);
    })();
  },[wish]);

  return (
    <div style={{ maxWidth:1400, margin:"0 auto", padding:"28px 20px 80px" }}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}`}</style>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28 }}>
        <SectionHead title="আমার উইশলিস্ট" sub={`${wish.length} টি পণ্য সংরক্ষিত`} />
        {wish.length>0 && (
          <Btn v="ghost" sz="sm" onClick={()=>{ wish.forEach(id=>toggleWish(id)); toast("উইশলিস্ট পরিষ্কার"); }}>
            <Ic n="trash" s={14}/> সব বাদ দিন
          </Btn>
        )}
      </div>

      {loading && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
          {[1,2,3,4].map(i=>(
            <div key={i} style={{ background:T.card, borderRadius:14, overflow:"hidden", border:`1px solid ${T.border}` }}>
              <div style={{ paddingTop:"82%", background:`linear-gradient(90deg,${T.raised} 25%,${T.border} 50%,${T.raised} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite" }}/>
              <div style={{ padding:14 }}><div style={{ height:12, background:T.raised, borderRadius:6, marginBottom:8 }}/><div style={{ height:18, background:T.raised, borderRadius:6, width:"60%" }}/></div>
            </div>
          ))}
        </div>
      )}

      {!loading && wish.length===0 && (
        <EmptyState icon="❤️" title="উইশলিস্ট খালি" sub="পছন্দের পণ্যে ❤️ চেপে এখানে সংরক্ষণ করুন।" action="কেনাকাটা শুরু করুন" onAction={()=>window.location.href="/shop"}/>
      )}

      {!loading && items.length>0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
          {items.map(p=><ProductCard key={p.id} p={p}/>)}
        </div>
      )}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}
