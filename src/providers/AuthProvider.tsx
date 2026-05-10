import { ReactNode, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { useGuestStore } from "@/store/guest.store";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const setAuth = useAuthStore((s: any) => s.set);
  const hydrateGuest = useGuestStore((s: any) => s.hydrate);

  useEffect(() => {
    hydrateGuest();
    console.log("AuthProvider: Starting auth check");
    supabase.auth.getSession().then(({ data }: any) => {
      console.log("AuthProvider: getSession completed", data);
      setAuth({ session: data.session, user: data.session?.user ?? null, loading: false });
    }).catch((err) => {
      console.error("AuthProvider: getSession error", err);
      setAuth({ loading: false });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      console.log("AuthProvider: Auth state changed", session);
      setAuth({ session, user: session?.user ?? null, loading: false });
    });
    return () => sub.subscription.unsubscribe();
  }, [setAuth, hydrateGuest]);

  return <>{children}</>;
};
