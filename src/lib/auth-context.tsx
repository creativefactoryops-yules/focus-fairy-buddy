import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  display_name: string | null;
  hair_color: string;
  hair_length: string;
  hair_style: string;
  skin_color: string;
  outfit_color: string | null;
  facial_hair: string;
  accessory: string;
  cat_fur_color: string;
  cat_breed: string;
  character_type: string;
  room_layout: Record<string, { x: number; y: number }> | any;
  intro_seen: boolean;
  onboarding_completed: boolean;
};

type Ctx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
};

const AuthCtx = createContext<Ctx>({
  user: null, session: null, profile: null, isAdmin: false, loading: true,
  signOut: async () => {}, refreshProfile: async () => {}, updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string, email?: string | null) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    setProfile((data as unknown as Profile) ?? null);
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    // Client-side defense in depth: only the single owner email may see admin UI,
    // even if extra rows ever land in user_roles. DB trigger also enforces this server-side.
    const ownerEmail = "creativefactory.ops@gmail.com";
    const isOwner = (email || "").trim().toLowerCase() === ownerEmail;
    setIsAdmin(isOwner && Array.isArray(roles) && roles.some((r: any) => r.role === "admin"));
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => { void loadProfile(s.user.id); }, 0);
      } else {
        setProfile(null); setIsAdmin(false);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s); setUser(s?.user ?? null);
      if (s?.user) void loadProfile(s.user.id);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const value: Ctx = {
    user, session, profile, isAdmin, loading,
    signOut: async () => { await supabase.auth.signOut(); },
    refreshProfile: async () => { if (user) await loadProfile(user.id); },
    updateProfile: async (patch) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").update(patch).eq("id", user.id).select().single();
      if (data) setProfile(data as unknown as Profile);
    },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
