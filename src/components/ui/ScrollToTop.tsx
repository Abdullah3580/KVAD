"use client";
import { useState, useEffect } from "react";
import { T } from "@/lib/constants";
import Ic from "./Ic";

export default function ScrollToTop() {
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const onScroll = () => setVis(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!vis) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fade-in"
      style={{
        position: "fixed", bottom: 90, right: 22, zIndex: 400,
        width: 44, height: 44, borderRadius: "50%",
        background: T.raised, border: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,.5)", cursor: "pointer",
        transition: "all .2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = T.coral)}
      onMouseLeave={e => (e.currentTarget.style.background = T.raised)}
    >
      <Ic n="chevUp" s={18} c={T.champagne} />
    </button>
  );
}
