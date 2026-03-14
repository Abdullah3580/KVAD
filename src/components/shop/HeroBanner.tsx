"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { T, BANNERS } from "@/lib/constants";
import { Btn } from "@/components/ui";
import { SafeImg } from "@/components/ui";
import Ic from "@/components/ui/Ic";

export default function HeroBanner() {
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);
  const b = BANNERS[idx];

  useEffect(() => {
    const t = setInterval(() => {
      setVis(false);
      setTimeout(() => { setIdx(i => (i + 1) % BANNERS.length); setVis(true); }, 350);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{
      position: "relative", overflow: "hidden",
      background: b.bg, minHeight: 440,
      transition: "background .7s",
    }}>
      {/* Diagonal lines decoration */}
      <svg style={{ position: "absolute", inset: 0, opacity: .04, pointerEvents: "none" }} width="100%" height="100%" preserveAspectRatio="none">
        {Array.from({ length: 18 }, (_, i) => (
          <line key={i} x1={`${i * 6}%`} y1="0" x2={`${i * 6 + 20}%`} y2="100%" stroke={b.accent} strokeWidth="1" />
        ))}
      </svg>
      {/* Glow */}
      <div style={{
        position: "absolute", top: "50%", right: "8%",
        width: 450, height: 450, borderRadius: "50%",
        background: b.accent, opacity: .06, filter: "blur(90px)",
        transform: "translateY(-50%)", pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: 1400, margin: "0 auto", padding: "60px 20px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32,
        alignItems: "center",
        opacity: vis ? 1 : 0, transition: "opacity .38s",
      }}>
        {/* Text */}
        <div>
          <span style={{
            display: "inline-block", background: b.accent, color: "#000",
            fontSize: 11, fontWeight: 900, padding: "4px 14px",
            borderRadius: 20, letterSpacing: ".1em", marginBottom: 20,
          }}>{b.badge}</span>

          <h1 className="playfair" style={{
            fontSize: "clamp(32px,5vw,70px)", fontWeight: 900,
            lineHeight: 1.02, color: T.champagne, marginBottom: 16,
          }}>{b.title}</h1>

          <p style={{ fontSize: 16, color: T.cream, lineHeight: 1.8, marginBottom: 30, maxWidth: 460 }}>
            {b.sub}
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
            <Btn sz="lg" href={`/shop?cat=${b.cat}`}>
              {b.cta} <Ic n="arrow" s={16} />
            </Btn>
            <Btn v="ghost" sz="lg" href="/shop">
              সব পণ্য দেখুন
            </Btn>
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["🚚", "ফ্রি ডেলিভারি"], ["🔄", "৩০ দিন রিটার্ন"], ["🔒", "নিরাপদ পেমেন্ট"], ["💯", "অরিজিনাল"]].map(([ic, l]) => (
              <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.muted }}>
                <span>{ic}</span>{l}
              </div>
            ))}
          </div>
        </div>

        {/* Image */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 360, height: 360 }}>
            <div style={{
              position: "absolute", inset: -24, borderRadius: "50%",
              background: `radial-gradient(circle,${b.accent}18,transparent 70%)`,
            }} />
            <div style={{
              width: "100%", height: "100%", borderRadius: 28, overflow: "hidden",
              border: `2px solid ${b.accent}30`,
              boxShadow: `0 0 90px ${b.accent}18`,
            }}>
              <SafeImg src={b.img} alt={b.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {/* Floating stat */}
            <div className="fade-in" style={{
              position: "absolute", bottom: -16, left: -16,
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 16, padding: "10px 18px",
              boxShadow: "0 8px 32px rgba(0,0,0,.5)",
            }}>
              <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>এই মাসে বিক্রি</p>
              <p className="playfair" style={{ fontSize: 24, fontWeight: 900, color: b.accent }}>২,৪৮৩+</p>
            </div>
            {/* Rating float */}
            <div className="fade-in" style={{
              position: "absolute", top: -16, right: -16,
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 16, padding: "10px 18px",
              boxShadow: "0 8px 32px rgba(0,0,0,.5)",
            }}>
              <p style={{ fontSize: 10, color: T.muted }}>গড় রেটিং</p>
              <p className="playfair" style={{ fontSize: 20, fontWeight: 900, color: T.gold }}>⭐ 4.9</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dot nav */}
      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => { setIdx(i); setVis(true); }}
            style={{
              width: i === idx ? 28 : 8, height: 8, borderRadius: 4,
              background: i === idx ? b.accent : T.dim,
              border: "none", transition: "all .3s", cursor: "pointer",
            }} />
        ))}
      </div>
    </section>
  );
}
