import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { entriesService } from "@/services/entries.service";
import { supabase } from "@/services/supabase";
import { queryClient } from "@/lib/queryClient";

export const useMyEntryById = (entryId: string | null) => {
  const q = useQuery({
    queryKey: ["entry", entryId],
    queryFn: () => entriesService.getById(entryId!),
    enabled: !!entryId,
    refetchInterval: 5_000,
  });

  useEffect(() => {
    if (!entryId) return;
    const ch = supabase
      .channel(`entry:${entryId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "queue_entries", filter: `id=eq.${entryId}` },
        () => queryClient.invalidateQueries({ queryKey: ["entry", entryId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [entryId]);

  return q;
};