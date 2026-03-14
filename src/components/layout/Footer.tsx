"use client";
import Link from "next/link";
import { T, CATS } from "@/lib/constants";

export default function Footer() {
  const cols = [
    {
      title: "শপ",
      links: [
        ...CATS.filter(c => c !== "All").map(c => ({ label: c, href: `/shop?cat=${c}` })),
        { label: "অফার", href: "/shop?sort=discount" },
        { label: "নতুন", href: "/shop?sort=newest" },
      ],
    },
    {
      title: "কাস্টমার সার্ভিস",
      links: [
        { label: "অর্ডার ট্র্যাক", href: "/orders" },
        { label: "রিটার্ন পলিসি", href: "#" },
        { label: "FAQ", href: "#" },
        { label: "শিপিং তথ্য", href: "#" },
        { label: "পেমেন্ট গাইড", href: "#" },
      ],
    },
    {
      title: "KVAD সম্পর্কে",
      links: [
        { label: "আমাদের গল্প", href: "#" },
        { label: "যোগাযোগ", href: "#" },
        { label: "গোপনীয়তা নীতি", href: "#" },
        { label: "শর্তাবলী", href: "#" },
      ],
    },
  ];

  return (
    <footer style={{ background: T.bg, borderTop: `1px solid ${T.border}` }}>
      {/* Value props bar */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto", padding: "28px 20px",
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16,
        }}>
          {[
            ["🚚", "বিনামূল্যে ডেলিভারি", "৳৯৯৯+ অর্ডারে"],
            ["🔄", "৩০ দিন রিটার্ন", "কোনো প্রশ্ন ছাড়াই"],
            ["🔒", "নিরাপদ পেমেন্ট", "বিকাশ, নগদ, রকেট"],
            ["📞", "২৪/৭ কাস্টমার কেয়ার", "যেকোনো সমস্যায়"],
            ["💯", "১০০% অরিজিনাল", "গ্যারান্টিড পণ্য"],
          ].map(([ic, t, d]) => (
            <div key={t as string} style={{
              display: "flex", gap: 12, alignItems: "center",
              padding: "12px 16px", background: T.raised,
              borderRadius: 12, border: `1px solid ${T.border}`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: T.coralG, border: `1px solid var(--coral-g)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 20,
              }}>{ic}</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{t as string}</p>
                <p style={{ fontSize: 11, color: T.muted }}>{d as string}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div style={{
        maxWidth: 1400, margin: "0 auto", padding: "44px 20px 28px",
        display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 36,
      }}>
        {/* Brand */}
        <div>
          <span className="playfair" style={{ fontSize: 28, fontWeight: 900, color: T.coral }}>KVAD</span>
          <p style={{ fontSize: 13, color: T.muted, marginTop: 10, lineHeight: 1.8, maxWidth: 260 }}>
            বাংলাদেশের সেরা প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল অনলাইন শপ।
            প্রতিটি পণ্যে মানের নিশ্চয়তা।
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            {["বিকাশ", "নগদ", "রকেট", "COD"].map(pm => (
              <span key={pm} style={{
                padding: "4px 12px", background: T.raised,
                border: `1px solid ${T.border}`, borderRadius: 6,
                fontSize: 12, color: T.muted, fontWeight: 700,
              }}>{pm}</span>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>যোগাযোগ করুন</p>
            <p style={{ fontSize: 13, color: T.cream }}>📞 01XXXXXXXXX</p>
            <p style={{ fontSize: 13, color: T.cream, marginTop: 4 }}>✉️ support@kvad.com</p>
          </div>
        </div>

        {/* Link cols */}
        {cols.map(col => (
          <div key={col.title}>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, color: T.champagne }}>{col.title}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map(l => (
                <Link key={l.label} href={l.href}
                  style={{ fontSize: 13, color: T.muted, transition: "color .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = T.coral)}
                  onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
                >{l.label}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: "16px 20px" }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 8,
        }}>
          <p style={{ fontSize: 11, color: T.dim }}>© ২০২৫ KVAD। সর্বস্বত্ব সংরক্ষিত।</p>
          <p style={{ fontSize: 11, color: T.dim }}>Made with ❤️ in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
