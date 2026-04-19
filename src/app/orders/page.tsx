"use client";
import { useState, useEffect } from "react";
import { T, fmt, STATUS_META } from "@/lib/constants";
import { Order } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Btn, SafeImg, EmptyState, SectionHead, Skeleton } from "@/components/ui";
import Ic from "@/components/ui/Ic";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TIMELINE = ["pending","processing","shipped","delivered"] as const;

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel,     setSel]     = useState<string|null>(null);
  const [filter,  setFilter]  = useState("all");
  const [q,       setQ]       = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/"); return; }
    (async () => {
      setLoading(true);
      // Fix: filter by user_id so users only see their own orders
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(60);
      setOrders((data ?? []) as Order[]);
      setLoading(false);
    })();
  }, [user, authLoading, router]);

  const list = orders
    .filter(o => filter === "all" || o.status === filter)
    .filter(o => !q || (o.order_number ?? "").toLowerCase().includes(q.toLowerCase()));

  if (authLoading) return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 20px" }}>
      {/* <Skeleton h={200} r={16} /> */}
    <div className="h-[200px] rounded-2xl bg-muted animate-pulse" />
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 80px" }}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}.fade-in{animation:fadeIn .3s ease}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <SectionHead title="আমার অর্ডার" sub={`মোট ${orders.length} টি অর্ডার`} />

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><Ic n="search" s={15} c={T.muted}/></span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="অর্ডার নম্বর খুঁজুন"
            style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 12px 10px 38px", color: T.champagne, fontSize: 13, fontFamily: "inherit", width: 240 }}/>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["all","সব"],["pending","পেন্ডিং"],["processing","প্রসেসিং"],["shipped","শিপড"],["delivered","ডেলিভার"],["cancelled","বাতিল"]].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{ padding: "7px 14px", background: filter === v ? T.coral : T.raised, border: `1px solid ${filter === v ? T.coral : T.border}`, borderRadius: 20, color: filter === v ? "#000" : T.muted, cursor: "pointer", fontSize: 12, fontWeight: filter === v ? 700 : 400, fontFamily: "inherit", transition: "all .15s" }}>{l}</button>
          ))}
        </div>
      </div>

      {loading && (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((_, i) => (
          <div 
            key={i} 
            className="bg-card border border-border rounded-2xl p-6 animate-pulse"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-3 flex-1">
                {/* Order number skeleton */}
                <div className="h-4 bg-muted rounded w-40" />
                
                {/* Date skeleton */}
                <div className="h-3 bg-muted rounded w-32" />
              </div>
              
              {/* Status skeleton */}
              <div className="h-8 w-24 bg-muted rounded-full" />
            </div>

            {/* Price skeleton */}
            <div className="h-5 bg-muted rounded w-28 mt-6" />
          </div>
        ))}
      </div>
    )}
      {!loading && list.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {list.map(o => {
            const st = STATUS_META[o.status ?? "pending"] ?? STATUS_META["pending"];
            const open = sel === o.id;
            const tidx = TIMELINE.indexOf(o.status as typeof TIMELINE[number]);
            return (
              <div key={o.id} className="fade-in" style={{ background: T.card, border: `1px solid ${open ? T.coral : T.border}`, borderRadius: 14, overflow: "hidden", transition: "all .2s" }}>
                <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, cursor: "pointer" }} onClick={() => setSel(open ? null : o.id)}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 14 }}>{o.order_number}</p>
                    <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{new Date(o.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, background: st.color + "22", color: st.color, padding: "4px 12px", borderRadius: 20, fontWeight: 700 }}>{st.icon} {st.label}</span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: T.coral }}>{fmt(o.total)}</span>
                    <Ic n={open ? "chevUp" : "chevDown"} s={16} c={T.muted}/>
                  </div>
                </div>

                {open && (
                  <div className="fade-in" style={{ padding: "0 20px 20px", borderTop: `1px solid ${T.border}` }}>
                    {/* Progress */}
                    {o.status !== "cancelled" && (
                      <div style={{ display: "flex", alignItems: "center", margin: "16px 0" }}>
                        {TIMELINE.map((s, i) => {
                          const done = tidx >= i;
                          const active = tidx === i;
                          const sm = STATUS_META[s];
                          return (
                            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < TIMELINE.length - 1 ? 1 : "none" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? T.ok : T.raised, border: `2px solid ${done ? T.ok : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "all .3s" }}>
                                  {done ? <Ic n="check" s={14} c="#000"/> : <span style={{ fontSize: 14 }}>{sm.icon}</span>}
                                </div>
                                <span style={{ fontSize: 10, color: active ? T.ok : T.muted, fontWeight: active ? 700 : 400, whiteSpace: "nowrap" }}>{sm.label}</span>
                              </div>
                              {i < TIMELINE.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: tidx > i ? T.ok : T.border, margin: "0 6px 16px", transition: "background .3s" }}/>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Shipping */}
                    {o.shipping_name && (
                      <div style={{ background: T.raised, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                        <p style={{ fontSize: 11, color: T.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>ডেলিভারি ঠিকানা</p>
                        <p style={{ fontWeight: 700, fontSize: 13 }}>{o.shipping_name}</p>
                        <p style={{ fontSize: 12, color: T.muted }}>{o.shipping_line1}, {o.shipping_city}</p>
                      </div>
                    )}

                    {/* Items */}
                    {o.items && o.items.length > 0 && (
                      <div className="flex flex-col gap-3 mt-4">
                        {o.items.map(item => (
                          <div 
                            key={item.id} 
                            className="flex gap-4 items-center p-4 bg-muted/50 rounded-xl"
                          >
                            {item.product_image && (
                              <SafeImg 
                                src={item.product_image} 
                                alt={item.product_name}
                                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                              />
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2">{item.product_name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.quantity} × {fmt(item.unit_price)}
                              </p>
                            </div>

                            <div className="font-semibold text-sm whitespace-nowrap">
                              {fmt(item.unit_price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
