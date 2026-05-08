import { View } from "react-native";
export const Skeleton = ({ height = 60 }: { height?: number }) => (
  <View className="bg-surface rounded-2xl border border-border opacity-60" style={{ height }} />
);