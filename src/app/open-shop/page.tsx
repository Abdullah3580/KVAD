"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/context/ToastContext";
import { T } from "@/lib/constants";
import { Btn } from "@/components/ui";
import AuthModal from "@/components/auth/AuthModal";

export default function OpenShopPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const [shopData, setShopData] = useState({
    name: "", description: "", email: "", phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setShowAuth(true); return; }
    if (!shopData.name.trim() || !shopData.email.trim()) {
      toast("শপের নাম ও ইমেইল আবশ্যিক", "warn"); return;
    }
    setLoading(true);
    const { error } = await supabase.from("shops").insert([{
      owner_id: user.id,
      shop_name: shopData.name,
      shop_description: shopData.description,
      business_email: shopData.email,
      contact_number: shopData.phone,
      status: "pending",
    }]);
    if (error) {
      toast("সমস্যা হয়েছে: " + error.message, "err");
    } else {
      await supabase.from("notifications").insert([{
        user_id: null,
        title: "নতুন শপ আবেদন",
        message: `${shopData.name} শপ খোলার জন্য একটি নতুন আবেদন করেছে।`,
      }]);
      setDone(true);
      toast("আবেদন সফলভাবে জমা হয়েছে! ✅");
    }
    setLoading(false);
  };

  if (done) return (
    <div style={{ maxWidth: 500, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
      <h1 className="playfair" style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: T.ok }}>আবেদন সফল!</h1>
      <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.8 }}>
        আপনার শপ খোলার আবেদন আমাদের টিম রিভিউ করছে।<br/>
        অনুমোদন হলে আপনাকে নোটিফিকেশন দেওয়া হবে।
      </p>
    </div>
  );

  return (
    <div style={{
      maxWidth: 520,
      margin: "50px auto",
      padding: "0 20px 60px",
    }}>
      <div style={{ background: T.card, borderRadius: 20, border: `1px solid ${T.border}`, padding: 30, boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
        <h2 className="playfair" style={{ color: T.coral, marginBottom: 8, textAlign: "center", fontSize: 26, fontWeight: 700 }}>আপনার শপ খুলুন</h2>
        <p style={{ color: T.muted, fontSize: 13, textAlign: "center", marginBottom: 28 }}>আবেদন জমা দিন, আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করব।</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <FInput label="শপের নাম *" value={shopData.name} onChange={v => setShopData(s => ({ ...s, name: v }))} placeholder="যেমন: ফ্যাশন হাউজ" />
          <div>
            <p style={labelStyle}>শপ ডেসক্রিপশন</p>
            <textarea
              value={shopData.description}
              onChange={e => setShopData(s => ({ ...s, description: e.target.value }))}
              placeholder="আপনার শপ সম্পর্কে কিছু লিখুন..."
              style={{ ...inputStyle, height: 100, resize: "none" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FInput label="বিজনেস ইমেইল *" value={shopData.email} onChange={v => setShopData(s => ({ ...s, email: v }))} placeholder="example@mail.com" type="email" />
            <FInput label="ফোন নম্বর" value={shopData.phone} onChange={v => setShopData(s => ({ ...s, phone: v }))} placeholder="017XXXXXXXX" type="tel" />
          </div>
          <div style={{ marginTop: 6 }}>
            <Btn v="coral" full loading={loading}>
              {user ? "আবেদন জমা দিন" : "লগইন করে আবেদন করুন"}
            </Btn>
          </div>
        </form>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

function FInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <p style={labelStyle}>{label}</p>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={label.includes("*")}
        style={inputStyle}
        onFocus={e => (e.target.style.borderColor = T.coral)}
        onBlur={e => (e.target.style.borderColor = T.border)}
      />
    </div>
  );
}

const labelStyle: React.CSSProperties = { color: T.muted, fontSize: 12, fontWeight: 700, marginBottom: 7, textTransform: "uppercase", letterSpacing: ".05em", display: "block" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, background: T.raised, border: `1px solid ${T.border}`, color: T.champagne, fontSize: 14, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" };
