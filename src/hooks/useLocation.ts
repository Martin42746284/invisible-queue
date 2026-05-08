import { useEffect, useState } from "react";
import * as Location from "expo-location";

export interface Coords { latitude: number; longitude: number }

export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission GPS refusée");
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "Erreur GPS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);
  return { coords, error, loading, refresh };
}