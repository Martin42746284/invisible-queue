import { Text, View } from "react-native";
export const Badge = ({ children, tone = "default" }: { children: string; tone?: "default" | "success" | "danger" | "warning" }) => {
  const colors = {
    default: "bg-border text-muted",
    success: "bg-success/20 text-success",
    danger: "bg-danger/20 text-danger",
    warning: "bg-warning/20 text-warning",
  } as const;
  return (
    <View className={`px-2 py-1 rounded-full ${colors[tone].split(" ")[0]}`}>
      <Text className={`text-xs font-medium ${colors[tone].split(" ")[1]}`}>{children}</Text>
    </View>
  );
};