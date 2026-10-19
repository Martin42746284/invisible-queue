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
    const channelName = "queues-list";
    const existingChannel = supabase.getChannels().find((c: any) => c.topic === channelName);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }
    const ch = supabase
      .channel(channelName)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "queues" },
        () => queryClient.invalidateQueries({ queryKey: ["queues", "nearby", coords.latitude, coords.longitude] }))
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [coords?.latitude, coords?.longitude]);

  return q;
};

export const useAllQueues = () => {
  const q = useQuery({
    queryKey: ["queues", "all"],
    queryFn: () => queuesService.listAll(),
    refetchInterval: 10_000,
    staleTime: 3_000,
  });

  useEffect(() => {
    const channelName = "queues-list-all";
    const existingChannel = supabase.getChannels().find((c: any) => c.topic === channelName);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }
    const ch = supabase
      .channel(channelName)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "queues" },
        () => queryClient.invalidateQueries({ queryKey: ["queues", "all"] }))
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return q;
};
