"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T, CATS, CAT_META } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase"; 
import Ic from "@/components/ui/Ic";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AuthModal from "@/components/auth/AuthModal";

export default function Navbar() {
  const router = useRouter();
  const { cartCount, wish, setCartOpen, setWishOpen } = useCart();
  const { user, signOut, isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [userMenu, setUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- নোটিফিকেশন স্টেট ---
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNoti, setShowNoti] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenu(false);
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) setShowNoti(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // --- নোটিফিকেশন ফেচ এবং রিয়েল-টাইম আপডেট ---
  useEffect(() => {
    if (!user) return;

    const fetchNoti = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNoti();

    // রিয়েল-টাইম লিসেনার: নতুন নোটিফিকেশন আসলে অটো আপডেট হবে
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        (payload) => {
          if (payload.new.user_id === user.id || payload.new.user_id === null) {
            setNotifications(prev => [payload.new, ...prev].slice(0, 10));
            setUnreadCount(c => c + 1);
          }
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = async () => {
    setShowNoti(!showNoti);
    if (!showNoti && unreadCount > 0) {
      setUnreadCount(0);
      await supabase.from("notifications")
        .update({ is_read: true })
        .eq("user_id", user?.id)
        .eq("is_read", false);
    }
  };

  const displayName = user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "আমি";
  const shopLabel = user?.role === "seller" ? "ভিউ শপ 🏬" : "শপ খুলুন 🏪";
  const shopLink = user?.role === "seller" ? "/dashboard/vendor" : "/open-shop";

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 600,
        background: scrolled ? "rgba(8,8,16,.97)" : "var(--card)",
        backdropFilter: "blur(22px)", borderBottom: `1px solid ${T.border}`, transition: "background .3s",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", gap: 14 }}>
          
          <Link href="/" style={{ flexShrink: 0 }}>
            <span className="playfair" style={{ fontWeight: 900, fontSize: 28, color: T.coral, letterSpacing: "-.02em" }}>KVAD</span>
          </Link>

          <form onSubmit={(e) => {e.preventDefault(); router.push(`/search?q=${search}`)}} style={{ flex: 1, maxWidth: 580, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <Ic n="search" s={16} c={T.muted} />
            </span>
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="পণ্য খুঁজুন…"
              style={{ width: "100%", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 11, padding: "10px 44px 10px 42px", color: T.champagne, fontSize: 13 }} />
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeToggle />

            {/* --- নোটিফিকেশন বেল --- */}
            {user && (
              <div ref={notiRef} style={{ position: "relative" }}>
                <NavIconBtn label="নোটিফিকেশন" badge={unreadCount} onClick={markAsRead}>
                  {/* আইকন নাম 'bell' না থাকলে 'orders' বা অন্য কিছু দিয়ে টেস্ট করুন */}
                  <span style={{ fontSize: 20 }}>🔔</span>
                </NavIconBtn>
                
                {showNoti && (
                  <div className="scale-in" style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, width: 300, background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: "0 20px 50px rgba(0,0,0,0.4)", zIndex: 700, overflow: "hidden" }}>
                    <div style={{ padding: "12px 15px", background: T.raised, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.coral }}>নোটিফিকেশন</span>
                      {unreadCount > 0 && <span style={{ fontSize: 10, background: T.coral, color: "#000", padding: "2px 6px", borderRadius: 10, fontWeight: 800 }}>{unreadCount} NEW</span>}
                    </div>
                    <div style={{ maxHeight: 350, overflowY: "auto" }}>
                      {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} style={{ padding: "12px 15px", borderBottom: `1px solid ${T.border}`, background: n.is_read ? "transparent" : "rgba(255,127,80,0.04)", transition: ".2s" }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: T.champagne, marginBottom: 2 }}>{n.title}</p>
                          <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.4 }}>{n.message}</p>
                          <p style={{ fontSize: 9, color: T.dim, marginTop: 6 }}>{new Date(n.created_at).toLocaleTimeString()}</p>
                        </div>
                      )) : <div style={{ padding: 40, textAlign: "center", color: T.dim, fontSize: 12 }}>কোনো নোটিফিকেশন নেই</div>}
                    </div>
                  </div>
                )}
              </div>
            )}

            <NavIconBtn label="উইশলিস্ট" badge={wish.length} onClick={() => setWishOpen(true)}>
              <Ic n="wishlist" s={20} c={wish.length > 0 ? T.danger : T.muted} solid={wish.length > 0} />
            </NavIconBtn>

            {/* ইউজার মেনু */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              {user ? (
                <>
                  <button onClick={() => setUserMenu(!userMenu)} style={{ display: "flex", alignItems: "center", gap: 8, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 11, padding: "7px 12px", cursor: "pointer", color: T.champagne }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.coralG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: T.coral }}>{displayName[0]}</div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{displayName}</span>
                    <Ic n="chevDown" s={12} c={T.muted} />
                  </button>
                  {userMenu && (
                    <div className="scale-in" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 8, minWidth: 190, zIndex: 700, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                       <Link href={shopLink} onClick={() => setUserMenu(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, color: T.coral, fontSize: 13, fontWeight: 700 }}>
                        <span style={{ fontSize: 16 }}>🏬</span> {shopLabel}
                      </Link>
                      <div style={{ height: 1, background: T.border, margin: "5px 0" }} />
                      <Link href="/account" onClick={() => setUserMenu(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, color: T.cream, fontSize: 13 }}>
                        <Ic n="user" s={16} /> প্রোফাইল
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenu(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, color: T.cream, fontSize: 13 }}>
                          <Ic n="settings" s={16} /> অ্যাডমিন ড্যাশবোর্ড
                        </Link>
                      )}
                      <button onClick={async () => { await signOut(); router.push("/"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", color: T.danger, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                        <Ic n="logout" s={16} /> লগআউট
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button onClick={() => setShowAuth(true)} style={{ background: T.coral, color: "#000", border: "none", padding: "8px 16px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>লগইন</button>
              )}
            </div>

            <button onClick={() => setCartOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 11, padding: "8px 15px", cursor: "pointer", color: T.champagne }}>
              <Ic n="cart" s={18} />
              <span style={{ fontWeight: 700, fontSize: 13 }}>ব্যাগ</span>
              {cartCount > 0 && <span style={{ background: T.coral, color: "#000", borderRadius: 10, padding: "0 6px", fontSize: 11, fontWeight: 900 }}>{cartCount}</span>}
            </button>

          </div>
        </div>
      </header>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />}
    </>
  );
}

// --- হেল্পার বাটন কম্পোনেন্ট ---
function NavIconBtn({ children, label, badge, onClick }: { children: React.ReactNode; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: "8px", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
      {badge && badge > 0 ? (
        <span style={{ position: "absolute", top: 2, right: 2, background: T.coral, color: "#000", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${T.bg}` }}>
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}