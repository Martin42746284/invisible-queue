import { Text, View, StyleSheet } from "react-native";
import { Button } from "./Button";
import { colors, spacing } from "@/theme";

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  message: {
    color: colors.danger,
    textAlign: 'center',
  },
});

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <View style={styles.container}>
    <Text style={styles.message}>{message}</Text>
    {onRetry && <Button variant="secondary" onPress={onRetry}>Réessayer</Button>}
  </View>
);
