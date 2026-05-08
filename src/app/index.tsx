import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";

export default function Splash() {
  const { loading, session } = useAuthStore();
  useEffect(() => {
    if (loading) return;
    router.replace("/(app)/home");
  }, [loading, session]);
  return (
    <View className="flex-1 items-center justify-center bg-bg">
      <ActivityIndicator color="#6366F1" size="large" />
    </View>
  );
}