import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const useInternalNotifications = () => {
  const notify = async (title: string, body: string, delayMs: number = 100) => {
    try {
      const seconds = Math.max(0.1, delayMs / 1000);
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          badge: 1,
          data: { timestamp: new Date().toISOString() },
        },
        trigger: { seconds } as any,
      });
    } catch (error) {
      console.warn("Failed to send notification:", error);
    }
  };

  return { notify };
};
