import { X } from "lucide-react";

// ১. প্রথমে ইন্টারফেস ডিফাইন করুন যাতে প্রপসগুলোর টাইপ নিশ্চিত হয়
interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  images: string[];
}

interface CartDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onCheckout: () => void;
  T: any; // আপনি চাইলে এখানে থিমের জন্য আলাদা ইন্টারফেস দিতে পারেন
}

export default function CartDrawer({ cart, onClose, onCheckout, T }: CartDrawerProps) {
  // ২. রিডিউস ফাংশনে প্যারামিটার টাইপ ঠিক করা হয়েছে
  const total = cart.reduce((sum: number, i: CartItem) => sum + (i.price * i.qty), 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "100%", maxWidth: 450, height: "100%", background: T.card, padding: 40, borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900 }}>Your Bag</h2>
          <X size={28} onClick={onClose} style={{ cursor: "pointer" }} />
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {cart.map((i: CartItem) => (
            <div key={i.id} style={{ display: "flex", gap: 15 }}>
              <img src={i.images?.[0]} style={{ width: 80, height: 100, borderRadius: 12, objectFit: "cover" }} alt={i.name} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 800 }}>{i.name}</h4>
                <p style={{ color: T.coral, fontWeight: 700 }}>৳{i.price.toLocaleString()}</p>
                <p style={{ fontSize: 13, color: T.muted }}>Qty: {i.qty}</p>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={onCheckout} 
          style={{ width: "100%", background: T.coral, color: "#fff", padding: "18px", borderRadius: 15, fontWeight: 900, marginTop: 20, border: "none", cursor: "pointer" }}
        >
          Proceed to Checkout (৳{total.toLocaleString()})
        </button>
      </div>
    </div>
  );
}