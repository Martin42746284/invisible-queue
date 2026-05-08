import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ReactNode } from "react";

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
  const base = "rounded-2xl px-5 py-4 flex-row items-center justify-center";
  const styles: Record<Variant, string> = {
    primary: "bg-primary",
    secondary: "bg-surface border border-border",
    ghost: "bg-transparent",
    danger: "bg-danger",
  };
  const text: Record<Variant, string> = {
    primary: "text-white font-semibold",
    secondary: "text-white font-semibold",
    ghost: "text-primary font-semibold",
    danger: "text-white font-semibold",
  };
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      className={`${base} ${styles[variant]} ${disabled || loading ? "opacity-60" : ""}`}>
      {loading ? <ActivityIndicator color="#fff" /> : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={text[variant]}>{children}</Text>
        </View>
      )}
    </Pressable>
  );
};