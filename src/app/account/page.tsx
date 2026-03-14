"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";
import { T, fmt, STATUS_META } from "@/lib/constants";
import { Btn, SafeImg, Skeleton } from "@/components/ui";
import Ic from "@/components/ui/Ic";
import AuthModal from "@/components/auth/AuthModal";
import Link from "next/link";

type Tab = "profile" | "orders" | "addresses" | "wishlist";

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const toast  = useToast();
  const router = useRouter();

  const [tab,       setTab]     = useState<Tab>("profile");
  const [showAuth,  setShowAuth]= useState(false);
  const [orders,    setOrders]  = useState<any[]>([]);
  const [profile,   setProfile] = useState({ full_name: "", phone: "", avatar_url: "" });
  const [saving,    setSaving]  = useState(false);
  const [loading,   setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    /* load profile */
    supabase.from("users").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name ?? "", phone: data.phone ?? "", avatar_url: data.avatar_url ?? "" });
    });
    /* load orders */
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      setOrders(data ?? []);
    });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("users").update({ full_name: profile.full_name, phone: profile.phone }).eq("id", user.id);
    toast("প্রোফাইল আপডেট হয়েছে ✅");
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast("লগআউট হয়েছে");
    router.push("/shop");
  };

  if (authLoading) return (
    <div style={{ maxWidth: 900, margin: "60px auto", padding: "0 20px" }}>
      <Skeleton h={200} r={16} />
    </div>
  );

  if (!user) return (
    <div style={{ maxWidth: 500, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}.scale-in{animation:scaleIn .26s ease}@keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={{ fontSize: 72, marginBottom: 20 }}>🔐</div>
      <h1 className="playfair" style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>লগইন করুন</h1>
      <p style={{ fontSize: 14, color: T.muted, marginBottom: 28 }}>অ্যাকাউন্ট দেখতে লগইন করুন</p>
      <Btn v="coral" full sz="lg" onClick={() => setShowAuth(true)}>লগইন / রেজিস্ট্রেশন</Btn>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "profile",   label: "প্রোফাইল",  icon: "👤" },
    { id: "orders",    label: "অর্ডার",    icon: "📦" },
    { id: "addresses", label: "ঠিকানা",   icon: "📍" },
    { id: "wishlist",  label: "উইশলিস্ট", icon: "❤️" },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px 80px" }}>
      <style>{`.playfair{font-family:'Playfair Display',Georgia,serif}.fade-in{animation:fadeIn .3s ease}.scale-in{animation:scaleIn .26s ease}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 32, flexWrap: "wrap" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: T.raised, border: `2px solid ${T.coral}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, overflow: "hidden", flexShrink: 0,
        }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : "👤"}
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="playfair" style={{ fontSize: 24, fontWeight: 700 }}>{profile.full_name || "KVAD ব্যবহারকারী"}</h1>
          <p style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>{user.email}</p>
        </div>
        <Btn v="ghost" sz="sm" onClick={handleSignOut}>
          <Ic n="logout" s={14} /> লগআউট
        </Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24 }}>
        {/* Sidebar */}
        <aside style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 12, height: "fit-content" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 9, border: "none",
                cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
                background: tab === t.id ? T.coralG : "transparent",
                color: tab === t.id ? T.coral : T.muted,
                display: "flex", alignItems: "center", gap: 8, marginBottom: 2,
                transition: "all .15s", textAlign: "left",
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div>
          {/* ── Profile ── */}
          {tab === "profile" && (
            <div className="fade-in" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
              <h2 className="playfair" style={{ fontWeight: 700, fontSize: 20, marginBottom: 22 }}>প্রোফাইল তথ্য</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "পুরো নাম", key: "full_name", placeholder: "আপনার নাম" },
                  { label: "ফোন নম্বর", key: "phone", placeholder: "01XXXXXXXXX" },
                ].map(f => (
                  <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>{f.label}</label>
                    <input value={(profile as any)[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", color: T.champagne, fontSize: 14, fontFamily: "inherit" }}
                      onFocus={e => (e.target.style.borderColor = T.coral)}
                      onBlur={e => (e.target.style.borderColor = T.border)} />
                  </div>
                ))}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>ইমেইল</label>
                  <input value={user.email ?? ""} disabled
                    style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", color: T.muted, fontSize: 14, fontFamily: "inherit", cursor: "not-allowed" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>অ্যাকাউন্ট তৈরি</label>
                  <input value={user.created_at ? new Date(user.created_at).toLocaleDateString("bn-BD") : ""} disabled
                    style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", color: T.muted, fontSize: 14, fontFamily: "inherit", cursor: "not-allowed" }} />
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Btn v="coral" loading={saving} onClick={saveProfile}>
                  <Ic n="check" s={15} /> সংরক্ষণ করুন
                </Btn>
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {tab === "orders" && (
            <div className="fade-in">
              <h2 className="playfair" style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>আমার অর্ডার ({orders.length})</h2>
              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: T.muted }}>
                  <div style={{ fontSize: 56, marginBottom: 14 }}>📦</div>
                  <p style={{ fontSize: 16 }}>কোনো অর্ডার নেই</p>
                  <div style={{ marginTop: 16 }}><Btn v="outline" href="/shop">কেনাকাটা শুরু করুন</Btn></div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {orders.map(o => {
                    const meta = STATUS_META[o.status ?? "pending"] ?? STATUS_META.pending;
                    return (
                      <div key={o.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                          <div>
                            <p className="playfair" style={{ fontWeight: 700, fontSize: 15 }}>{o.order_number}</p>
                            <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{new Date(o.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ background: meta.color + "22", color: meta.color, border: `1px solid ${meta.color}44`, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
                              {meta.icon} {meta.label}
                            </span>
                            <span className="playfair" style={{ fontWeight: 800, fontSize: 18, color: T.coral }}>{fmt(Number(o.total))}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Addresses ── */}
          {tab === "addresses" && (
            <div className="fade-in" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
              <h2 className="playfair" style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>সংরক্ষিত ঠিকানা</h2>
              <div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
                <p>শীঘ্রই আসছে — চেকআউটে ঠিকানা সেভ করার সুবিধা</p>
              </div>
            </div>
          )}

          {/* ── Wishlist shortcut ── */}
          {tab === "wishlist" && (
            <div className="fade-in" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>❤️</div>
              <h2 className="playfair" style={{ fontWeight: 700, fontSize: 20, marginBottom: 10 }}>উইশলিস্ট</h2>
              <p style={{ color: T.muted, marginBottom: 20 }}>আপনার সংরক্ষিত পণ্যগুলো দেখুন</p>
              <Btn v="outline" href="/wishlist">উইশলিস্ট দেখুন →</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
