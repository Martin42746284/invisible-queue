import { Text, View, StyleSheet } from "react-native";
import { colors, spacing, fontSize } from "@/theme";

const toneStyles = {
  default: {
    container: { backgroundColor: colors.border },
    text: { color: colors.muted },
  },
  success: {
    container: { backgroundColor: colors.success + '33' },
    text: { color: colors.success },
  },
  danger: {
    container: { backgroundColor: colors.danger + '33' },
    text: { color: colors.danger },
  },
  warning: {
    container: { backgroundColor: colors.warning + '33' },
    text: { color: colors.warning },
  },
} as const;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 9999,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
});

export const Badge = ({ children, tone = "default" }: { children: string; tone?: "default" | "success" | "danger" | "warning" }) => {
  const toneStyle = toneStyles[tone];
  return (
    <View style={[styles.container, toneStyle.container]}>
      <Text style={[styles.text, toneStyle.text]}>{children}</Text>
    </View>
  );
};
