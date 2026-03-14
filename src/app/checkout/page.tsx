"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { T, fmt, FREE_SHIP, COUPONS, DELIVERY_OPTS, PAY_METHODS, BD_DISTRICTS } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";
import { SafeImg, Btn, EmptyState } from "@/components/ui";
import Ic from "@/components/ui/Ic";

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const toast = useToast();
  const [step,    setStep]    = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [orderNum,setOrderNum]= useState("");
  const [done,    setDone]    = useState(false);
  const [addr, setAddr] = useState({ name:"", phone:"", line1:"", city:"", district:"", zip:"" });
  const [delivery, setDelivery] = useState<"standard"|"express"|"same_day">("standard");
  const [pay, setPay]   = useState<"cod"|"bkash"|"nagad"|"rocket">("cod");
  const [code, setCode] = useState(""); const [disc, setDisc] = useState(0); const [cMsg, setCMsg] = useState("");
  const [mobile, setMobile] = useState("");

  const shipCost = DELIVERY_OPTS.find(d => d.key === delivery)?.cost ?? 0;
  const sub = cartTotal;
  const tot = sub - disc + (sub >= FREE_SHIP ? 0 : shipCost);
  const applyCode = () => { const p = COUPONS[code.trim().toUpperCase()]; if (p) { setDisc(sub*p/100); setCMsg(`✓ ${p}% ছাড়`); } else { setDisc(0); setCMsg("অকার্যকর ❌"); } };
  const addrValid = addr.name && addr.phone.length >= 11 && addr.line1 && addr.city;

  const placeOrder = async () => {
    setLoading(true);
    try {
      const num = "KVD-" + Math.random().toString(36).slice(2,7).toUpperCase();
      const { data: order, error } = await supabase.from("orders").insert({
        order_number: num, status: "pending", total: tot,
        subtotal: sub, discount: disc, shipping_cost: sub >= FREE_SHIP ? 0 : shipCost,
        shipping_address: `${addr.name}, ${addr.line1}, ${addr.city}, ${addr.district} ${addr.zip}`,
        shipping_name: addr.name, shipping_line1: addr.line1,
        shipping_city: addr.city, shipping_zip: addr.zip, payment_method: pay,
      }).select().single();
      if (error) throw error;
      if (order) await supabase.from("order_items").insert(
        cart.map(i => ({ order_id: order.id, product_id: i.id, product_name: i.name,
          product_image: i.img, selected_size: i.selectedSize ?? null,
          selected_color: i.selectedColor ?? null, unit_price: i.price, quantity: i.qty }))
      );
      setOrderNum(num); clearCart(); setDone(true);
    } catch (e: any) { toast(e.message ?? "অর্ডার হয়নি ❌", "err"); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div style={{ maxWidth: 540, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}@keyframes sc{from{transform:scale(0)}to{transform:scale(1)}}`}</style>
      <div style={{ width: 90, height: 90, background: T.ok+"11", border:`2px solid ${T.ok}`, borderRadius:"50%", margin:"0 auto 24px", display:"flex", alignItems:"center", justifyContent:"center", animation:"sc .5s cubic-bezier(.34,1.56,.64,1)" }}>
        <Ic n="check" s={44} c={T.ok} />
      </div>
      <h1 className="playfair" style={{ fontSize:32, fontWeight:800, marginBottom:8, color:T.ok }}>অর্ডার সফল! 🎉</h1>
      <p style={{ color:T.muted, fontSize:15, marginBottom:24, lineHeight:1.7 }}>আপনার অর্ডার গ্রহণ হয়েছে।<br/>শীঘ্রই প্রক্রিয়া শুরু হবে।</p>
      <div style={{ background:T.raised, borderRadius:14, padding:"20px 28px", marginBottom:28, border:`1px solid ${T.border}` }}>
        <p style={{ fontSize:12, color:T.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".08em" }}>অর্ডার নম্বর</p>
        <p className="playfair" style={{ fontSize:26, fontWeight:900, color:T.coral }}>{orderNum}</p>
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
        <Btn onClick={() => router.push("/orders")} v="outline">অর্ডার দেখুন</Btn>
        <Btn onClick={() => router.push("/shop")}>আবার কেনাকাটা</Btn>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div style={{ maxWidth:1400, margin:"0 auto", padding:"60px 20px" }}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}`}</style>
      <EmptyState icon="🛒" title="কার্ট খালি" sub="আগে পণ্য যোগ করুন।" action="শপে যান" onAction={() => router.push("/shop")} />
    </div>
  );

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 20px 80px" }}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}`}</style>
      {/* Steps indicator */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:36 }}>
        {[{n:1,l:"ঠিকানা"},{n:2,l:"পেমেন্ট"},{n:3,l:"রিভিউ"}].map((s,i) => (
          <div key={s.n} style={{ display:"flex", alignItems:"center" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background: step>s.n?T.ok:step===s.n?T.coral:T.raised, border:`2px solid ${step>s.n?T.ok:step===s.n?T.coral:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:step>=s.n?"#000":T.muted, transition:"all .3s" }}>
                {step>s.n ? <Ic n="check" s={16} c="#000"/> : s.n}
              </div>
              <span style={{ fontSize:11, color:step===s.n?T.coral:T.muted, fontWeight:step===s.n?700:400 }}>{s.l}</span>
            </div>
            {i<2 && <div style={{ width:80, height:2, background:step>s.n?T.ok:T.border, margin:"0 6px 16px", transition:"background .3s" }}/>}
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:28 }}>
        <div>
          {/* ── STEP 1 ── */}
          {step===1 && (
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:28 }}>
              <h2 className="playfair" style={{ fontWeight:700, fontSize:22, marginBottom:24 }}>📍 ডেলিভারি ঠিকানা</h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <FInput label="পূর্ণ নাম *"        val={addr.name}     set={v=>setAddr({...addr,name:v})}     ph="আপনার নাম" />
                <FInput label="ফোন *"              val={addr.phone}    set={v=>setAddr({...addr,phone:v})}    ph="01XXXXXXXXX" />
                <div style={{ gridColumn:"1/-1" }}>
                  <FInput label="ঠিকানা *"          val={addr.line1}    set={v=>setAddr({...addr,line1:v})}   ph="বাড়ি, রাস্তা, এলাকা" />
                </div>
                <FInput label="শহর / উপজেলা *"     val={addr.city}     set={v=>setAddr({...addr,city:v})}    ph="শহরের নাম" />
                <div>
                  <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:7 }}>জেলা</p>
                  <select value={addr.district} onChange={e=>setAddr({...addr,district:e.target.value})}
                    style={{ width:"100%", background:T.raised, border:`1px solid ${T.border}`, borderRadius:10, padding:"11px 14px", color:addr.district?T.champagne:T.dim, fontSize:14, fontFamily:"inherit" }}>
                    <option value="">জেলা বেছে নিন</option>
                    {BD_DISTRICTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <FInput label="পোস্ট কোড"          val={addr.zip}      set={v=>setAddr({...addr,zip:v})}     ph="1000" />
              </div>
              <h3 className="playfair" style={{ fontWeight:700, fontSize:18, margin:"24px 0 14px" }}>🚚 ডেলিভারি পদ্ধতি</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {DELIVERY_OPTS.map(o=>(
                  <label key={o.key} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background:delivery===o.key?T.coralG:T.raised, border:`2px solid ${delivery===o.key?T.coral:T.border}`, borderRadius:11, cursor:"pointer", transition:"all .18s" }}>
                    <input type="radio" name="del" checked={delivery===o.key} onChange={()=>setDelivery(o.key)} style={{ accentColor:T.coral }}/>
                    <span style={{ fontSize:20 }}>{o.icon}</span>
                    <div style={{ flex:1 }}><p style={{ fontWeight:700, fontSize:14 }}>{o.label}</p></div>
                    <span style={{ fontWeight:800, color:o.cost===0?T.ok:T.champagne }}>{o.cost===0?"বিনামূল্যে":fmt(o.cost)}</span>
                  </label>
                ))}
              </div>
              <div style={{ marginTop:24 }}>
                <Btn full sz="lg" disabled={!addrValid} onClick={()=>setStep(2)}>পেমেন্টে যান <Ic n="arrow" s={16}/></Btn>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step===2 && (
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:28 }}>
              <BackBtn onClick={()=>setStep(1)}/>
              <h2 className="playfair" style={{ fontWeight:700, fontSize:22, marginBottom:24 }}>💳 পেমেন্ট পদ্ধতি</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                {PAY_METHODS.map(m=>(
                  <label key={m.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px", background:pay===m.id?T.coralG:T.raised, border:`2px solid ${pay===m.id?T.coral:T.border}`, borderRadius:12, cursor:"pointer", transition:"all .18s" }}>
                    <input type="radio" name="pay" checked={pay===m.id} onChange={()=>setPay(m.id)} style={{ accentColor:T.coral }}/>
                    <span style={{ fontSize:24 }}>{m.icon}</span>
                    <div style={{ flex:1 }}><p style={{ fontWeight:700, fontSize:15 }}>{m.label}</p><p style={{ fontSize:12, color:T.muted }}>{m.desc}</p></div>
                    {pay===m.id && <Ic n="check" s={18} c={T.coral}/>}
                  </label>
                ))}
              </div>
              {pay!=="cod" && (
                <div style={{ marginBottom:20 }}>
                  <FInput label={`${PAY_METHODS.find(m=>m.id===pay)?.label} নম্বর`} val={mobile} set={setMobile} ph="01XXXXXXXXX"/>
                  <div style={{ background:T.raised, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 16px", marginTop:10, fontSize:13, color:T.muted, lineHeight:1.8 }}>
                    <p style={{ fontWeight:700, color:T.gold, marginBottom:4 }}>⚠ নির্দেশনা</p>
                    <p>অ্যাপ → Send Money → 01XXXXXXXX (KVAD) → অর্ডার নম্বর reference দিন।</p>
                  </div>
                </div>
              )}
              <div style={{ background:T.raised, borderRadius:12, padding:16, marginBottom:20 }}>
                <p style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>🏷️ কুপন কোড</p>
                <div style={{ display:"flex", gap:8 }}>
                  <input value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&applyCode()} placeholder="KVAD20, EID25…"
                    style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", color:T.champagne, fontSize:13, fontFamily:"inherit" }}/>
                  <Btn sz="sm" v="outline" onClick={applyCode}>প্রয়োগ</Btn>
                </div>
                {cMsg && <p style={{ fontSize:12, color:cMsg[0]==="✓"?T.ok:T.danger, marginTop:6 }}>{cMsg}</p>}
              </div>
              <Btn full sz="lg" onClick={()=>setStep(3)}>অর্ডার রিভিউ করুন <Ic n="arrow" s={16}/></Btn>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step===3 && (
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:28 }}>
              <BackBtn onClick={()=>setStep(2)}/>
              <h2 className="playfair" style={{ fontWeight:700, fontSize:22, marginBottom:24 }}>📋 অর্ডার রিভিউ</h2>
              <SummaryBlock title="ডেলিভারি ঠিকানা" onEdit={()=>setStep(1)}>
                <p style={{ fontWeight:700, fontSize:14 }}>{addr.name} · {addr.phone}</p>
                <p style={{ fontSize:13, color:T.muted }}>{addr.line1}, {addr.city}, {addr.district} {addr.zip}</p>
              </SummaryBlock>
              <SummaryBlock title="পেমেন্ট" onEdit={()=>setStep(2)}>
                <p style={{ fontWeight:700, fontSize:14 }}>{PAY_METHODS.find(m=>m.id===pay)?.icon} {PAY_METHODS.find(m=>m.id===pay)?.label}</p>
                <p style={{ fontSize:13, color:T.muted }}>ডেলিভারি: {DELIVERY_OPTS.find(d=>d.key===delivery)?.label}</p>
              </SummaryBlock>
              <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:20 }}>
                {cart.map(item=>(
                  <div key={item.cartKey} style={{ display:"flex", gap:12, padding:"10px 14px", background:T.raised, borderRadius:10 }}>
                    <SafeImg src={item.img} alt={item.name} style={{ width:54, height:54, objectFit:"cover", borderRadius:7, flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as any }}>{item.name}</p>
                      <p style={{ fontSize:12, color:T.muted }}>{item.qty} × {fmt(item.price)}</p>
                    </div>
                    <span style={{ fontWeight:700, color:T.coral, flexShrink:0 }}>{fmt(item.price*item.qty)}</span>
                  </div>
                ))}
              </div>
              <Btn full sz="xl" onClick={placeOrder} loading={loading}>
                <Ic n="check" s={18}/> অর্ডার নিশ্চিত করুন
              </Btn>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:22, position:"sticky", top:140 }}>
            <h3 className="playfair" style={{ fontWeight:700, fontSize:17, marginBottom:16 }}>অর্ডার সারসংক্ষেপ</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14, maxHeight:240, overflowY:"auto" }}>
              {cart.map(item=>(
                <div key={item.cartKey} style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ position:"relative" }}>
                    <SafeImg src={item.img} alt={item.name} style={{ width:44, height:44, objectFit:"cover", borderRadius:7, flexShrink:0 }}/>
                    <span style={{ position:"absolute", top:-6, right:-6, background:T.coral, color:"#000", borderRadius:"50%", width:18, height:18, fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{item.qty}</span>
                  </div>
                  <p style={{ fontSize:12, flex:1, lineHeight:1.3, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as any }}>{item.name}</p>
                  <span style={{ fontWeight:700, fontSize:13, flexShrink:0 }}>{fmt(item.price*item.qty)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:12, display:"flex", flexDirection:"column", gap:8, fontSize:13 }}>
              <RRow k="সাবটোটাল" v={fmt(sub)}/>
              {disc>0 && <RRow k="কুপন ছাড়" v={`-${fmt(disc)}`} vc={T.ok}/>}
              <RRow k="ডেলিভারি" v={sub>=FREE_SHIP?"বিনামূল্যে 🎉":fmt(shipCost)} vc={sub>=FREE_SHIP?T.ok:undefined}/>
              <div style={{ display:"flex", justifyContent:"space-between", fontWeight:900, fontSize:20, paddingTop:10, borderTop:`1px solid ${T.border}` }}>
                <span>মোট</span><span style={{ color:T.coral }}>{fmt(tot)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FInput({ label, val, set, ph }: { label:string; val:string; set:(v:string)=>void; ph?:string }) {
  return (
    <div>
      <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:7 }}>{label}</p>
      <input value={val} onChange={e=>set(e.target.value)} placeholder={ph}
        style={{ width:"100%", background:T.raised, border:`1px solid ${T.border}`, borderRadius:10, padding:"11px 14px", color:T.champagne, fontSize:14, fontFamily:"inherit" }}
        onFocus={e=>(e.target.style.borderColor=T.coral)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
    </div>
  );
}
function BackBtn({ onClick }: { onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:13, marginBottom:20, fontFamily:"inherit" }}>
      <Ic n="chL" s={14} c={T.muted}/> পেছনে
    </button>
  );
}
function SummaryBlock({ title, onEdit, children }: { title:string; onEdit:()=>void; children:React.ReactNode }) {
  return (
    <div style={{ background:T.raised, borderRadius:12, padding:"14px 18px", marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:".06em" }}>{title}</p>
        <button onClick={onEdit} style={{ fontSize:12, color:T.coral, background:"none", border:"none", cursor:"pointer", fontWeight:700, fontFamily:"inherit" }}>পরিবর্তন</button>
      </div>
      {children}
    </div>
  );
}
function RRow({ k, v, vc }: { k:string; v:string; vc?:string }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between" }}>
      <span style={{ color:T.muted }}>{k}</span>
      <span style={{ fontWeight:vc?700:400, color:vc??T.champagne }}>{v}</span>
    </div>
  );
}
