import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface ClubUser {
  id: string;
  x_id: string;
  x_username: string;
  x_avatar: string;
  chips: number;
  referral_code: string;
  referred_by: string | null;
  daily_streak: number;
  last_claim: string | null;
  poker_face_available: boolean;
  created_at: string;
}

export function useClubAuth() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [clubUser, setClubUser] = useState<ClubUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) fetchClubUser(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) fetchClubUser(session.user);
      else { setClubUser(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchClubUser = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("x_id", user.id)
        .single();

      if (data && !error) {
        setClubUser(data);
      }
    } catch (e) {
      // User not registered yet
    } finally {
      setLoading(false);
    }
  };

  const signInWithX = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "x",
      options: {
        redirectTo: `${window.location.origin}/club`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setClubUser(null);
  };

  const refreshUser = async () => {
    if (authUser) await fetchClubUser(authUser);
  };

  return {
    authUser,
    clubUser,
    loading,
    isAuthenticated: !!authUser,
    isRegistered: !!clubUser,
    signInWithX,
    signOut,
    refreshUser,
  };
}
