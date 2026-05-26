import { Alert } from "react-native";

export const useInternalNotifications = () => {
  const notify = async (title: string, body: string, delayMs: number = 100) => {
    try {
      setTimeout(() => {
        Alert.alert(title, body, [{ text: "OK" }]);
      }, Math.max(0, delayMs));
    } catch (error) {
      console.warn("Failed to send notification:", error);
    }
  };

  return { notify };
};
