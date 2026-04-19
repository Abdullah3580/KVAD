// src/components/layout/Navbar.tsx

"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [scrolled, setScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
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

  // Notification fetch logic (এটা আগের মতোই আছে)
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

    const channel = supabase
      .channel('noti-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, 
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
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user?.id).eq("is_read", false);
    }
  };

  const displayName = user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "User";

  return (
    <>
      <header className={`sticky top-0 z-[600] h-16 w-full border-b border-border transition-all duration-300 backdrop-blur-xl ${scrolled ? 'bg-background/95 shadow-sm' : 'bg-card'}`}>
        <div className="mx-auto flex h-full max-w-[1400px] items-center gap-4 px-5">
          
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="playfair text-2xl font-black tracking-tight text-primary">KVAD</span>
          </Link>

          {/* Search Bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${search}`); }} 
            className="search-bar-container hidden md:block flex-1 max-w-[620px]">
            <div className="relative">
              <input 
                type="text"
                value={search} 
                onChange={e => setSearch(e.target.value)}
                placeholder="পণ্য খুঁজুন..."
                className="search-input"
              />
              <span className="search-icon" >
                <Ic n="search" s={22} />
              </span>
            </div>
          </form>

          {/* Actions */}
          <div className="nav-capsule-wrapper">
            <ThemeToggle />
            {/* Notification Bell */}
            {user && (
              <div ref={notiRef} className="relative">
                <NavIconBtn label="নোটিফিকেশন" badge={unreadCount} onClick={markAsRead}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="5" viewBox="0 0 24 24" width="5" focusable="false" aria-hidden="true"
                    style={{pointerEvents: "none", display: "inherit", width: "42%", height: "100%"}}>
                    <path d="M16 19a4 4 0 11-8 0H4.765C3.21 19 2.25 17.304 3.05 15.97l1.806-3.01A1 1 0 005 12.446V8a7 7 0 0114 0v4.446c0 .181.05.36.142.515l1.807 3.01c.8 1.333-.161 3.029-1.716 3.029H16ZM12 3a5 5 0 00-5 5v4.446a3 3 0 01-.428 1.543L4.765 17h14.468l-1.805-3.01A3 3 0 0117 12.445V8a5 5 0 00-5-5Zm-2 16a2 2 0 104 0h-4Z"></path>
                  </svg>                
                </NavIconBtn>
                
                {showNoti && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-[700] w-80 rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-border shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    
                    {/* হেডার অংশ */}
                    <div className="flex justify-between items-center bg-muted/50 px-5 py-4 border-b border-border">
                      <span className="text-sm font-bold text-foreground">নোটিফিকেশন</span>
                        {unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-black">
                          {unreadCount} NEW
                      </span>
                      )}
                    </div>
                    <div className="max-h-[380px] overflow-y-auto">
                      {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} className={`p-5 border-b border-border transition-colors hover:bg-muted/50 ${n.is_read ? '' : 'bg-primary/5'}`}>
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          <p className="text-xs leading-relaxed text-muted-foreground mt-1.5">{n.message}</p>
                        </div>)) : 
                      <div className="p-12 text-center text-sm text-muted-foreground">কোনো নোটিফিকেশন নেই</div>}
                    </div>
                  </div>)}
              </div>)}

            {/* Wishlist */}
            <NavIconBtn label="উইশলিস্ট" badge={wish.length} onClick={() => setWishOpen(true)}>
              <Ic n="wishlist" s={20} className={wish.length > 0 ? "text-destructive" : ""} />
            </NavIconBtn>

            {/* Shopping Bag */}
            <button 
              onClick={() => setCartOpen(true)} 
              className="flex items-center gap-2 rounded-2xl bg-muted px-5 py-2.5 hover:bg-muted/80 transition-all"
            >
              <Ic n="cart" s={19} />
              {/* <span className="hidden text-sm font-medium sm:block">ব্যাগ</span> */}
              {cartCount > 0 && (
                <span className="bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground rounded-lg">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div ref={userMenuRef} className="relative">
              {user ? (
                <>

                  <NavIconBtn label="" onClick={() => setUserMenu(!userMenu)} >
                  <svg xmlns="http://www.w3.org/2000/svg" height="5" viewBox="0 0 24 24" width="5" focusable="false" aria-hidden="true"
                    style={{pointerEvents: "none", display: "inherit", width: "42%", height: "100%"}}>
                    <path d="M18.5 1A1.5 1.5 0 0 0 17 2.5v3A1.5 1.5 0 0 0 18.5 7h3A1.5 1.5 0 0 0 23 5.5v-3A1.5 1.5 0 0 0 21.5 1h-3zm0 8a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 21.5 9h-3zm-16 8A1.5 1.5 0 0 0 1 18.5v3A1.5 1.5 0 0 0 2.5 23h3A1.5 1.5 0 0 0 7 21.5v-3A1.5 1.5 0 0 0 5.5 17h-3zm8 0A1.5 1.5 0 0 0 9 18.5v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5h-3zm8 0a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5h-3zm-16-8A1.5 1.5 0 0 0 1 10.5v3A1.5 1.5 0 0 0 2.5 15h3A1.5 1.5 0 0 0 7 13.5v-3A1.5 1.5 0 0 0 5.5 9h-3zm0-8A1.5 1.5 0 0 0 1 2.5v3A1.5 1.5 0 0 0 2.5 7h3A1.5 1.5 0 0 0 7 5.5v-3A1.5 1.5 0 0 0 5.5 1h-3zm8 0A1.5 1.5 0 0 0 9 2.5v3A1.5 1.5 0 0 0 10.5 7h3A1.5 1.5 0 0 0 15 5.5v-3A1.5 1.5 0 0 0 13.5 1h-3zm0 8A1.5 1.5 0 0 0 9 10.5v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 13.5 9h-3z"></path>
                  </svg>                
                </NavIconBtn>

                  {userMenu && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-[700] min-w-[210px] rounded-3xl bg-card p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                      <div className="dropdown-menu">
                        <Link href={user?.role === "seller" ? "/dashboard/vendor" : "/open-shop"} 
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
                          <span>🏬</span> {user?.role === "seller" ? "ভিউ শপ" : "শপ খুলুন"}
                        </Link>

                        <div className="my-1 h-px bg-border mx-2" />

                        <Link href="/account" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm hover:bg-muted transition-colors">
                          <Ic n="user" s={18} /> প্রোফাইল
                        </Link>

                        {isAdmin && (
                          <Link href="/admin" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm hover:bg-muted transition-colors">
                            <Ic n="settings" s={18} /> অ্যাডমিন প্যানেল
                          </Link>
                        )}

                        <button 
                          onClick={async () => { await signOut(); router.push("/"); }} 
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Ic n="logout" s={18} /> লগআউট
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button onClick={() => setShowAuth(true)} className="luxury-button text-sm font-semibold">
                  লগইন
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

function NavIconBtn({ children, label, badge, onClick }: { 
  children: React.ReactNode; 
  label: string; 
  badge?: number; 
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick} 
      title={label} 
      className="relative flex h-11 w-11 items-center justify-center rounded-2xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
    >
      {children}
      {badge && badge > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}