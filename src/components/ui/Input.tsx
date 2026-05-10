import { TextInput, View, Text, TextInputProps, StyleSheet } from "react-native";
import { colors, spacing, fontSize } from "@/theme";

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.white,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.base,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.xs,
  },
});

export const Input = ({
  label, error, ...props
}: TextInputProps & { label?: string; error?: string }) => (
  <View style={styles.container}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      placeholderTextColor="#64748B"
      style={styles.input}
      {...props}
    />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);
