import { haversineMeters } from "@/utils/geo";
import type { Coords } from "./useLocation";

export const useDistance = (from: Coords | null, to: { latitude: number; longitude: number } | null) => {
  if (!from || !to) return null;
  return haversineMeters(from.latitude, from.longitude, to.latitude, to.longitude);
};