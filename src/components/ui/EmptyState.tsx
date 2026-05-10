import { Text, View, StyleSheet } from "react-native";
import { colors, spacing, fontSize, fontWeight } from "@/theme";

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  description: {
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});

export const EmptyState = ({ title, description }: { title: string; description?: string }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
  </View>
);
