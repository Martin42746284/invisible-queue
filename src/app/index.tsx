import { useEffect } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { colors, fontSize, fontWeight } from "@/theme";

export default function Splash() {
  const { loading } = useAuthStore();

  useEffect(() => {
    if (!loading) {
      router.replace("/(app)/home");
    }
  }, [loading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invisible Queue</Text>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    gap: 16,
  },
  title: {
    color: colors.white,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
  },
});
