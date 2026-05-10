import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const useInternalNotifications = () => {
  const notify = async (title: string, body: string, delayMs: number = 100) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          badge: 1,
          channelId: Platform.OS === "android" ? "queue-alerts" : undefined,
          priority: Platform.OS === "android" ? "high" : "default",
          data: { timestamp: new Date().toISOString() },
        },
        trigger: { seconds: delayMs / 1000 || 0.1 },
      });
    } catch (error) {
      console.warn("Failed to send notification:", error);
    }
  };

  return { notify };
};
