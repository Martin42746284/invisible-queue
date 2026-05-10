import { useEffect } from "react";
import { supabase } from "@/services/supabase";
import { queryClient } from "@/lib/queryClient";
import type { DbQueueEntry } from "@/types/models";

export const useRealtimeEntry = (entryId: string | null) => {
  useEffect(() => {
    if (!entryId) return;

    const channel = supabase
      .channel(`entry-realtime:${entryId}`)
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "queue_entries", filter: `id=eq.${entryId}` },
        (payload: { new?: DbQueueEntry; old?: DbQueueEntry }) => {
          queryClient.invalidateQueries({ queryKey: ["entry", entryId] });
          if (payload.new?.queue_id) {
            queryClient.invalidateQueries({ queryKey: ["entries", payload.new.queue_id] });
            queryClient.invalidateQueries({ queryKey: ["queue", payload.new.queue_id, "stats"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entryId]);
};
