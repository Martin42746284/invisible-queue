import { View, ViewProps } from "react-native";
export const Card = ({ children, className = "", ...rest }: ViewProps & { className?: string }) => (
  <View className={`bg-surface border border-border rounded-2xl p-4 ${className}`} {...rest}>{children}</View>
);