import * as Notifications from "expo-notifications";

export const useInternalNotifications = () => {
  const notify = async (title: string, body: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null,
      });
    } catch (error) {
      console.warn("Notifications not available in this environment", error);
    }
  };
  return { notify };
};
