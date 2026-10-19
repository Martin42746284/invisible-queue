import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
import { useInternalNotifications } from "./useInternalNotifications";
import { useAuthStore } from "@/store/auth.store";
import type { DbQueueEntry } from "@/types/models";

export const useRealtimeQueueListener = () => {
  const queryClient = useQueryClient();
  const { notify } = useInternalNotifications();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;

    const channelName = "queue-realtime";
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
        },
        async (payload: any) => {
          const entry = payload.new as DbQueueEntry;

          if (entry.user_id === user.id) {
            if (entry.status === "waiting" && entry.position === 1) {
              notify("🎉 C'est ton tour!", "Tu es appelé(e) maintenant", 100);
            }
            if (entry.status === "served") {
              notify("✓ Service terminé", "Merci d'être passé(e)", 100);
            }
            if (entry.status === "missed") {
              notify("⚠️ Manqué", "Tu as dépassé ton créneau", 100);
            }
            if (entry.status === "cancelled") {
              notify("Annulé", "Ton entrée a été annulée", 100);
            }

            queryClient.invalidateQueries({ queryKey: ["my-entry", user.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, notify, queryClient]);
};
