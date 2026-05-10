import { ActivityIndicator, Pressable, Text, View, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { colors, spacing, fontWeight, fontSize } from "@/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export const Button = ({
  onPress, children, variant = "primary", loading, disabled, icon,
}: {
  onPress?: () => void;
  children: ReactNode;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}) => {
  const variantStyles: Record<Variant, any> = {
    primary: styles.primary,
    secondary: styles.secondary,
    ghost: styles.ghost,
    danger: styles.danger,
  };
  const textStyles: Record<Variant, any> = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary,
    ghost: styles.textGhost,
    danger: styles.textDanger,
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.base,
        variantStyles[variant],
        (disabled || loading) && styles.disabled
      ]}>
      {loading ? <ActivityIndicator color="#fff" /> : (
        <View style={styles.content}>
          {icon}
          <Text style={textStyles[variant]}>{children}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.danger,
  },
  textPrimary: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
  },
  textSecondary: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
  },
  textGhost: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
  },
  textDanger: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
});
