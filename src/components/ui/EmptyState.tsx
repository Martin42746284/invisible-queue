import { Text, View } from "react-native";
export const EmptyState = ({ title, description }: { title: string; description?: string }) => (
  <View className="items-center justify-center py-12 gap-2">
    <Text className="text-white text-lg font-semibold">{title}</Text>
    {description && <Text className="text-muted text-center px-8">{description}</Text>}
  </View>
);