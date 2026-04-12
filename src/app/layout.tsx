import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider }  from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider }  from "@/context/AuthContext";
import Navbar            from "@/components/layout/Navbar";
import Footer            from "@/components/layout/Footer";
import AnnouncementBar   from "@/components/layout/AnnouncementBar";
import CartDrawer        from "@/components/cart/CartDrawer";
import WishlistDrawer    from "@/components/cart/WishlistDrawer";
import ScrollToTop       from "@/components/ui/ScrollToTop";

// Fix: use next/font instead of Google Fonts @import
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "KVAD — প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল", template: "%s | KVAD" },
  description: "বাংলাদেশের সেরা অনলাইন ফ্যাশন শপ — প্রিমিয়াম ব্যাগ, শাড়ি, পাঞ্জাবি। বিকাশ, নগদ, রকেট ও COD গ্রহণযোগ্য।",
  keywords: ["KVAD", "online shop bangladesh", "bags", "saree", "panjabi", "ফ্যাশন"],
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, themeColor: "#FF6B4A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            {/* <ThemeProvider> */}
              <ToastProvider>
                <AnnouncementBar />
                <Navbar />
                <main>{children}</main>
                <Footer />
                <CartDrawer />
                <WishlistDrawer />
                <ScrollToTop />
              </ToastProvider>
            {/* </ThemeProvider> */}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
