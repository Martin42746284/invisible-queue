import { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";

export default function Splash() {
  const { loading } = useAuthStore();

  useEffect(() => {
    if (!loading) {
      router.replace("/(app)/home");
    }
  }, [loading]);

  return (
    <View className="flex-1 items-center justify-center bg-bg gap-4">
      <Text className="text-white text-3xl font-bold">Invisible Queue</Text>
      <ActivityIndicator color="#6366F1" size="large" />
    </View>
  );
}
