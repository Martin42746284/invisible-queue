import { useQuery } from "@tanstack/react-query";
import { queuesService } from "@/services/queues.service";

export const useQueue = (id: string) => {
  const q = useQuery({
    queryKey: ["queue", id],
    queryFn: () => queuesService.getById(id),
    enabled: !!id,
    refetchInterval: 2_000,
    staleTime: 1_000,
  });

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
