"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T, CATS, CAT_META } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Ic from "@/components/ui/Ic";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AuthModal from "@/components/auth/AuthModal";

export default function Navbar() {
  const router = useRouter();
  const { cartCount, wish, setCartOpen, setWishOpen } = useCart();
  const { user, signOut } = useAuth();
  const [search,   setSearch]   = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab,  setAuthTab]  = useState<"login"|"signup">("login");
  const [userMenu, setUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const displayName = user?.user_metadata?.full_name?.split(" ")[0]
    ?? user?.email?.split("@")[0] ?? "আমি";

  const LINKS = [
    { label: "শপ", href: "/shop" },
    { label: "অফার", href: "/shop?sort=discount" },
    { label: "নতুন", href: "/shop?sort=newest" },
    { label: "অর্ডার", href: "/orders" },
    { label: "উইশলিস্ট", href: "/wishlist" },
  ];

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 600,
        background: scrolled ? "rgba(8,8,16,.97)" : "var(--card)",
        backdropFilter: "blur(22px)",
        borderBottom: `1px solid ${T.border}`,
        transition: "background .3s",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", gap: 14 }}>
          {/* Logo */}
          <Link href="/shop" style={{ flexShrink: 0 }}>
            <span className="playfair" style={{ fontWeight: 900, fontSize: 28, color: T.coral, letterSpacing: "-.02em" }}>KVAD</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 580, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <Ic n="search" s={16} c={T.muted} />
            </span>
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="পণ্য, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন…"
              style={{ width: "100%", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 11, padding: "10px 44px 10px 42px", color: T.champagne, fontSize: 13, transition: "border-color .2s" }}
              onFocus={e => (e.target.style.borderColor = T.coral)}
              onBlur={e => (e.target.style.borderColor = T.border)} />
            {search && (
              <button type="button" onClick={() => { setSearch(""); inputRef.current?.focus(); }}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.muted, cursor: "pointer" }}>
                <Ic n="x" s={14} />
              </button>
            )}
          </form>
          <div style={{ flex: 1 }} />

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ThemeToggle />

            <NavIconBtn label="উইশ" badge={wish.length} onClick={() => setWishOpen(true)}>
              <Ic n="wishlist" s={20} c={wish.length > 0 ? T.danger : T.muted} solid={wish.length > 0} />
            </NavIconBtn>

            <NavIconBtn label="অর্ডার" onClick={() => router.push("/orders")}>
              <Ic n="orders" s={20} c={T.muted} />
            </NavIconBtn>

            {/* User dropdown */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              {user ? (
                <>
                  <button onClick={() => setUserMenu(m => !m)}
                    style={{ display: "flex", alignItems: "center", gap: 7, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 11, padding: "8px 14px", cursor: "pointer", color: T.champagne, transition: "all .18s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.coral; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,107,74,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: T.coral }}>
                      {displayName[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{displayName}</span>
                    <Ic n="chevDown" s={13} c={T.muted} />
                  </button>
                  {userMenu && (
                    <div className="scale-in" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 8, minWidth: 185, zIndex: 700, boxShadow: "0 16px 48px rgba(0,0,0,.6)" }}>
                      <p style={{ fontSize: 11, color: T.muted, padding: "6px 10px 8px", textTransform: "uppercase", letterSpacing: ".06em" }}>
                        {(user.email?.length ?? 0) > 22 ? user.email?.slice(0, 22) + "…" : user.email}
                      </p>
                      {([
                        ["আমার প্রোফাইল", "/account",  "user"],
                        ["আমার অর্ডার",  "/orders",   "orders"],
                        ["উইশলিস্ট",     "/wishlist", "wishlist"],
                      ] as [string, string, any][]).map(([label, href, icon]) => (
                        <Link key={href} href={href} onClick={() => setUserMenu(false)}
                          style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 9, color: T.cream, fontSize: 13, transition: "background .15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = T.raised)}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <Ic n={icon} s={15} c={T.muted} /> {label}
                        </Link>
                      ))}
                      <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
                      <button onClick={async () => { await signOut(); setUserMenu(false); router.push("/shop"); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 9, border: "none", background: "transparent", color: T.danger, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "background .15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,68,102,.1)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <Ic n="logout" s={15} c={T.danger} /> লগআউট
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button onClick={() => { setAuthTab("login"); setShowAuth(true); }}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 11, padding: "9px 16px", cursor: "pointer", color: T.champagne, fontSize: 13, fontWeight: 600, transition: "all .18s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.coral; (e.currentTarget as HTMLElement).style.color = T.coral; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.champagne; }}>
                  <Ic n="user" s={16} c={T.muted} /> লগইন
                </button>
              )}
            </div>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 11, padding: "9px 18px", cursor: "pointer", color: T.champagne, transition: "all .18s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.coral; (e.currentTarget as HTMLElement).style.background = T.coralG; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.background = T.raised; }}>
              <Ic n="cart" s={18} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>ব্যাগ</span>
              {cartCount > 0 && <span style={{ background: T.coral, color: "#000", borderRadius: 20, padding: "1px 9px", fontSize: 12, fontWeight: 900 }}>{cartCount}</span>}
            </button>

            <button onClick={() => setMenuOpen(m => !m)}
              style={{ background: "none", border: "none", color: T.muted, padding: "8px", cursor: "pointer" }}>
              <Ic n={menuOpen ? "x" : "menu"} s={22} />
            </button>
          </div>
        </div>

        {/* Category strip */}
        <div style={{ background: T.card, borderTop: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px", display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
            {CATS.map(c => (
              <Link key={c} href={c === "All" ? "/shop" : `/shop?cat=${c}`}
                style={{ padding: "11px 18px", borderBottom: "2px solid transparent", color: T.muted, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", transition: "all .2s", display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.coral; (e.currentTarget as HTMLElement).style.borderBottomColor = T.coral; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.muted; (e.currentTarget as HTMLElement).style.borderBottomColor = "transparent"; }}>
                {CAT_META[c]?.icon} {c}
              </Link>
            ))}
            <Link href="/shop?sort=discount" style={{ padding: "11px 18px", color: T.danger, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>🔥 অফার</Link>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="fade-in" style={{ position: "absolute", top: "100%", left: 0, right: 0, background: T.card, borderBottom: `1px solid ${T.border}`, zIndex: 700, padding: "16px 20px" }}>
            {!user && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button onClick={() => { setAuthTab("login"); setShowAuth(true); setMenuOpen(false); }}
                  style={{ flex: 1, padding: "11px", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, color: T.champagne, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>লগইন</button>
                <button onClick={() => { setAuthTab("signup"); setShowAuth(true); setMenuOpen(false); }}
                  style={{ flex: 1, padding: "11px", background: T.coral, border: "none", borderRadius: 10, color: "#000", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>রেজিস্ট্রেশন</button>
              </div>
            )}
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                style={{ display: "block", padding: "12px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, color: T.champagne, transition: "background .15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = T.raised)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />}
    </>
  );
}

function NavIconBtn({ children, label, badge, onClick }: { children: React.ReactNode; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label}
      style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: "8px 10px", borderRadius: 10, transition: "background .18s" }}
      onMouseEnter={e => (e.currentTarget.style.background = T.raised)}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
      {children}
      {badge && badge > 0 ? (
        <span style={{ position: "absolute", top: 4, right: 4, background: T.danger, color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}
