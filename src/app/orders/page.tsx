"use client";
import { useState, useEffect } from "react";
import { T, fmt, STATUS_META } from "@/lib/constants";
import { Order } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Btn, SafeImg, EmptyState, SectionHead, Skeleton } from "@/components/ui";
import Ic from "@/components/ui/Ic";
import Link from "next/link";

const TIMELINE = ["pending","processing","shipped","delivered"] as const;

export default function OrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel,     setSel]     = useState<string|null>(null);
  const [filter,  setFilter]  = useState("all");
  const [q,       setQ]       = useState("");

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at",{ascending:false}).limit(60);
      setOrders((data??[]) as Order[]);
      setLoading(false);
    })();
  },[]);

  const list = orders
    .filter(o => filter==="all" || o.status===filter)
    .filter(o => !q || (o.order_number??"").toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 20px 80px" }}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}.fade-in{animation:fadeIn .3s ease}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <SectionHead title="আমার অর্ডার" sub={`মোট ${orders.length} টি অর্ডার`} />

      {/* toolbar */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}><Ic n="search" s={15} c={T.muted}/></span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="অর্ডার নম্বর খুঁজুন"
            style={{ background:T.raised, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px 10px 38px", color:T.champagne, fontSize:13, fontFamily:"inherit", width:240 }}/>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[["all","সব"],["pending","পেন্ডিং"],["processing","প্রসেসিং"],["shipped","শিপড"],["delivered","ডেলিভার"],["cancelled","বাতিল"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{ padding:"7px 14px", background:filter===v?T.coral:T.raised, border:`1px solid ${filter===v?T.coral:T.border}`, borderRadius:20, color:filter===v?"#000":T.muted, cursor:"pointer", fontSize:12, fontWeight:filter===v?700:400, fontFamily:"inherit", transition:"all .15s" }}>{l}</button>
          ))}
        </div>
      </div>

      {loading && <div style={{ display:"flex", flexDirection:"column", gap:12 }}>{[1,2,3].map(i=><div key={i} style={{ background:T.card, borderRadius:14, padding:20, border:`1px solid ${T.border}` }}><Skeleton h={14} w="50%" style={{ marginBottom:10 }}/><Skeleton h={10} w="70%"/></div>)}</div>}
      {!loading && list.length===0 && <EmptyState icon="📦" title="কোনো অর্ডার নেই" sub="এখনই কেনাকাটা শুরু করুন!" action="শপে যান" onAction={()=>window.location.href="/shop"}/>}

      {!loading && list.length>0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {list.map(o=>{
            const st = STATUS_META[o.status??"pending"]??STATUS_META["pending"];
            const open = sel===o.id;
            return (
              <div key={o.id} className="fade-in" style={{ background:T.card, border:`1px solid ${open?T.coral:T.border}`, borderRadius:14, overflow:"hidden", transition:"all .2s" }}>
                {/* header */}
                <div style={{ padding:"16px 20px", background:T.raised, display:"flex", flexWrap:"wrap", gap:16, alignItems:"center" }}>
                  <div><p style={{ fontSize:10, color:T.muted, letterSpacing:".06em", textTransform:"uppercase", marginBottom:2 }}>অর্ডার</p><p className="playfair" style={{ fontWeight:800, fontSize:16, color:T.coral }}>{o.order_number}</p></div>
                  <div><p style={{ fontSize:10, color:T.muted, letterSpacing:".06em", textTransform:"uppercase", marginBottom:2 }}>তারিখ</p><p style={{ fontSize:13, fontWeight:600 }}>{o.created_at?new Date(o.created_at).toLocaleDateString("bn-BD"):"—"}</p></div>
                  <div><p style={{ fontSize:10, color:T.muted, letterSpacing:".06em", textTransform:"uppercase", marginBottom:2 }}>পেমেন্ট</p><p style={{ fontSize:13, fontWeight:600, textTransform:"capitalize" }}>{o.payment_method??"—"}</p></div>
                  <div style={{ flex:1 }}/>
                  <span style={{ background:st.color+"18", color:st.color, border:`1px solid ${st.color}44`, borderRadius:20, padding:"4px 14px", fontSize:12, fontWeight:700 }}>{st.icon} {st.label}</span>
                  <span className="playfair" style={{ fontSize:18, fontWeight:800, color:T.coral }}>{fmt(+o.total)}</span>
                </div>

                {/* timeline */}
                <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ display:"flex", alignItems:"center" }}>
                    {TIMELINE.map((ts,i)=>{
                      const reached = TIMELINE.indexOf((o.status??"pending") as any)>=i;
                      const m = STATUS_META[ts];
                      return (
                        <div key={ts} style={{ display:"flex", alignItems:"center", flex:i<TIMELINE.length-1?"1":"none" }}>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                            <div style={{ width:30, height:30, borderRadius:"50%", background:reached?m.color+"18":T.raised, border:`2px solid ${reached?m.color:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, transition:"all .3s" }}>{m.icon}</div>
                            <span style={{ fontSize:9, color:reached?m.color:T.dim, fontWeight:reached?700:400, whiteSpace:"nowrap" }}>{m.label}</span>
                          </div>
                          {i<TIMELINE.length-1 && <div style={{ flex:1, height:2, background:reached?m.color:T.border, margin:"0 4px 16px", transition:"background .3s" }}/>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* item previews + actions */}
                <div style={{ padding:"12px 20px", display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    {(o.items??[]).slice(0,4).map((it,i)=>(
                      <div key={i} style={{ position:"relative" }}>
                        <SafeImg src={it.product_image} alt={it.product_name} style={{ width:46, height:46, objectFit:"cover", borderRadius:7, border:`1px solid ${T.border}` }}/>
                        {it.quantity>1 && <span style={{ position:"absolute", top:-5, right:-5, background:T.coral, color:"#000", borderRadius:"50%", width:16, height:16, fontSize:8, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{it.quantity}</span>}
                      </div>
                    ))}
                    {(o.items?.length??0)>4 && <div style={{ width:46, height:46, borderRadius:7, background:T.raised, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:T.muted, fontWeight:700 }}>+{(o.items?.length??0)-4}</div>}
                  </div>
                  <div style={{ flex:1 }}/>
                  <div style={{ display:"flex", gap:8 }}>
                    <Btn sz="xs" v="dark" onClick={()=>setSel(open?null:o.id)}><Ic n="eye" s={13}/> {open?"বন্ধ":"বিস্তারিত"}</Btn>
                    {o.status==="pending" && <Btn sz="xs" v="danger" onClick={async()=>{ await supabase.from("orders").update({status:"cancelled"}).eq("id",o.id); setOrders(p=>p.map(x=>x.id===o.id?{...x,status:"cancelled"}:x)); }}>বাতিল</Btn>}
                    {o.status==="delivered" && <Btn sz="xs" v="outline" onClick={()=>window.location.href="/shop"}><Ic n="refresh" s={13}/> আবার কিনুন</Btn>}
                  </div>
                </div>

                {/* expanded detail */}
                {open && (
                  <div className="fade-in" style={{ padding:"0 20px 20px", borderTop:`1px solid ${T.border}` }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, paddingTop:16, marginBottom:14 }}>
                      <div style={{ background:T.raised, borderRadius:12, padding:"14px 18px" }}>
                        <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", marginBottom:8 }}>ডেলিভারি ঠিকানা</p>
                        <p style={{ fontWeight:700 }}>{o.shipping_name}</p>
                        <p style={{ fontSize:13, color:T.muted }}>{o.shipping_line1}</p>
                        <p style={{ fontSize:13, color:T.muted }}>{o.shipping_city} {o.shipping_zip}</p>
                      </div>
                      <div style={{ background:T.raised, borderRadius:12, padding:"14px 18px" }}>
                        <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", marginBottom:8 }}>মূল্য বিবরণ</p>
                        {[["সাবটোটাল",fmt(+(o.subtotal??o.total))],["ছাড়",o.discount&&+o.discount>0?`-${fmt(+o.discount)}`:"—"],["ডেলিভারি",o.shipping_cost&&+o.shipping_cost>0?fmt(+o.shipping_cost):"বিনামূল্যে 🎉"],["মোট",fmt(+o.total)]].map(([k,v],i)=>(
                          <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6, fontWeight:i===3?800:400, color:i===3?T.coral:"inherit" }}>
                            <span style={{ color:i===3?T.coral:T.muted }}>{k}</span><span>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {(o.items??[]).map((it,i)=>(
                      <div key={i} style={{ display:"flex", gap:12, padding:"10px 14px", background:T.raised, borderRadius:10, marginBottom:8 }}>
                        <SafeImg src={it.product_image} alt={it.product_name} style={{ width:52, height:52, objectFit:"cover", borderRadius:7 }}/>
                        <div style={{ flex:1 }}>
                          <Link href={`/product/${it.product_id}`}><p style={{ fontSize:14, fontWeight:700 }}>{it.product_name}</p></Link>
                          {it.selected_size  && <p style={{ fontSize:11, color:T.muted }}>সাইজ: {it.selected_size}</p>}
                          {it.selected_color && <p style={{ fontSize:11, color:T.muted }}>রঙ: {it.selected_color}</p>}
                          <p style={{ fontSize:12, color:T.muted }}>{it.quantity} × {fmt(it.unit_price)}</p>
                        </div>
                        <span style={{ fontWeight:700, color:T.coral }}>{fmt(it.unit_price*it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
