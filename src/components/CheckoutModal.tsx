import { supabase } from "@/lib/supabase";

// ১. প্রপসগুলোর টাইপ ডিফাইন করার জন্য ইন্টারফেস
interface CheckoutModalProps {
  cartTotal: number;
  T: any; // থিম অবজেক্ট
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CheckoutModal({ cartTotal, T, onSuccess, onCancel }: CheckoutModalProps) {
  
  // ২. ফর্ম সাবমিট হ্যান্ডলার যেখানে ইভেন্টের টাইপ (React.FormEvent) দেওয়া হয়েছে
  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const address = formData.get('address');

    const { error } = await supabase.from('orders').insert([{
      total: cartTotal,
      shipping_address: `Name: ${name}, Phone: ${phone}, Address: ${address}`,
      status: 'pending'
    }]);

    if (!error) {
      onSuccess();
    } else {
      alert("Error saving order: " + error.message);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: T.card, width: "100%", maxWidth: 500, borderRadius: 30, padding: 40, border: `1px solid ${T.border}` }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 30 }}>Shipping Information</h2>
        
        <form onSubmit={handleConfirm} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <input 
            name="name" 
            required 
            placeholder="Full Name" 
            style={{ background: T.raised, border: `1px solid ${T.border}`, padding: 15, borderRadius: 12, color: T.text, outline: "none" }} 
          />
          <input 
            name="phone" 
            required 
            placeholder="Phone Number" 
            style={{ background: T.raised, border: `1px solid ${T.border}`, padding: 15, borderRadius: 12, color: T.text, outline: "none" }} 
          />
          <textarea 
            name="address" 
            required 
            placeholder="Full Delivery Address" 
            style={{ background: T.raised, border: `1px solid ${T.border}`, padding: 15, borderRadius: 12, color: T.text, minHeight: 100, outline: "none", fontFamily: "inherit" }} 
          />
          
          <div style={{ marginTop: 10 }}>
            <p style={{ color: T.muted, marginBottom: 15 }}>Total Amount: <span style={{ color: T.coral, fontWeight: 800 }}>৳{cartTotal.toLocaleString()}</span></p>
            
            <button 
              type="submit" 
              style={{ width: "100%", background: T.coral, color: "#fff", padding: 20, borderRadius: 15, fontWeight: 900, border: "none", cursor: "pointer" }}
            >
              Confirm Order
            </button>
            
            <button 
              type="button" 
              onClick={onCancel} 
              style={{ width: "100%", color: T.muted, background: 'none', border: 'none', cursor: 'pointer', marginTop: 15, fontSize: 14 }}
            >
              Cancel & Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}