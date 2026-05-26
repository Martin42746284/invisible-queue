import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { entriesService } from "@/services/entries.service";
import { supabase } from "@/services/supabase";
import { queryClient } from "@/lib/queryClient";

export const useQueueEntries = (queueId: string) => {
  const q = useQuery({
    queryKey: ["entries", queueId],
    queryFn: () => entriesService.listByQueue(queueId),
    enabled: !!queueId,
    refetchInterval: 2_000,
    staleTime: 1_000,
  });

  useEffect(() => {
    if (!queueId) return;
    const channelName = `entries:${queueId}`;
    const existingChannel = supabase.getChannels().find((c: any) => c.topic === channelName);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }
    const ch = supabase
      .channel(channelName)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "queue_entries", filter: `queue_id=eq.${queueId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["entries", queueId] });
          queryClient.invalidateQueries({ queryKey: ["queue", queueId, "stats"] });
        })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [queueId]);

  return q;
};
