import * as Notifications from "expo-notifications";

export const useInternalNotifications = () => {
  const notify = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  };
  return { notify };
};