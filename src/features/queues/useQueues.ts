import { useQuery } from "@tanstack/react-query";
import { queuesService } from "@/services/queues.service";
import { DEFAULT_RADIUS_M } from "@/constants/config";
import type { Coords } from "@/hooks/useLocation";

export const useNearbyQueues = (coords: Coords | null) =>
  useQuery({
    queryKey: ["queues", "nearby", coords?.latitude, coords?.longitude],
    queryFn: () => queuesService.listNearby(coords!.latitude, coords!.longitude, DEFAULT_RADIUS_M),
    enabled: !!coords,
    refetchInterval: 15_000,
  });