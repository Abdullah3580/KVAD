export const T = {
  bg:        "#080810",
  card:      "#0E0E18",
  raised:    "#141422",
  border:    "#1E1E30",
  borderLt:  "#2A2A42",
  coral:     "#FF6B4A",
  coralD:    "#D4562E",
  coralG:    "rgba(255,107,74,.12)",
  champagne: "#F2E8D9",
  cream:     "#C8BCA8",
  muted:     "#6E6E88",
  dim:       "#363650",
  danger:    "#FF4466",
  ok:        "#3DEBA0",
  sky:       "#4DC4FF",
  gold:      "#F5C842",
  purple:    "#A855F7",
  teal:      "#14B8A6",
} as const;

export const CATS = ["All", "Bags", "Saree", "Panjabi", "Others"] as const;

export const CAT_META: Record<string, { icon: string; desc: string; grad: string }> = {
  All:     { icon: "🛍️", desc: "সব পণ্য", grad: "linear-gradient(135deg,#0E0E18,#141422)" },
  Bags:    { icon: "👜", desc: "প্রিমিয়াম লেদার ও ফেব্রিক", grad: "linear-gradient(135deg,#1a0a00,#3d1a00)" },
  Saree:   { icon: "🥻", desc: "এলিগ্যান্ট হ্যান্ডক্র্যাফট", grad: "linear-gradient(135deg,#0d001a,#2d0050)" },
  Panjabi: { icon: "👘", desc: "ঐতিহ্যবাহী ও আধুনিক", grad: "linear-gradient(135deg,#001a0d,#003d1a)" },
  Others:  { icon: "✨", desc: "কিউরেটেড লাইফস্টাইল", grad: "linear-gradient(135deg,#001a1a,#003d3d)" },
};

export const SORT_OPTS = [
  { v: "featured",   l: "ফিচার্ড প্রথমে" },
  { v: "price-asc",  l: "দাম: কম → বেশি" },
  { v: "price-desc", l: "দাম: বেশি → কম" },
  { v: "rating",     l: "সেরা রেটিং" },
  { v: "discount",   l: "সর্বোচ্চ ছাড়" },
  { v: "popular",    l: "সবচেয়ে জনপ্রিয়" },
  { v: "newest",     l: "নতুন আগে" },
] as const;

export const COUPONS: Record<string, number> = {
  KVAD20: 20, WELCOME10: 10, SAVE15: 15, FLASH30: 30, EID25: 25, FIRST50: 50,
};

export const DELIVERY_OPTS = [
  { key: "standard" as const, label: "সাধারণ (৩–৫ দিন)",   cost: 0,   icon: "🚚" },
  { key: "express"  as const, label: "এক্সপ্রেস (১–২ দিন)", cost: 80,  icon: "⚡" },
  { key: "same_day" as const, label: "ঢাকায় আজকেই",         cost: 120, icon: "🏍️" },
];

export const PAY_METHODS = [
  { id: "cod"    as const, label: "ক্যাশ অন ডেলিভারি", icon: "💵", desc: "পণ্য পেয়ে পেমেন্ট" },
  { id: "bkash"  as const, label: "বিকাশ",             icon: "🟣", desc: "মোবাইল ব্যাংকিং" },
  { id: "nagad"  as const, label: "নগদ",               icon: "🟠", desc: "ডিজিটাল পেমেন্ট" },
  { id: "rocket" as const, label: "রকেট",              icon: "🚀", desc: "DBBL Mobile Banking" },
];

export const BD_DISTRICTS = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট",
  "রংপুর", "ময়মনসিংহ", "কুমিল্লা", "গাজীপুর", "নারায়ণগঞ্জ",
  "টাঙ্গাইল", "ফরিদপুর", "যশোর", "বগুড়া", "দিনাজপুর",
];

export const FREE_SHIP = 999;
export const BASE_SHIP = 80;

export const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  pending:    { label: "পেন্ডিং",    color: "#F5C842", icon: "⏳" },
  processing: { label: "প্রসেসিং",   color: "#FF6B4A", icon: "⚙️" },
  shipped:    { label: "শিপড",       color: "#4DC4FF", icon: "📦" },
  delivered:  { label: "ডেলিভার",    color: "#3DEBA0", icon: "✅" },
  cancelled:  { label: "বাতিল",      color: "#FF4466", icon: "❌" },
};

export const BANNERS = [
  {
    bg: "linear-gradient(135deg,#0d0020,#1a0040,#080810)",
    accent: "#A855F7",
    title: "নতুন কালেকশন",
    sub: "এক্সক্লুসিভ শাড়ি ও পাঞ্জাবি — এখনই দেখুন",
    badge: "NEW ARRIVAL",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&q=80",
    cat: "Saree",
    cta: "এখনই দেখুন",
  },
  {
    bg: "linear-gradient(135deg,#1a0800,#3d1500,#080810)",
    accent: "#FF6B4A",
    title: "প্রিমিয়াম ব্যাগ",
    sub: "লেদার থেকে ক্যানভাস — প্রতিটি মুহূর্তের জন্য",
    badge: "BEST SELLER",
    img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80",
    cat: "Bags",
    cta: "কালেকশন দেখুন",
  },
  {
    bg: "linear-gradient(135deg,#001a08,#003520,#080810)",
    accent: "#3DEBA0",
    title: "ঈদ স্পেশাল অফার",
    sub: "সীমিত সময়ের জন্য সর্বোচ্চ ৩০% ছাড়",
    badge: "EID SPECIAL",
    img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80",
    cat: "Panjabi",
    cta: "অফার দেখুন",
  },
];

export const fmt = (n: number) =>
  "৳" + Number(n).toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const pct = (price: number, was: number) =>
  was && was > price ? Math.round((1 - price / was) * 100) : 0;

export const uid = () => Math.random().toString(36).slice(2, 9);

export const makeCartKey = (id: number, size?: string, color?: string) =>
  `${id}||${size ?? ""}||${color ?? ""}`;

export const normalise = (row: any) => {
  if (!row) return null;
  return {
    ...row,
    cat:     row.cat     ?? "",
    sub:     row.sub     ?? "",
    brand:   row.brand   ?? "",
    desc:    row.description ?? row.desc ?? "",
    price:   +(row.price  ?? 0),
    was:     +(row.was    ?? row.price ?? 0),
    rating:  +(row.rating ?? 5),
    reviews: +(row.reviews ?? 0),
    stock:   +(row.stock  ?? 0),
    img:     Array.isArray(row.images) ? (row.images[0] ?? "") : "",
    gallery: Array.isArray(row.images) && row.images.length ? row.images : [],
    badge:   row.badge   ?? null,
    colors:  row.colors  ?? [],
    sizes:   row.sizes   ?? [],
    is_active:   row.is_active   ?? true,
    is_featured: row.is_featured ?? false,
  };
};
