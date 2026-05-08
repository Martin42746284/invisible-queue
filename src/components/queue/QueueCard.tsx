import { Pressable, Text, View } from "react-native";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatDistance, formatWait } from "@/utils/format";
import type { QueueWithMeta } from "@/types/models";

export const QueueCard = ({ queue, onPress }: { queue: QueueWithMeta; onPress: () => void }) => (
  <Pressable onPress={onPress}>
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-white text-lg font-semibold flex-1" numberOfLines={1}>{queue.name}</Text>
        <Badge tone={queue.status === "open" ? "success" : "warning"}>{queue.status}</Badge>
      </View>
      <View className="flex-row gap-4">
        <View><Text className="text-muted text-xs">File</Text><Text className="text-white font-semibold">{queue.people_count} pers.</Text></View>
        <View><Text className="text-muted text-xs">Attente</Text><Text className="text-white font-semibold">{formatWait(queue.estimated_wait_s)}</Text></View>
        <View><Text className="text-muted text-xs">Distance</Text><Text className="text-white font-semibold">{formatDistance(queue.distance_m)}</Text></View>
      </View>
    </Card>
  </Pressable>
);