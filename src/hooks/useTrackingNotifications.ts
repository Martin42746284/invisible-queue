import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useInternalNotifications } from "./useInternalNotifications";
import { NOTIFY_REMAINING_THRESHOLD } from "@/constants/config";
import type { DbQueueEntry } from "@/types/models";

interface NotificationState {
  lastNotifiedThreshold?: number;
  lastStatus?: string;
}

export const useTrackingNotifications = (entry: DbQueueEntry | null, queueName: string) => {
  const { notify } = useInternalNotifications();
  const stateRef = useRef<NotificationState>({});

  useEffect(() => {
    if (!entry) return;

    const ahead = Math.max(0, entry.position - 1);

    // Notification immédiate pour le passage
    if (entry.status === "served" && stateRef.current.lastStatus !== "served") {
      notify("C'est votre tour !", `${queueName} vous appelle`);
      Alert.alert("À toi !", "C'est ton tour à " + queueName);
      stateRef.current.lastStatus = "served";
    }

    // Notification pour tour manqué
    if (entry.status === "missed" && stateRef.current.lastStatus !== "missed") {
      notify("Tour manqué", "Tu reculs de 3 places");
      stateRef.current.lastStatus = "missed";
    }

    // Notification pour exclusion
    if (entry.status === "excluded" && stateRef.current.lastStatus !== "excluded") {
      notify("Exclusion", "Tu as été retiré de la file");
      Alert.alert("Exclusion", "Tu as manqué 3 tours et as été retiré de la file");
      router.replace("/(app)/home");
      stateRef.current.lastStatus = "excluded";
    }

    // Notification progressive d'approche
    if (entry.status === "waiting") {
      if (ahead === 0) {
        if (stateRef.current.lastNotifiedThreshold !== 0) {
          notify("C'est presque ton tour !", "Position 1 - Sois prêt !");
          stateRef.current.lastNotifiedThreshold = 0;
        }
      } else if (ahead <= NOTIFY_REMAINING_THRESHOLD) {
        if (stateRef.current.lastNotifiedThreshold !== ahead) {
          notify("Approche du tour", `${ahead} personne(s) devant toi`);
          stateRef.current.lastNotifiedThreshold = ahead;
        }
      }
      stateRef.current.lastStatus = "waiting";
    }
  }, [entry, queueName, notify]);
};
