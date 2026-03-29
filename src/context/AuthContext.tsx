"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthCtx {
  user:     User | null;
  role:     string | null;
  loading:  boolean;
  isAdmin:  boolean;
  signIn:   (email: string, password: string) => Promise<string | null>;
  signUp:   (email: string, password: string, name: string, phone: string) => Promise<string | null>;
  signOut:  () => Promise<void>;
  googleSignIn: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, role: null, loading: true, isAdmin: false,
  signIn: async () => null, signUp: async () => null,
  signOut: async () => {}, googleSignIn: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [role,    setRole]    = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fix: removed console.log, proper loading state management
  const fetchRole = async (uid: string) => {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", uid)
      .single();
    setRole(data?.role ?? "customer");
  };

  useEffect(() => {
    // Fix: loading properly set after getSession resolves
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) {
        fetchRole(u.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchRole(u.id).finally(() => setLoading(false));
      } else {
        setRole(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, phone } },
    });
    if (error) return error.message;
    if (data.user) {
      await supabase.from("users").upsert({
        id: data.user.id, email, full_name: name, phone, role: "customer",
      });
    }
    return null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  const googleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` },
    });
  };

  return (
    <Ctx.Provider value={{
      user, role, loading,
      isAdmin: role === "admin",
      signIn, signUp, signOut, googleSignIn,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() { return useContext(Ctx); }
