import { ReactNode, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/auth.store";
import { useGuestStore } from "@/store/guest.store";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const setAuth = useAuthStore((s: any) => s.set);
  const hydrateGuest = useGuestStore((s: any) => s.hydrate);

  useEffect(() => {
    hydrateGuest();
    let isMounted = true;

    supabase.auth.getSession().then(({ data }: any) => {
      if (isMounted) {
        setAuth({ session: data.session, user: data.session?.user ?? null, loading: false });
      }
    }).catch((err) => {
      console.error("AuthProvider: getSession error", err);
      if (isMounted) {
        setAuth({ loading: false });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      if (isMounted) {
        setAuth({ session, user: session?.user ?? null, loading: false });
      }
    });

    return () => {
      isMounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [setAuth, hydrateGuest]);

  return <>{children}</>;
};
