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
    refetchInterval: 1_000,
    staleTime: 500,
  });

  return q;
};
