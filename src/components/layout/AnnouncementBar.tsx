import { T } from "@/lib/constants";

const MSGS = [
  "🚚 ৳৯৯৯+ অর্ডারে বিনামূল্যে ডেলিভারি",
  "🔥 কোড KVAD20 দিয়ে ২০% ছাড়",
  "⚡ ফ্ল্যাশ সেল চলছে — সীমিত সময়",
  "🎁 ঈদ স্পেশাল কালেকশন এসে গেছে",
  "✅ বিকাশ · নগদ · রকেট · COD গ্রহণযোগ্য",
  "🔄 ৩০ দিনের ফেরত নিশ্চয়তা",
  "📦 ঢাকায় একই দিনে ডেলিভারি পাওয়া যাচ্ছে",
  "💯 ১০০% অরিজিনাল পণ্য — গ্যারান্টিড",
];

export default function AnnouncementBar() {
  const str = MSGS.join("   ✦   ");
  return (
    <div style={{
      background: `linear-gradient(90deg,var(--coral-d),${T.coral},#f5a442,${T.gold})`,
      color: "#000", padding: "7px 0", overflow: "hidden", position: "relative",
    }}>
      <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div style={{
        display: "flex", whiteSpace: "nowrap",
        animation: "ticker 32s linear infinite",
      }}>
        {[0, 1].map(r => (
          <span key={r} style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".04em", paddingRight: 40 }}>
            {str}
          </span>
        ))}
      </div>
    </div>
  );
}
