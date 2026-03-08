"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase"; // আপনার ফাইল পাথ অনুযায়ী

/* ═══════════════════════════════════════════════════════
   KVAD  ·  Multi-Category Luxury Shop
   Palette: Deep Obsidian · Champagne · Electric Coral
   Type: Playfair Display (headers) + DM Sans (body)
═══════════════════════════════════════════════════════ */

const T = {
  bg:       "#080810",
  card:     "#0E0E18",
  raised:   "#141422",
  border:   "#1E1E30",
  borderLt: "#2A2A40",
  coral:    "#FF6B4A",
  coralDim: "#D4562E",
  coralGlow:"rgba(255,107,74,0.14)",
  champagne:"#F2E8D9",
  cream:    "#C8BCA8",
  muted:    "#6E6E88",
  dim:      "#363650",
  danger:   "#FF4466",
  ok:       "#3DEBA0",
  sky:      "#4DC4FF",
  gold:     "#F5C842",
};

/* ─── ALL PRODUCTS ─── */
const ALL = [
  // ELECTRONICS
  { id:1,  name:"Phantom X Pro",     cat:"Electronics", sub:"Laptops",    brand:"KVAD",    price:1299, was:1599, rating:4.9, reviews:2341, badge:"Best Seller", stock:12,
    img:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85","https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85","https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&q=85"],
    colors:["#111118","#e8e4dc","#FF6B4A"], desc:"Ultra-thin 14″ OLED powerhouse — KVAD N9 Elite chip, 32 GB RAM, 2 TB NVMe and a 16-hour battery. The thinnest laptop ever made.",
    specs:{CPU:"KVAD N9 Elite",RAM:"32 GB LPDDR6",Storage:"2 TB NVMe",Display:'14″ OLED 120 Hz',Battery:"16 hr",Weight:"1.07 kg"} },
  { id:2,  name:"Arc Watch 5",       cat:"Electronics", sub:"Wearables",  brand:"KVAD",    price:449,  was:549,  rating:4.7, reviews:876,  badge:"New",         stock:45,
    img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85","https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=85"],
    colors:["#111118","#e8d5ae","#1e3a7a"], desc:"Titanium-body smartwatch, 1.9″ AMOLED display, ECG + SpO2, dual-band GPS, 14-day battery.",
    specs:{Display:'1.9″ AMOLED',Battery:"14 days",WaterRes:"100 m",GPS:"Dual-band",Body:"Grade-5 Titanium"} },
  { id:3,  name:"SoundCore Ultra",   cat:"Electronics", sub:"Audio",      brand:"KVAD",    price:299,  was:399,  rating:4.9, reviews:3102, badge:"Flash Sale",   stock:8,
    img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85","https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=85"],
    colors:["#111118","#FF6B4A","#7a0000"], desc:"Flagship over-ear headphones — 40 mm planar drivers, adaptive ANC −45 dB, 40-hour playtime, Hi-Res LDAC.",
    specs:{Drivers:"40 mm Planar",ANC:"−45 dB",Battery:"40 hr",Codec:"LDAC · aptX HD",Weight:"285 g"} },
  { id:4,  name:"UltraScreen 27",    cat:"Electronics", sub:"Displays",   brand:"KVAD",    price:899,  was:1099, rating:4.8, reviews:568,  badge:"New",          stock:14,
    img:"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=85"],
    colors:["#111118"], desc:"27″ 4 K OLED, 240 Hz, 0.03 ms response, factory-calibrated 99 % DCI-P3. Zero-bezel industrial design.",
    specs:{Panel:'27″ OLED',Resolution:"3840×2160",Refresh:"240 Hz",ColorGamut:"99% DCI-P3",Response:"0.03 ms"} },

  // CLOTHING
  { id:5,  name:"Structured Blazer", cat:"Clothing",    sub:"Outerwear",  brand:"KVAD",    price:320,  was:420,  rating:4.7, reviews:412,  badge:"New",          stock:22,
    img:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=85","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=85"],
    colors:["#1a1a2e","#3d2b1f","#f2e8d9"], sizes:["XS","S","M","L","XL","XXL"], desc:"Precision-cut Italian wool blazer with a slim silhouette, double-vent back and horn buttons. Fully canvassed.",
    specs:{Material:"100% Italian Wool",Lining:"Silk blend",Fit:"Slim",Vent:"Double",Buttons:"Natural horn"} },
  { id:6,  name:"Merino Roll-Neck",  cat:"Clothing",    sub:"Knitwear",   brand:"KVAD",    price:165,  was:210,  rating:4.8, reviews:731,  badge:"Best Seller",  stock:37,
    img:"https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=85","https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=85"],
    colors:["#2c2c40","#8b7355","#f2e8d9","#c0392b"], sizes:["XS","S","M","L","XL"], desc:"Extra-fine 18.5-micron merino, ribbed roll-neck, garment-dyed in small batches for deep, lasting colour.",
    specs:{Fibre:"18.5 µm Merino",Weight:"200 gsm",Neck:"Roll",Dye:"Garment-dyed",Origin:"Made in Italy"} },
  { id:7,  name:"Tailored Trousers", cat:"Clothing",    sub:"Bottoms",    brand:"KVAD",    price:245,  was:310,  rating:4.6, reviews:289,  badge:null,           stock:19,
    img:"https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=85"],
    colors:["#1a1a2e","#2c2c40","#8b7355"], sizes:["28","30","32","34","36","38"], desc:"Mid-rise tailored trousers in a Japanese stretch-wool twill. Side adjuster, flat front, clean break hem.",
    specs:{Fabric:"Japanese Stretch-Wool",Rise:"Mid",Front:"Flat",Hem:"Clean break",Origin:"Made in Portugal"} },
  { id:8,  name:"Minimal Tee 3-Pack",cat:"Clothing",    sub:"Basics",     brand:"KVAD",    price:89,   was:115,  rating:4.5, reviews:1820, badge:"Value",        stock:60,
    img:"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=85"],
    colors:["#111118","#f2e8d9","#8b7355"], sizes:["XS","S","M","L","XL","XXL"], desc:"3-pack of 200 gsm supima-cotton tees — preshrunk, taped neck, boxy yet structured cut.",
    specs:{Fabric:"200 gsm Supima Cotton",Pack:"3 pieces",Neck:"Taped crew",Finish:"Preshrunk",Origin:"Made in USA"} },

  // BEAUTY
  { id:9,  name:"Luminance Serum",   cat:"Beauty",      sub:"Skincare",   brand:"KVAD",    price:98,   was:130,  rating:4.9, reviews:2104, badge:"Best Seller",  stock:44,
    img:"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=85","https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=85"],
    colors:["#f2e8d9"], desc:"Triple-acid brightening serum — 10 % glycolic, 2 % tranexamic, 1 % bakuchiol. Clinically proven to reduce hyperpigmentation by 47 % in 8 weeks.",
    specs:{KeyActives:"Glycolic · Tranexamic · Bakuchiol",Size:"30 ml",Skin:"All types",pH:"3.5",Clinical:"Dermatologist tested"} },
  { id:10, name:"Matte Lip Collection",cat:"Beauty",    sub:"Makeup",     brand:"KVAD",    price:52,   was:68,   rating:4.7, reviews:987,  badge:"New",          stock:56,
    img:"https://images.unsplash.com/photo-1631214524020-3c69f4f8c6f0?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1631214524020-3c69f4f8c6f0?w=800&q=85","https://images.unsplash.com/photo-1625093891073-a7d5cccfc455?w=800&q=85"],
    colors:["#8b1a1a","#c0392b","#8b6565","#2c1a1a"], desc:"Long-wear matte lip colour with hyaluronic acid infusion. 12-hour wear, transfer-proof, non-drying formula. Set of 4.",
    specs:{Formula:"Hyaluronic Matte",Wear:"12 hours",Set:"4 shades",Finish:"Transfer-proof",Certifications:"Cruelty-free · Vegan"} },
  { id:11, name:"Cloud Moisturiser",  cat:"Beauty",      sub:"Skincare",   brand:"KVAD",    price:75,   was:95,   rating:4.8, reviews:1543, badge:null,           stock:31,
    img:"https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=800&q=85"],
    colors:["#f2e8d9"], desc:"Lightweight gel-cream moisturiser with oat-derived ceramides and hyaluronic acid. 72-hour hydration lock. Fragrance-free.",
    specs:{KeyActives:"Ceramides · Hyaluronic Acid",Texture:"Gel-cream",Hydration:"72 hr",Size:"50 ml",Fragrance:"Free"} },
  { id:12, name:"Perfume No. 7",      cat:"Beauty",      sub:"Fragrance",  brand:"KVAD",    price:180,  was:220,  rating:4.9, reviews:632,  badge:"Iconic",       stock:18,
    img:"https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=85","https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=800&q=85"],
    colors:["#f5c842","#f2e8d9"], desc:"Unisex eau de parfum — opening bergamot & pink pepper, heart of iris & vetiver, base of amberwood & musk. 100 ml.",
    specs:{Family:"Oriental Woody",TopNotes:"Bergamot · Pink Pepper",HeartNotes:"Iris · Vetiver",BaseNotes:"Amberwood · Musk",Size:"100 ml EDP"} },

  // HOME & LIFESTYLE
  { id:13, name:"Obsidian Lamp",      cat:"Home",        sub:"Lighting",   brand:"KVAD",    price:280,  was:360,  rating:4.8, reviews:344,  badge:"New",          stock:9,
    img:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=85","https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85"],
    colors:["#111118","#f2e8d9"], desc:"Hand-blown glass table lamp with a matte obsidian finish, integrated dimmer, and 2700 K warm LED. A sculptural objet.",
    specs:{Material:"Hand-blown glass",Finish:"Matte obsidian",Light:"2700 K LED",Dimmer:"Integrated rotary",Height:"42 cm"} },
  { id:14, name:"Linen Throw Set",    cat:"Home",        sub:"Textiles",   brand:"KVAD",    price:155,  was:195,  rating:4.7, reviews:521,  badge:"Best Seller",  stock:27,
    img:"https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=85"],
    colors:["#f2e8d9","#8b7355","#2c2c40"], desc:"Set of 2 stonewashed linen throws — 300 gsm Belgian linen, pre-washed for instant softness, finished with hand-rolled edges.",
    specs:{Fabric:"300 gsm Belgian Linen",Set:"2 throws",Size:"130×170 cm",Wash:"Stonewashed",Edges:"Hand-rolled"} },
  { id:15, name:"Pour-Over Set",      cat:"Home",        sub:"Kitchen",    brand:"KVAD",    price:120,  was:155,  rating:4.9, reviews:889,  badge:"Popular",      stock:33,
    img:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=85","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=85"],
    colors:["#111118","#f2e8d9","#8b7355"], desc:"5-piece pour-over coffee set — borosilicate glass dripper, walnut stand, server, gooseneck kettle, and stainless filter.",
    specs:{Material:"Borosilicate glass · Walnut",Set:"5 pieces",Capacity:"600 ml",Filter:"Stainless reusable",Compatibility:"V60 size 02"} },
  { id:16, name:"Modular Shelf Unit", cat:"Home",        sub:"Furniture",  brand:"KVAD",    price:490,  was:620,  rating:4.6, reviews:217,  badge:null,           stock:6,
    img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85",
    gallery:["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85","https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=800&q=85"],
    colors:["#111118","#2c2420","#f2e8d9"], desc:"Modular open shelving in solid white oak — configurable in 4 layouts, adjustable shelves, wall-mount or freestanding.",
    specs:{Material:"Solid White Oak",Config:"4 layouts",Height:"180 cm",Depth:"30 cm",Install:"Wall or freestanding"} },
];

const CATS = ["All","Electronics","Clothing","Beauty","Home"];
const CAT_META = {
  "Electronics":{ icon:"⚡", desc:"Precision-engineered tech" },
  "Clothing":   { icon:"🧥", desc:"Considered wardrobe essentials" },
  "Beauty":     { icon:"✨", desc:"Clinically crafted formulas" },
  "Home":       { icon:"🏠", desc:"Objects worth living with" },
};
const COUPONS = { "KVAD20":20, "WELCOME10":10, "SAVE15":15 };
const fmt = n => "$" + n.toLocaleString("en-US",{minimumFractionDigits:0});
const disc = (p,w) => Math.round((1-p/w)*100);

/* ─── ICONS ─── */
const I = ({ n, s=18, c="currentColor", solid=false }) => {
  const paths = {
    cart:    <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>,
    heart:   <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={solid?c:"none"}/>,
    search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    x:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    star:    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={solid?c:"none"}/>,
    plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    minus:   <line x1="5" y1="12" x2="19" y2="12"/>,
    trash:   <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
    check:   <polyline points="20 6 9 17 4 12" strokeWidth="2.5"/>,
    chR:     <polyline points="9 18 15 12 9 6"/>,
    chL:     <polyline points="15 18 9 12 15 6"/>,
    filter:  <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    grid:    <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    rows:    <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    eye:     <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    truck:   <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    shield:  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    refresh: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></>,
    tag:     <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
    arrowR:  <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    bag:     <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>,
    zap:     <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={solid?c:"none"}/>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[n]}</svg>;
};

const Stars = ({ r, s=13 }) => (
  <span style={{ display:"inline-flex", gap:1.5 }}>
    {[1,2,3,4,5].map(i => <I key={i} n="star" s={s} c={i<=Math.round(r)?T.gold:T.dim} solid={i<=Math.round(r)} />)}
  </span>
);

/* ─── ATOMS ─── */
const Badge = ({ text, type="coral" }) => {
  const bg = { coral:T.coral, danger:T.danger, sky:T.sky, gold:T.gold, ok:T.ok }[type]??T.coral;
  return <span style={{ background:bg, color:"#000", fontSize:9, fontWeight:900, padding:"2px 7px", borderRadius:3, letterSpacing:"0.08em", textTransform:"uppercase", flexShrink:0 }}>{text}</span>;
};

const Btn = ({ children, onClick, v="coral", sz="md", disabled, full, xs }) => {
  const [h, setH] = useState(false);
  const pad = { sm:"6px 13px", md:"10px 22px", lg:"13px 30px" }[sz];
  const fs  = { sm:12, md:14, lg:15 }[sz];
  const variants = {
    coral:   { bg: h?T.coralDim:T.coral,  color:"#000" },
    ghost:   { bg: h?T.raised:"transparent", color:T.muted, border:`1px solid ${T.border}` },
    outline: { bg: h?T.coralGlow:"transparent", color:T.coral, border:`1px solid ${T.coral}` },
    dark:    { bg: h?T.raised:T.card, color:T.champagne, border:`1px solid ${T.border}` },
  };
  const s = variants[v];
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, fontFamily:"inherit", fontWeight:700, fontSize:fs, padding:pad, borderRadius:8, cursor:disabled?"not-allowed":"pointer", opacity:disabled?.5:1, width:full?"100%":"auto", border:"none", transition:"all .18s", letterSpacing:"0.02em", background:s.bg, color:s.color, ...(s.border?{border:s.border}:{}), ...xs }}>
      {children}
    </button>
  );
};

/* ─── CART DRAWER ─── */
const CartDrawer = ({ cart, setCart, onClose, onCheckout }) => {
  const [code, setCode] = useState("");
  const [disc_, setDisc] = useState(0);
  const [msg, setMsg] = useState("");
  const sub  = cart.reduce((s,i)=>s+i.price*i.qty, 0);
  const ship = sub >= 99 ? 0 : 12;
  const tax  = (sub - disc_) * 0.08;
  const tot  = sub - disc_ + ship + tax;

  const apply = () => {
    const p = COUPONS[code.toUpperCase()];
    if (p) { setDisc(sub*(p/100)); setMsg(`✓ ${p}% off applied`); }
    else   { setDisc(0); setMsg("Invalid code — try KVAD20"); }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:900, display:"flex" }}>
      <div onClick={onClose} style={{ flex:1, background:"rgba(0,0,0,.72)", backdropFilter:"blur(6px)" }} />
      <div style={{ width:410, background:T.card, borderLeft:`1px solid ${T.border}`, display:"flex", flexDirection:"column", maxHeight:"100vh" }}>
        <div style={{ padding:"22px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:20 }}>
            Your Bag &nbsp;<span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:400, color:T.muted }}>({cart.reduce((s,i)=>s+i.qty,0)} items)</span>
          </h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer" }}><I n="x" /></button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:10 }}>
          {cart.length===0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:14, color:T.muted, paddingTop:80 }}>
              <I n="bag" s={48} c={T.dim} /><p style={{ fontSize:15 }}>Your bag is empty</p>
            </div>
          ) : cart.map(item=>(
            <div key={item.id} style={{ display:"flex", gap:12, padding:12, background:T.raised, borderRadius:10, border:`1px solid ${T.border}` }}>
              <img src={item.img} alt={item.name} style={{ width:72, height:72, objectFit:"cover", borderRadius:7, flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:11, color:T.muted, marginBottom:2, textTransform:"uppercase", letterSpacing:"0.05em" }}>{item.cat}</p>
                <p style={{ fontWeight:700, fontSize:13, marginBottom:2, lineHeight:1.3 }}>{item.name}</p>
                {item.selectedSize && <p style={{ fontSize:11, color:T.muted, marginBottom:4 }}>Size: {item.selectedSize}</p>}
                <p style={{ color:T.coral, fontWeight:800, fontSize:14, marginBottom:8 }}>{fmt(item.price)}</p>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  {[["minus",()=>setCart(c=>c.map(i=>i.id===item.id?{...i,qty:Math.max(1,i.qty-1)}:i))],["plus",()=>setCart(c=>c.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i))]].map(([ic,fn],idx)=>(
                    <button key={idx} onClick={fn} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:5, width:26, height:26, color:T.champagne, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><I n={ic} s={13} c={T.champagne} /></button>
                  ))}
                  <span style={{ fontWeight:800, minWidth:22, textAlign:"center", fontSize:14 }}>{item.qty}</span>
                  <button onClick={()=>setCart(c=>c.filter(i=>i.id!==item.id))} style={{ marginLeft:"auto", background:"none", border:"none", color:T.danger, cursor:"pointer" }}><I n="trash" s={15} c={T.danger} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ padding:"16px 20px", borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
            <div style={{ display:"flex", gap:7, marginBottom:6 }}>
              <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Coupon code…"
                style={{ flex:1, background:T.raised, border:`1px solid ${T.border}`, borderRadius:7, padding:"8px 12px", color:T.champagne, fontSize:13, fontFamily:"inherit", outline:"none" }} />
              <Btn onClick={apply} sz="sm" v="outline">Apply</Btn>
            </div>
            {msg && <p style={{ fontSize:12, color:msg[0]==="✓"?T.ok:T.danger, marginBottom:10 }}>{msg}</p>}
            <div style={{ display:"flex", flexDirection:"column", gap:6, fontSize:13, marginBottom:16 }}>
              {[["Subtotal",fmt(sub)],["Discount",disc_?`-${fmt(disc_)}`:"—"],["Shipping",ship===0?"FREE":fmt(ship)],["Tax (8%)",fmt(tax)]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:T.muted }}>{k}</span>
                  <span style={{ color:k==="Discount"&&disc_?T.ok:T.champagne, fontWeight:k==="Discount"&&disc_?700:400 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:18, paddingTop:10, borderTop:`1px solid ${T.border}` }}>
                <span>Total</span><span style={{ color:T.coral }}>{fmt(tot)}</span>
              </div>
            </div>
            <Btn v="coral" full onClick={onCheckout}>Checkout &nbsp;<I n="arrowR" s={16} /></Btn>
            {sub<99 && <p style={{ fontSize:11, color:T.muted, textAlign:"center", marginTop:8 }}>Add {fmt(99-sub)} for free shipping</p>}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── QUICK-VIEW MODAL ─── */
const QuickView = ({ p, onClose, onAdd, wish, onWish }) => {
  const [imgIdx, setImgIdx]   = useState(0);
  const [color, setColor]     = useState(0);
  const [size, setSize]       = useState(p.sizes?p.sizes[2]:"");
  const [qty, setQty]         = useState(1);
  const inWish = wish.includes(p.id);
  const pct_ = disc(p.price, p.was);

  useEffect(()=>{ document.body.style.overflow="hidden"; return ()=>{ document.body.style.overflow=""; }; }, []);

  const handleAdd = () => {
    onAdd({ ...p, qty, selectedColor:p.colors?.[color], selectedSize:size });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:800, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.82)", backdropFilter:"blur(10px)" }} />
      <div style={{ position:"relative", width:"100%", maxWidth:900, background:T.card, borderRadius:20, border:`1px solid ${T.border}`, overflow:"hidden", maxHeight:"92vh", overflowY:"auto" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:14, zIndex:2, background:T.raised, border:`1px solid ${T.border}`, borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:T.muted }}><I n="x" s={17} /></button>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
          {/* images */}
          <div style={{ background:T.bg }}>
            <div style={{ position:"relative", paddingTop:"100%", overflow:"hidden" }}>
              <img src={p.gallery[imgIdx]} alt={p.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transition:"opacity .3s" }} />
              <div style={{ position:"absolute", top:14, left:14, display:"flex", flexDirection:"column", gap:5 }}>
                {p.badge && <Badge text={p.badge} />}
                <Badge text={`-${pct_}%`} type="danger" />
              </div>
            </div>
            {p.gallery.length>1 && (
              <div style={{ display:"flex", gap:7, padding:12 }}>
                {p.gallery.map((src,i)=>(
                  <button key={i} onClick={()=>setImgIdx(i)} style={{ width:58, height:46, borderRadius:6, overflow:"hidden", border:`2px solid ${i===imgIdx?T.coral:T.border}`, cursor:"pointer", padding:0, flexShrink:0 }}>
                    <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* info */}
          <div style={{ padding:30, display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <p style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{p.cat} / {p.sub}</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:24, lineHeight:1.15, color:T.champagne, marginBottom:10 }}>{p.name}</h2>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Stars r={p.rating} /><span style={{ fontSize:12, color:T.muted }}>{p.rating} &middot; {p.reviews.toLocaleString()} reviews</span>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"baseline", gap:12 }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, color:T.coral }}>{fmt(p.price)}</span>
              <span style={{ fontSize:15, color:T.dim, textDecoration:"line-through" }}>{fmt(p.was)}</span>
              <span style={{ fontSize:12, color:T.ok }}>Save {fmt(p.was-p.price)}</span>
            </div>

            <p style={{ fontSize:13, color:T.cream, lineHeight:1.75 }}>{p.desc}</p>

            {/* colors */}
            {p.colors && (
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Colour</p>
                <div style={{ display:"flex", gap:8 }}>
                  {p.colors.map((col,i)=>(
                    <button key={i} onClick={()=>setColor(i)} style={{ width:26, height:26, borderRadius:"50%", background:col, border:`3px solid ${i===color?T.coral:T.border}`, cursor:"pointer", transition:"border-color .2s", outline:"none" }} />
                  ))}
                </div>
              </div>
            )}

            {/* sizes */}
            {p.sizes && (
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Size</p>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {p.sizes.map(s=>(
                    <button key={s} onClick={()=>setSize(s)} style={{ padding:"6px 12px", background:size===s?T.coral:T.raised, border:`1px solid ${size===s?T.coral:T.border}`, borderRadius:6, color:size===s?"#000":T.cream, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:size===s?800:400, transition:"all .15s" }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* qty */}
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ display:"flex", border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{ background:T.raised, border:"none", padding:"9px 14px", color:T.champagne, cursor:"pointer" }}><I n="minus" s={14} /></button>
                <span style={{ padding:"9px 20px", fontWeight:800, fontSize:15 }}>{qty}</span>
                <button onClick={()=>setQty(q=>q+1)} style={{ background:T.raised, border:"none", padding:"9px 14px", color:T.champagne, cursor:"pointer" }}><I n="plus" s={14} /></button>
              </div>
              <span style={{ fontSize:12, color:p.stock<10?T.gold:T.ok }}>{p.stock<10?`⚠ Only ${p.stock} left`:"✓ In stock"}</span>
            </div>

            {/* specs preview */}
            <div style={{ background:T.raised, borderRadius:10, padding:"12px 16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 16px" }}>
              {Object.entries(p.specs).slice(0,4).map(([k,v])=>(
                <div key={k} style={{ fontSize:11 }}>
                  <span style={{ color:T.muted }}>{k}: </span>
                  <span style={{ color:T.cream, fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:8, paddingTop:4 }}>
              <Btn v="coral" full onClick={handleAdd}><I n="cart" s={15} /> Add to Bag</Btn>
              <button onClick={()=>onWish(p.id)} style={{ padding:"10px 15px", background:T.raised, border:`1px solid ${inWish?T.danger:T.border}`, borderRadius:8, color:inWish?T.danger:T.muted, cursor:"pointer", flexShrink:0 }}>
                <I n="heart" s={17} c={inWish?T.danger:T.muted} solid={inWish} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── PRODUCT CARD ─── */
const Card = ({ p, onAdd, onWish, wish, onQuick }) => {
  const [hov, setH] = useState(false);
  const inWish = wish.includes(p.id);
  const pct_ = disc(p.price, p.was);

  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:T.card, border:`1px solid ${hov?T.borderLt:T.border}`, borderRadius:14, overflow:"hidden", display:"flex", flexDirection:"column", transition:"all .22s", transform:hov?"translateY(-5px)":"none", boxShadow:hov?`0 20px 60px rgba(0,0,0,.6)`:"none" }}>
      <div style={{ position:"relative", paddingTop:"75%", overflow:"hidden", background:T.bg }}>
        <img src={p.img} alt={p.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transition:"transform .45s", transform:hov?"scale(1.07)":"scale(1)" }} />
        <div style={{ position:"absolute", top:10, left:10, display:"flex", flexDirection:"column", gap:4 }}>
          {p.badge && <Badge text={p.badge} />}
          <Badge text={`-${pct_}%`} type="danger" />
        </div>
        <button onClick={()=>onWish(p.id)} style={{ position:"absolute", top:10, right:10, background:"rgba(8,8,16,.75)", border:"none", borderRadius:"50%", width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <I n="heart" s={15} c={inWish?T.danger:T.champagne} solid={inWish} />
        </button>
        {hov && (
          <div style={{ position:"absolute", bottom:10, left:10, right:10, display:"flex", gap:7 }}>
            <button onClick={()=>onQuick(p)} style={{ flex:1, background:"rgba(8,8,16,.88)", border:`1px solid ${T.border}`, borderRadius:7, padding:"8px", color:T.champagne, cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
              <I n="eye" s={13} /> Quick View
            </button>
            <Btn sz="sm" onClick={()=>onAdd({...p,qty:1})} xs={{ flex:1 }}><I n="cart" s={13} /> Add</Btn>
          </div>
        )}
      </div>

      <div style={{ padding:"14px 16px 18px", flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <p style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>{p.cat} · {p.sub}</p>
          {p.stock < 10 && <span style={{ fontSize:10, color:T.gold, fontWeight:700, flexShrink:0 }}>{p.stock} left</span>}
        </div>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, fontSize:15, lineHeight:1.3, marginBottom:8, color:T.champagne, flex:1 }}>{p.name}</h3>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}>
          <Stars r={p.rating} s={12} /><span style={{ fontSize:11, color:T.muted }}>({p.reviews.toLocaleString()})</span>
        </div>
        <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:700, color:T.coral }}>{fmt(p.price)}</span>
          <span style={{ fontSize:12, color:T.dim, textDecoration:"line-through" }}>{fmt(p.was)}</span>
        </div>
        {p.sizes && (
          <div style={{ display:"flex", gap:4, marginTop:8, flexWrap:"wrap" }}>
            {p.sizes.slice(0,4).map(s=>(
              <span key={s} style={{ fontSize:10, padding:"2px 7px", background:T.raised, border:`1px solid ${T.border}`, borderRadius:4, color:T.muted }}>{s}</span>
            ))}
            {p.sizes.length>4 && <span style={{ fontSize:10, color:T.muted }}>+{p.sizes.length-4}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── ROW VIEW ─── */
const Row = ({ p, onAdd, onWish, wish, onQuick }) => {
  const inWish = wish.includes(p.id);
  const pct_ = disc(p.price, p.was);
  return (
    <div style={{ display:"flex", gap:18, padding:18, background:T.card, border:`1px solid ${T.border}`, borderRadius:13, alignItems:"center" }}>
      <img src={p.img} alt={p.name} style={{ width:120, height:96, objectFit:"cover", borderRadius:9, flexShrink:0 }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", gap:5, marginBottom:5 }}>
          <Badge text={p.cat} />{p.badge&&<Badge text={p.badge} />}<Badge text={`-${pct_}%`} type="danger" />
        </div>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, fontSize:16, marginBottom:5, color:T.champagne }}>{p.name}</h3>
        <p style={{ fontSize:12, color:T.muted, lineHeight:1.5, marginBottom:6 }}>{p.desc.slice(0,110)}…</p>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <Stars r={p.rating} s={12} /><span style={{ fontSize:11, color:T.muted }}>({p.reviews.toLocaleString()})</span>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10, flexShrink:0 }}>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:T.coral }}>{fmt(p.price)}</p>
          <p style={{ fontSize:12, color:T.dim, textDecoration:"line-through" }}>{fmt(p.was)}</p>
        </div>
        <div style={{ display:"flex", gap:7 }}>
          <button onClick={()=>onQuick(p)} style={{ padding:"8px 12px", background:T.raised, border:`1px solid ${T.border}`, borderRadius:7, color:T.muted, cursor:"pointer" }}><I n="eye" s={15} /></button>
          <button onClick={()=>onWish(p.id)} style={{ padding:"8px 12px", background:T.raised, border:`1px solid ${inWish?T.danger:T.border}`, borderRadius:7, color:inWish?T.danger:T.muted, cursor:"pointer" }}>
            <I n="heart" s={15} c={inWish?T.danger:T.muted} solid={inWish} />
          </button>
          <Btn sz="sm" onClick={()=>onAdd({...p,qty:1})}><I n="cart" s={14} /> Add</Btn>
        </div>
      </div>
    </div>
  );
};

/* ─── CHECKOUT MODAL ─── */
const Checkout = ({ cart, setCart, onClose }) => {
  const [step, setStep] = useState(1);
  const [pay,  setPay]  = useState("card");
  const [form, setForm] = useState({ name:"",email:"",addr:"",city:"",zip:"",card:"",exp:"",cvv:"" });
  const [done, setDone] = useState(false);
  const sub = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const tax = sub*.08;
  const tot = sub+tax;
  const orderId = "KVD-" + String(Date.now()).slice(-5);

  useEffect(()=>{ document.body.style.overflow="hidden"; return ()=>{ document.body.style.overflow=""; }; },[]);

  const field = (label,key,ph,type="text") => (
    <div>
      <label style={{ fontSize:11, fontWeight:700, color:T.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</label>
      <input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph}
        style={{ width:"100%", background:T.raised, border:`1px solid ${T.border}`, borderRadius:8, padding:"10px 13px", color:T.champagne, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
    </div>
  );

  if (done) return (
    <div style={{ position:"fixed", inset:0, zIndex:950, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.85)", backdropFilter:"blur(10px)" }} />
      <div style={{ position:"relative", background:T.card, border:`1px solid ${T.border}`, borderRadius:22, padding:52, textAlign:"center", maxWidth:460, width:"100%" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:T.ok+"22", border:`2px solid ${T.ok}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px" }}>
          <I n="check" s={32} c={T.ok} />
        </div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, marginBottom:8, color:T.champagne }}>Order Confirmed</h2>
        <p style={{ color:T.muted, marginBottom:22, lineHeight:1.6 }}>Thank you. Your order has been placed and a confirmation email is on its way.</p>
        <div style={{ background:T.raised, borderRadius:12, padding:18, marginBottom:26 }}>
          <p style={{ fontSize:11, color:T.muted, marginBottom:3 }}>ORDER ID</p>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:T.coral }}>{orderId}</p>
        </div>
        <Btn v="coral" full onClick={()=>{ setCart([]); onClose(); }}>Continue Shopping</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:950, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.82)", backdropFilter:"blur(8px)" }} />
      <div style={{ position:"relative", background:T.card, border:`1px solid ${T.border}`, borderRadius:20, width:"100%", maxWidth:820, maxHeight:"92vh", overflowY:"auto" }}>
        {/* header */}
        <div style={{ padding:"22px 28px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:T.card, zIndex:1 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:20 }}>Checkout</h2>
          <div style={{ display:"flex", alignItems:"center", gap:2 }}>
            {["Shipping","Payment","Review"].map((s,i)=>(
              <div key={s} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20, background:step===i+1?T.coralGlow:"transparent", border:`1px solid ${step===i+1?T.coral:step>i+1?T.ok:"transparent"}` }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:step>i+1?T.ok:step===i+1?T.coral:T.dim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#000" }}>
                    {step>i+1?<I n="check" s={11} c="#000" />:i+1}
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:step===i+1?T.coral:step>i+1?T.ok:T.muted }}>{s}</span>
                </div>
                {i<2 && <div style={{ width:18, height:1, background:step>i+1?T.ok:T.border }} />}
              </div>
            ))}
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer" }}><I n="x" /></button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px" }}>
          <div style={{ padding:28, borderRight:`1px solid ${T.border}` }}>
            {/* STEP 1 */}
            {step===1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, marginBottom:4 }}>Shipping Information</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div style={{ gridColumn:"1/-1" }}>{field("Full Name","name","Jane Smith")}</div>
                  <div style={{ gridColumn:"1/-1" }}>{field("Email","email","jane@example.com","email")}</div>
                  <div style={{ gridColumn:"1/-1" }}>{field("Address","addr","123 Oak Street, Apt 4B")}</div>
                  {field("City","city","New York")} {field("ZIP Code","zip","10001")}
                </div>
                <div style={{ marginTop:6 }}>
                  <p style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>Delivery Method</p>
                  {[["Standard (2–4 days)","FREE"],["Express (1–2 days)","$14.99"],["Overnight","$29.99"]].map(([l,pr])=>(
                    <label key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 15px", background:T.raised, borderRadius:9, marginBottom:7, cursor:"pointer" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        <input type="radio" name="ship" defaultChecked={pr==="FREE"} style={{ accentColor:T.coral }} />
                        <span style={{ fontSize:13 }}>{l}</span>
                      </div>
                      <span style={{ fontWeight:700, color:pr==="FREE"?T.ok:T.champagne, fontSize:13 }}>{pr}</span>
                    </label>
                  ))}
                </div>
                <Btn v="coral" full onClick={()=>setStep(2)}>Continue to Payment <I n="arrowR" s={15} /></Btn>
              </div>
            )}
            {/* STEP 2 */}
            {step===2 && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, marginBottom:4 }}>Payment Method</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                  {[["card","💳 Credit / Debit"],["cod","📦 Cash on Delivery"],["wallet","💰 Digital Wallet"],["crypto","₿ Crypto"]].map(([id,label])=>(
                    <button key={id} onClick={()=>setPay(id)} style={{ padding:"14px", background:pay===id?T.coralGlow:T.raised, border:`2px solid ${pay===id?T.coral:T.border}`, borderRadius:10, cursor:"pointer", fontFamily:"inherit", color:T.champagne, fontWeight:700, fontSize:13, transition:"all .15s" }}>{label}</button>
                  ))}
                </div>
                {pay==="card" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
                    {field("Card Number","card","4242 4242 4242 4242")}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11 }}>
                      {field("Expiry","exp","MM / YY")} {field("CVV","cvv","•••")}
                    </div>
                  </div>
                )}
                {pay!=="card" && <div style={{ padding:18, background:T.raised, borderRadius:9, textAlign:"center", color:T.muted, fontSize:13 }}>You'll be redirected to complete payment after review.</div>}
                <div style={{ display:"flex", gap:9 }}>
                  <Btn v="ghost" onClick={()=>setStep(1)}><I n="chL" s={14} /> Back</Btn>
                  <Btn v="coral" full onClick={()=>setStep(3)}>Review Order <I n="arrowR" s={15} /></Btn>
                </div>
              </div>
            )}
            {/* STEP 3 */}
            {step===3 && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, marginBottom:4 }}>Review &amp; Confirm</h3>
                {cart.map(item=>(
                  <div key={item.id} style={{ display:"flex", gap:13, padding:"12px 0", borderBottom:`1px solid ${T.border}`, alignItems:"center" }}>
                    <img src={item.img} alt={item.name} style={{ width:56, height:56, objectFit:"cover", borderRadius:7 }} />
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700, fontSize:13 }}>{item.name}</p>
                      <p style={{ fontSize:11, color:T.muted }}>Qty {item.qty}{item.selectedSize?` · Size ${item.selectedSize}`:""}</p>
                    </div>
                    <span style={{ fontWeight:800, color:T.coral }}>{fmt(item.price*item.qty)}</span>
                  </div>
                ))}
                <div style={{ padding:13, background:T.raised, borderRadius:9, fontSize:12, color:T.muted, display:"flex", gap:7, alignItems:"center" }}>
                  <I n="shield" s={14} c={T.coral} /> Secured with 256-bit SSL encryption
                </div>
                <div style={{ display:"flex", gap:9 }}>
                  <Btn v="ghost" onClick={()=>setStep(2)}><I n="chL" s={14} /> Back</Btn>
                  <Btn v="coral" full onClick={()=>setDone(true)}><I n="shield" s={15} /> Place Order — {fmt(tot)}</Btn>
                </div>
              </div>
            )}
          </div>

          {/* order summary sidebar */}
          <div style={{ padding:24, background:T.bg }}>
            <h4 style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, marginBottom:16 }}>Summary</h4>
            {cart.map(item=>(
              <div key={item.id} style={{ display:"flex", justifyContent:"space-between", marginBottom:9, gap:8 }}>
                <span style={{ color:T.muted, fontSize:12, lineHeight:1.4 }}>{item.name} ×{item.qty}</span>
                <span style={{ fontWeight:700, fontSize:12, flexShrink:0 }}>{fmt(item.price*item.qty)}</span>
              </div>
            ))}
            <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:12, marginTop:8, display:"flex", flexDirection:"column", gap:7 }}>
              {[["Subtotal",fmt(sub)],["Shipping","FREE"],["Tax (8%)",fmt(tax)]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                  <span style={{ color:T.muted }}>{k}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:19, paddingTop:10, borderTop:`1px solid ${T.border}` }}>
                <span>Total</span><span style={{ color:T.coral }}>{fmt(tot)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══ MAIN APP ═══════════════════════════════════════════════ */
export default function KVADShop() {
  const [productsData, setProductsData] = useState([]); // ডাটাবেস থেকে আসা পণ্যের জন্য
  const [loading, setLoading] = useState(true);         // লোড হচ্ছে কি না জানার জন্য
  const [cart,    setCart]   = useState([]);
  const [wish,    setWish]   = useState([]);
  const [cartOpen,setCO]     = useState(false);
  const [chkOpen, setCHK]    = useState(false);
  const [quickP,  setQuickP] = useState(null);

  // filters
  const [cat,     setCat]    = useState("All");
  const [sort,    setSort]   = useState("featured");
  const [maxP,    setMaxP]   = useState(2500);
  const [minR,    setMinR]   = useState(0);
  const [search,  setSrch]   = useState("");
  const [view,    setView]   = useState("grid");
  const [showF,   setShowF]  = useState(true);

    useEffect(() => {
        async function fetchFromSupabase() {
        try {
            setLoading(true);
            const { data, error } = await supabase
            .from('products') // আপনার সুপাবেজ টেবিলের নাম
            .select('*');
            
            if (error) throw error;
            if (data) setProductsData(data);
        } catch (err) {
            console.error("Error:", err.message);
        } finally {
            setLoading(false);
        }
        }
        fetchFromSupabase();
        //uploadData();
    }, []);

  const addCart = useCallback(p => {
    setCart(prev => {
      const ex = prev.find(i=>i.id===p.id);
      return ex ? prev.map(i=>i.id===p.id?{...i,qty:i.qty+(p.qty||1)}:i) : [...prev,{...p,qty:p.qty||1}];
    });
    setCO(true);
  }, []);
  const toggleWish = useCallback(id => setWish(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id]), []);

  const products = productsData
    .filter(p => cat==="All" || p.cat===cat)
    .filter(p => p.price <= maxP)
    .filter(p => p.rating >= minR)
    .filter(p => {
      const q = search.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    })
    .sort((a,b)=>{
      if (sort==="price-asc")  return a.price-b.price;
      if (sort==="price-desc") return b.price-a.price;
      if (sort==="rating")     return b.rating-a.rating;
      if (sort==="newest")     return b.id-a.id;
      return 0;
    });

  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  const catCounts = Object.fromEntries(CATS.map(c=>[c, c==="All"?ALL.length:ALL.filter(p=>p.cat===c).length]));

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.champagne, fontFamily:"'DM Sans','Helvetica Neue',Arial,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:${T.bg}}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
        input[type=range]{-webkit-appearance:none;height:3px;background:${T.border};border-radius:2px;cursor:pointer;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${T.coral};cursor:pointer}
        select option{background:${T.raised};color:${T.champagne}}
        ::placeholder{color:${T.dim}}
        button:focus{outline:none}
      `}</style>

      {/* ── ANNOUNCEMENT ── */}
      <div style={{ background:`linear-gradient(90deg, ${T.coralDim}, ${T.coral})`, color:"#000", textAlign:"center", padding:"7px 16px", fontSize:12, fontWeight:800, letterSpacing:"0.06em" }}>
        🚚 FREE SHIPPING OVER $99 &nbsp;·&nbsp; CODE <strong>KVAD20</strong> = 20% OFF &nbsp;·&nbsp; 30-DAY HASSLE-FREE RETURNS
      </div>

      {/* ── NAVBAR ── */}
      <header style={{ position:"sticky", top:0, zIndex:600, background:"rgba(8,8,16,.94)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1380, margin:"0 auto", padding:"0 28px", height:66, display:"flex", alignItems:"center", gap:24 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:2, flexShrink:0 }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:26, color:T.coral, letterSpacing:"-0.02em" }}>KVAD</span>
            <span style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:"0.15em", marginLeft:4, textTransform:"uppercase" }}>Studio</span>
          </div>

          {/* live search */}
          <div style={{ flex:1, maxWidth:520, position:"relative" }}>
            <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}><I n="search" s={15} c={T.muted} /></span>
            <input value={search} onChange={e=>setSrch(e.target.value)} placeholder="Search across all categories…"
              style={{ width:"100%", background:T.raised, border:`1px solid ${T.border}`, borderRadius:10, padding:"9px 13px 9px 40px", color:T.champagne, fontSize:13, fontFamily:"inherit", outline:"none" }} />
            {search && (
              <button onClick={()=>setSrch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.muted, cursor:"pointer" }}><I n="x" s={14} /></button>
            )}
          </div>

          <div style={{ flex:1 }} />

          {/* wish */}
          <button style={{ background:"none", border:"none", cursor:"pointer", position:"relative", padding:8, color:T.muted }}>
            <I n="heart" s={22} c={wish.length?T.danger:T.muted} solid={wish.length>0} />
            {wish.length>0 && <span style={{ position:"absolute", top:2, right:2, background:T.danger, color:"#fff", borderRadius:"50%", width:15, height:15, fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{wish.length}</span>}
          </button>

          {/* cart */}
          <button onClick={()=>setCO(true)} style={{ display:"flex", alignItems:"center", gap:9, background:T.raised, border:`1px solid ${T.border}`, borderRadius:10, padding:"9px 18px", cursor:"pointer", color:T.champagne, transition:"all .18s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.coral; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; }}>
            <I n="bag" s={18} /><span style={{ fontSize:14, fontWeight:700 }}>Bag</span>
            {cartCount>0 && <span style={{ background:T.coral, color:"#000", borderRadius:20, padding:"1px 8px", fontSize:11, fontWeight:900 }}>{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <div style={{ position:"relative", overflow:"hidden", background:T.bg }}>
        <div style={{ position:"absolute", inset:0 }}>
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800&q=80" alt=""
            style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.13 }} />
          <div style={{ position:"absolute", inset:0, background:`linear-gradient(110deg, ${T.bg} 45%, transparent 100%)` }} />
        </div>

        {/* decorative diagonal lines */}
        <svg style={{ position:"absolute", right:0, bottom:0, opacity:.04 }} width="700" height="380" viewBox="0 0 700 380">
          {Array.from({length:14},(_,i)=><line key={i} x1={i*55-100} y1="0" x2={i*55+200} y2="380" stroke={T.coral} strokeWidth="1.5"/>)}
        </svg>

        <div style={{ position:"relative", maxWidth:1380, margin:"0 auto", padding:"64px 28px 68px" }}>
          <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
            {Object.entries(CAT_META).map(([c,{icon,desc}])=>(
              <button key={c} onClick={()=>setCat(c)} style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 14px", background:cat===c?T.coralGlow:"rgba(14,14,24,.8)", border:`1px solid ${cat===c?T.coral:T.border}`, borderRadius:30, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, color:cat===c?T.coral:T.muted, transition:"all .18s" }}>
                <span>{icon}</span> {c}
              </button>
            ))}
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"clamp(38px,6vw,74px)", lineHeight:1.02, marginBottom:16, color:T.champagne }}>
            Everything Worth<br /><span style={{ color:T.coral }}>Owning.</span>
          </h1>
          <p style={{ fontSize:16, color:T.cream, maxWidth:460, lineHeight:1.7, marginBottom:30 }}>
            Premium electronics, refined clothing, curated beauty, and considered home objects — all under one roof.
          </p>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {Object.entries(CAT_META).map(([c,{icon}])=>(
              <button key={c} onClick={()=>{ setCat(c); document.getElementById("shop-grid")?.scrollIntoView({behavior:"smooth"}); }}
                style={{ padding:"10px 20px", background:"transparent", border:`1px solid ${T.borderLt}`, borderRadius:8, color:T.cream, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:7, transition:"all .18s" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.coral; e.currentTarget.style.color=T.coral; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.borderLt; e.currentTarget.style.color=T.cream; }}>
                {icon} Shop {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORY STRIP ── */}
      <div style={{ background:T.card, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1380, margin:"0 auto", padding:"0 28px", display:"flex", gap:0, overflowX:"auto" }}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              style={{ padding:"16px 22px", background:"transparent", border:"none", borderBottom:`2px solid ${cat===c?T.coral:"transparent"}`, color:cat===c?T.coral:T.muted, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:cat===c?700:400, whiteSpace:"nowrap", transition:"all .2s", display:"flex", alignItems:"center", gap:6 }}>
              {CAT_META[c]?.icon} {c}
              <span style={{ fontSize:11, background:cat===c?T.coralGlow:T.raised, border:`1px solid ${cat===c?T.coral+"44":T.border}`, color:cat===c?T.coral:T.muted, padding:"1px 7px", borderRadius:20 }}>{catCounts[c]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div id="shop-grid" style={{ maxWidth:1380, margin:"0 auto", padding:"36px 28px 80px", display:"flex", gap:26 }}>

        {/* ── FILTERS ── */}
        {showF && (
          <aside style={{ width:234, flexShrink:0 }}>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:22, position:"sticky", top:82 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:16 }}>Refine</span>
                {(cat!=="All"||minR>0||maxP<2500) && (
                  <button onClick={()=>{ setCat("All"); setMinR(0); setMaxP(2500); }} style={{ fontSize:12, color:T.coral, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>Reset all</button>
                )}
              </div>

              {/* category */}
              <div style={{ marginBottom:24 }}>
                <p style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Category</p>
                {CATS.map(c=>(
                  <button key={c} onClick={()=>setCat(c)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%", padding:"8px 11px", background:cat===c?T.coralGlow:"transparent", border:`1px solid ${cat===c?T.coral:T.border}`, borderRadius:8, color:cat===c?T.coral:T.muted, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:cat===c?700:400, marginBottom:5, transition:"all .15s" }}>
                    <span>{CAT_META[c]?.icon} {c}</span>
                    <span style={{ fontSize:11 }}>{catCounts[c]}</span>
                  </button>
                ))}
              </div>

              {/* price */}
              <div style={{ marginBottom:24 }}>
                <p style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>
                  Max Price: <span style={{ color:T.coral }}>{fmt(maxP)}</span>
                </p>
                <input type="range" min={50} max={2500} step={50} value={maxP} onChange={e=>setMaxP(+e.target.value)} style={{ width:"100%" }} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:T.dim, marginTop:4 }}><span>$50</span><span>$2,500</span></div>
              </div>

              {/* rating */}
              <div>
                <p style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Min Rating</p>
                {[4,3,2,1].map(r=>(
                  <label key={r} style={{ display:"flex", alignItems:"center", gap:9, marginBottom:7, cursor:"pointer" }}>
                    <input type="radio" name="rating" checked={minR===r} onChange={()=>setMinR(r)} style={{ accentColor:T.coral }} />
                    <Stars r={r} s={12} />
                    <span style={{ fontSize:12, color:T.muted }}>&amp; up</span>
                  </label>
                ))}
                {minR>0 && <button onClick={()=>setMinR(0)} style={{ fontSize:11, color:T.muted, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", marginTop:2 }}>Clear ×</button>}
              </div>
            </div>
          </aside>
        )}

        {/* ── PRODUCTS ── */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* toolbar */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
            <button onClick={()=>setShowF(f=>!f)} style={{ display:"flex", alignItems:"center", gap:6, background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 14px", color:showF?T.coral:T.muted, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, transition:"all .18s" }}>
              <I n="filter" s={14} c={showF?T.coral:T.muted} /> {showF?"Hide":"Show"} Filters
            </button>
            <span style={{ fontSize:13, color:T.muted }}><span style={{ color:T.champagne, fontWeight:700 }}>{products.length}</span> results</span>
            <div style={{ flex:1 }} />
            <select value={sort} onChange={e=>setSort(e.target.value)}
              style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 13px", color:T.champagne, fontSize:13, cursor:"pointer", fontFamily:"inherit", outline:"none" }}>
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Best Rated</option>
              <option value="newest">Newest</option>
            </select>
            <div style={{ display:"flex", background:T.card, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
              {[["grid","grid"],["rows","list"]].map(([ic,id])=>(
                <button key={id} onClick={()=>setView(id)} style={{ padding:"8px 12px", background:view===id?T.raised:"transparent", border:"none", cursor:"pointer" }}>
                  <I n={ic} s={16} c={view===id?T.coral:T.muted} />
                </button>
              ))}
            </div>
          </div>

          {/* active filter tags */}
          {(cat!=="All"||minR>0||search||maxP<2500) && (
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:18 }}>
              {cat!=="All" && <span style={{ background:T.coralGlow, border:`1px solid ${T.coral}55`, borderRadius:20, padding:"4px 12px", fontSize:12, color:T.coral, display:"flex", alignItems:"center", gap:5 }}>{cat} <button onClick={()=>setCat("All")} style={{ background:"none", border:"none", color:T.coral, cursor:"pointer", fontSize:14, lineHeight:1, padding:0 }}>×</button></span>}
              {minR>0 && <span style={{ background:T.coralGlow, border:`1px solid ${T.coral}55`, borderRadius:20, padding:"4px 12px", fontSize:12, color:T.coral, display:"flex", alignItems:"center", gap:5 }}>{minR}★+ <button onClick={()=>setMinR(0)} style={{ background:"none", border:"none", color:T.coral, cursor:"pointer", fontSize:14, lineHeight:1, padding:0 }}>×</button></span>}
              {maxP<2500 && <span style={{ background:T.coralGlow, border:`1px solid ${T.coral}55`, borderRadius:20, padding:"4px 12px", fontSize:12, color:T.coral, display:"flex", alignItems:"center", gap:5 }}>Under {fmt(maxP)} <button onClick={()=>setMaxP(2500)} style={{ background:"none", border:"none", color:T.coral, cursor:"pointer", fontSize:14, lineHeight:1, padding:0 }}>×</button></span>}
              {search && <span style={{ background:T.coralGlow, border:`1px solid ${T.coral}55`, borderRadius:20, padding:"4px 12px", fontSize:12, color:T.coral, display:"flex", alignItems:"center", gap:5 }}>"{search}" <button onClick={()=>setSrch("")} style={{ background:"none", border:"none", color:T.coral, cursor:"pointer", fontSize:14, lineHeight:1, padding:0 }}>×</button></span>}
            </div>
          )}

          {/* empty state */}
          {products.length===0 && (
            <div style={{ textAlign:"center", padding:"80px 0", color:T.muted }}>
              <I n="search" s={48} c={T.dim} />
              <p style={{ marginTop:16, fontSize:16, marginBottom:16 }}>No products match your filters</p>
              <Btn v="outline" onClick={()=>{ setCat("All"); setMinR(0); setMaxP(2500); setSrch(""); }}>Clear all filters</Btn>
            </div>
          )}

          {view==="grid" ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(234px,1fr))", gap:18 }}>
              {products.map(p=><Card key={p.id} p={p} onAdd={addCart} onWish={toggleWish} wish={wish} onQuick={setQuickP} />)}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {products.map(p=><Row key={p.id} p={p} onAdd={addCart} onWish={toggleWish} wish={wish} onQuick={setQuickP} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── VALUE PROPS ── */}
      <div style={{ background:T.card, borderTop:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1380, margin:"0 auto", padding:"40px 28px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:20 }}>
          {[["truck","Free Shipping","On all orders over $99"],["shield","2-Year Warranty","On all KVAD products"],["refresh","30-Day Returns","No questions asked"],["zap","Same-Day Dispatch","Order by 2 pm","solid"]].map(([icon,title,desc,s])=>(
            <div key={title} style={{ display:"flex", gap:13, alignItems:"flex-start" }}>
              <div style={{ width:42, height:42, borderRadius:10, background:T.coralGlow, border:`1px solid ${T.coral}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <I n={icon} s={19} c={T.coral} solid={!!s} />
              </div>
              <div>
                <p style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{title}</p>
                <p style={{ fontSize:12, color:T.muted }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background:T.bg, borderTop:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1380, margin:"0 auto", padding:"32px 28px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
          <div>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:T.coral }}>KVAD</span>
            <p style={{ fontSize:12, color:T.muted, marginTop:3 }}>Premium goods for a considered life.</p>
          </div>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            {["Visa","Mastercard","PayPal","Apple Pay","Google Pay"].map(pm=>(
              <span key={pm} style={{ padding:"4px 10px", background:T.raised, border:`1px solid ${T.border}`, borderRadius:6, fontSize:11, color:T.muted, fontWeight:700 }}>{pm}</span>
            ))}
          </div>
          <p style={{ fontSize:12, color:T.dim }}>© 2025 KVAD Studio. All rights reserved.</p>
        </div>
      </footer>

      {/* ── OVERLAYS ── */}
      {cartOpen && <CartDrawer cart={cart} setCart={setCart} onClose={()=>setCO(false)} onCheckout={()=>{ setCO(false); setCHK(true); }} />}
      {chkOpen  && <Checkout   cart={cart} setCart={setCart} onClose={()=>setCHK(false)} />}
      {quickP   && <QuickView  p={quickP} onClose={()=>setQuickP(null)} onAdd={addCart} wish={wish} onWish={toggleWish} />}
    </div>
  );
}
