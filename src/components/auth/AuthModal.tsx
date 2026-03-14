"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { T } from "@/lib/constants";
import { Btn } from "@/components/ui";
import Ic from "@/components/ui/Ic";

interface Props { onClose: () => void; defaultTab?: "login" | "signup"; }

/* Field কে বাইরে রাখতে হবে — নইলে প্রতি কীস্ট্রোকে re-mount হয় */
function Field({ label, value, onChange, type = "text", placeholder, onEnter }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; onEnter?: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onEnter?.()}
        placeholder={placeholder}
        style={{
          background: T.raised, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: "12px 14px", color: T.champagne,
          fontSize: 14, fontFamily: "inherit", transition: "border-color .2s",
          width: "100%", outline: "none",
        }}
        onFocus={e => (e.target.style.borderColor = T.coral)}
        onBlur={e => (e.target.style.borderColor = T.border)}
      />
    </div>
  );
}

export default function AuthModal({ onClose, defaultTab = "login" }: Props) {
  const { signIn, signUp, googleSignIn } = useAuth();
  const toast = useToast();

  const [tab,      setTab]     = useState<"login" | "signup">(defaultTab);
  const [loading,  setLoading] = useState(false);
  const [showPass, setShowPass]= useState(false);
  const [email,    setEmail]   = useState("");
  const [password, setPassword]= useState("");
  const [name,     setName]    = useState("");
  const [phone,    setPhone]   = useState("");
  const [err,      setErr]     = useState("");

  const handleSubmit = async () => {
    setErr(""); setLoading(true);
    if (tab === "login") {
      const e = await signIn(email, password);
      if (e) setErr(e);
      else { toast("স্বাগতম! 👋"); onClose(); }
    } else {
      if (!name.trim())             { setErr("নাম লিখুন"); setLoading(false); return; }
      if (!/^01\d{9}$/.test(phone)) { setErr("সঠিক ফোন নম্বর দিন"); setLoading(false); return; }
      if (password.length < 6)      { setErr("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর"); setLoading(false); return; }
      const e = await signUp(email, password, name, phone);
      if (e) setErr(e);
      else { toast("অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল verify করুন 📧"); onClose(); }
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.8)", backdropFilter: "blur(10px)" }} />

      <div className="scale-in" style={{
        position: "relative", width: "100%", maxWidth: 420,
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 22, padding: "32px 28px",
        boxShadow: "0 32px 80px rgba(0,0,0,.8)", margin: "0 16px",
      }}>
        <button onClick={onClose}
          style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer" }}>
          <Ic n="x" s={20} c={T.muted} />
        </button>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span className="playfair" style={{ fontSize: 32, fontWeight: 900, color: T.coral }}>KVAD</span>
          <p style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
            {tab === "login" ? "আপনার অ্যাকাউন্টে লগইন করুন" : "নতুন অ্যাকাউন্ট তৈরি করুন"}
          </p>
        </div>

        <div style={{ display: "flex", background: T.raised, borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {(["login", "signup"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setErr(""); }}
              style={{
                flex: 1, padding: "9px", borderRadius: 9, border: "none",
                cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                background: tab === t ? T.card : "transparent",
                color: tab === t ? T.champagne : T.muted, transition: "all .18s",
              }}>
              {t === "login" ? "লগইন" : "রেজিস্ট্রেশন"}
            </button>
          ))}
        </div>

        <button onClick={googleSignIn}
          style={{
            width: "100%", padding: "12px", background: T.raised,
            border: `1px solid ${T.border}`, borderRadius: 12,
            cursor: "pointer", fontFamily: "inherit", fontSize: 14,
            color: T.champagne, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginBottom: 18, transition: "all .18s",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = T.coral)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
          <span style={{ fontSize: 18 }}>G</span>
          Google দিয়ে {tab === "login" ? "লগইন" : "সাইনআপ"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 12, color: T.muted }}>অথবা</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tab === "signup" && (
            <Field label="পুরো নাম" value={name} onChange={setName}
              placeholder="আপনার নাম" onEnter={handleSubmit} />
          )}
          <Field label="ইমেইল" value={email} onChange={setEmail}
            type="email" placeholder="email@example.com" onEnter={handleSubmit} />
          {tab === "signup" && (
            <Field label="ফোন নম্বর" value={phone} onChange={setPhone}
              type="tel" placeholder="01XXXXXXXXX" onEnter={handleSubmit} />
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>পাসওয়ার্ড</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••"
                style={{
                  width: "100%", background: T.raised, border: `1px solid ${T.border}`,
                  borderRadius: 10, padding: "12px 44px 12px 14px", color: T.champagne,
                  fontSize: 14, fontFamily: "inherit", outline: "none",
                }}
                onFocus={e => (e.target.style.borderColor = T.coral)}
                onBlur={e => (e.target.style.borderColor = T.border)}
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                <Ic n="eye" s={16} c={T.muted} />
              </button>
            </div>
          </div>

          {err && (
            <div style={{ background: "rgba(255,68,102,.1)", border: "1px solid rgba(255,68,102,.3)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: T.danger }}>
              ⚠ {err}
            </div>
          )}

          <Btn v="coral" full sz="lg" loading={loading} onClick={handleSubmit}>
            {tab === "login" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
          </Btn>

          {tab === "login" && (
            <p style={{ fontSize: 12, color: T.muted, textAlign: "center" }}>
              পাসওয়ার্ড ভুলে গেছেন?{" "}
              <button onClick={async () => {
                if (!email) { setErr("ইমেইল লিখুন আগে"); return; }
                await import("@/lib/supabase").then(m => m.supabase.auth.resetPasswordForEmail(email));
                toast("রিসেট লিঙ্ক পাঠানো হয়েছে 📧");
              }}
                style={{ color: T.coral, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700 }}>
                রিসেট করুন
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}