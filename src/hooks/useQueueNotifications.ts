import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
import { useInternalNotifications } from "./useInternalNotifications";
import { useAuthStore } from "@/store/auth.store";

export const useQueueNotifications = (queueId?: string) => {
  const queryClient = useQueryClient();
  const { notify } = useInternalNotifications();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!queueId || !user?.id) return;

    const channelName = `queue-notifications:${queueId}`;
    const existingChannel = supabase.getChannels().find((c: any) => c.topic === channelName);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "queue_entries",
          filter: `queue_id=eq.${queueId}`,
        },
        (payload: any) => {
          const entry = payload.new;
          if (entry.user_id === user.id && entry.status === "waiting") {
            notify("C'est ton tour! 🎉", "Tu es appelé(e)", 100);
            queryClient.invalidateQueries({ queryKey: ["my-entry", user.id] });
          }
          queryClient.invalidateQueries({ queryKey: ["queue-entries", queueId] });
          queryClient.invalidateQueries({ queryKey: ["queue-stats", queueId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queueId, user?.id, notify, queryClient]);
};
