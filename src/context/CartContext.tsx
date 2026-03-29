"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CartItem, Product } from "@/lib/types";
import { makeCartKey } from "@/lib/constants";

interface CartCtx {
  cart:       CartItem[];
  wish:       number[];
  cartCount:  number;
  cartTotal:  number;
  addCart:    (p: Product, qty?: number, size?: string, color?: string) => void;
  removeCart: (cartKey: string) => void;
  updateQty:  (cartKey: string, qty: number) => void;
  clearCart:  () => void;
  toggleWish: (id: number) => void;
  inWish:     (id: number) => boolean;
  cartOpen:   boolean;
  setCartOpen:(v: boolean) => void;
  wishOpen:   boolean;
  setWishOpen:(v: boolean) => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart]         = useState<CartItem[]>([]);
  const [wish, setWish]         = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);

  /* persist to localStorage */
  useEffect(() => {
    try {
      const c = localStorage.getItem("kvad_cart");
      const w = localStorage.getItem("kvad_wish");
      if (c) setCart(JSON.parse(c));
      if (w) setWish(JSON.parse(w));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("kvad_cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem("kvad_wish", JSON.stringify(wish)); } catch {}
  }, [wish]);

  const addCart = useCallback((p: Product, qty = 1, size?: string, color?: string) => {
    const key = makeCartKey(p.id, size, color);
    setCart(prev => {
      const ex = prev.find(i => i.cartKey === key);
      if (ex) return prev.map(i => i.cartKey === key ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...p, qty, selectedSize: size, selectedColor: color, cartKey: key }];
    });
  }, []);

  const removeCart = useCallback((cartKey: string) => {
    setCart(prev => prev.filter(i => i.cartKey !== cartKey));
  }, []);

  const updateQty = useCallback((cartKey: string, qty: number) => {
    if (qty < 1) { removeCart(cartKey); return; }
    setCart(prev => prev.map(i => i.cartKey === cartKey ? { ...i, qty } : i));
  }, [removeCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWish = useCallback((id: number) => {
    setWish(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const inWish = useCallback((id: number) => wish.includes(id), [wish]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Ctx.Provider value={{
      cart, wish, cartCount, cartTotal,
      addCart, removeCart, updateQty, clearCart,
      toggleWish, inWish,
      cartOpen, setCartOpen, wishOpen, setWishOpen,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
