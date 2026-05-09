import { ReactNode, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { useGuestStore } from "@/store/guest.store";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const setAuth = useAuthStore((s: any) => s.set);
  const hydrateGuest = useGuestStore((s: any) => s.hydrate);

  useEffect(() => {
    hydrateGuest();
    supabase.auth.getSession().then(({ data }: any) => {
      setAuth({ session: data.session, user: data.session?.user ?? null, loading: false });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      setAuth({ session, user: session?.user ?? null, loading: false });
    });
    return () => sub.subscription.unsubscribe();
  }, [setAuth, hydrateGuest]);

  return <>{children}</>;
};
