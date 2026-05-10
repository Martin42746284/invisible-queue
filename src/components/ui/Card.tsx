import { View, ViewProps, StyleSheet } from "react-native";
import { colors, spacing } from "@/theme";

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.lg,
  },
});

export const Card = ({ children, ...rest }: ViewProps) => (
  <View style={styles.card} {...rest}>{children}</View>
);
