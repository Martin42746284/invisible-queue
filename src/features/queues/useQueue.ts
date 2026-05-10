import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { queuesService } from "@/services/queues.service";
import { supabase } from "@/services/supabase";
import { queryClient } from "@/lib/queryClient";

export const useQueue = (id: string) => {
  const q = useQuery({
    queryKey: ["queue", id],
    queryFn: () => queuesService.getById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;
    const ch = supabase
      .channel(`queue:${id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "queues", filter: `id=eq.${id}` },
        () => queryClient.invalidateQueries({ queryKey: ["queue", id] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  return q;
};

export const useQueueStats = (id: string) =>
  useQuery({
    queryKey: ["queue", id, "stats"],
    queryFn: () => queuesService.getStats(id),
    enabled: !!id,
    refetchInterval: 2_000,
    staleTime: 1_000,
  });
