import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { queuesService } from "@/services/queues.service";
import { supabase } from "@/services/supabase";
import { queryClient } from "@/lib/queryClient";
import { DEFAULT_RADIUS_M } from "@/constants/config";
import type { Coords } from "@/hooks/useLocation";

export const useNearbyQueues = (coords: Coords | null) => {
  const q = useQuery({
    queryKey: ["queues", "nearby", coords?.latitude, coords?.longitude],
    queryFn: () => queuesService.listNearby(coords!.latitude, coords!.longitude, DEFAULT_RADIUS_M),
    enabled: !!coords,
    refetchInterval: 10_000,
    staleTime: 3_000,
  });

  useEffect(() => {
    if (!coords) return;
    const ch = supabase
      .channel("queues-list")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "queues" },
        () => queryClient.invalidateQueries({ queryKey: ["queues", "nearby", coords.latitude, coords.longitude] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [coords?.latitude, coords?.longitude]);

  return q;
};
