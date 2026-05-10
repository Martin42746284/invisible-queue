import { ReactNode, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    (async () => {
      // Request permissions
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const result = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        if (result.status !== "granted") {
          console.warn("Notification permissions not granted");
        }
      }

      // Setup Android notification channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
          enableVibrate: true,
          enableLights: true,
        });

        // Create additional channels for different notification types
        await Notifications.setNotificationChannelAsync("queue-alerts", {
          name: "Queue Alerts",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          sound: "default",
          enableVibrate: true,
        });
      }
    })();
  }, []);

  return <>{children}</>;
};
