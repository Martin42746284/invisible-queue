import { Text, View } from "react-native";
export const PositionRing = ({ position, ahead }: { position: number; ahead: number }) => (
  <View className="items-center gap-2">
    <View className="w-40 h-40 rounded-full border-4 border-primary items-center justify-center">
      <Text className="text-white text-5xl font-bold">{position}</Text>
      <Text className="text-muted text-xs uppercase">Position</Text>
    </View>
    <Text className="text-muted">{ahead} personne{ahead > 1 ? "s" : ""} devant vous</Text>
  </View>
);