"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthCtx {
  user:     User | null;
  loading:  boolean;
  signIn:   (email: string, password: string) => Promise<string | null>;
  signUp:   (email: string, password: string, name: string, phone: string) => Promise<string | null>;
  signOut:  () => Promise<void>;
  googleSignIn: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, loading: true,
  signIn: async () => null, signUp: async () => null,
  signOut: async () => {}, googleSignIn: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
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
    /* insert into public.users */
    if (data.user) {
      await supabase.from("users").upsert({
        id:        data.user.id,
        email,
        full_name: name,
        phone,
        role:      "customer",
      });
    }
    return null;
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const googleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` },
    });
  };

  return (
    <Ctx.Provider value={{ user, loading, signIn, signUp, signOut, googleSignIn }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() { return useContext(Ctx); }
