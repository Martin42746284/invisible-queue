import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Location from "expo-location";

export interface Coords { latitude: number; longitude: number }

export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      if (Platform.OS === "web") {
        // Use Web Geolocation API for web
        return new Promise<void>((resolve) => {
          if (!navigator.geolocation) {
            setError("Géolocalisation non disponible");
            setLoading(false);
            resolve();
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              setCoords({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              setError(null);
              setLoading(false);
              resolve();
            },
            (err) => {
              setError(err.message ?? "Erreur GPS");
              setLoading(false);
              resolve();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });
      } else {
        // Use expo-location for native
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission GPS refusée");
          setLoading(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setError(null);
        setLoading(false);
      }
    } catch (e: any) {
      setError(e.message ?? "Erreur GPS");
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);
  return { coords, error, loading, refresh };
}
