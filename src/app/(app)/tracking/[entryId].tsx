import { useEffect, useRef } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useMyEntryById } from "@/features/queues/useMyEntry";
import { useLeaveQueue } from "@/features/queues/useJoinQueue";
import { useQueue, useQueueStats } from "@/features/queues/useQueue";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PositionRing } from "@/components/queue/PositionRing";
import { formatWait } from "@/utils/format";
import { useInternalNotifications } from "@/hooks/useInternalNotifications";
import { NOTIFY_REMAINING_THRESHOLD } from "@/constants/config";
import { getErrorMessage } from "@/utils/errors";
import { useGuestStore } from "@/store/guest.store";

export default function Tracking() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const entry = useMyEntryById(entryId!);
  const queue = useQueue(entry.data?.queue_id ?? "");
  const stats = useQueueStats(entry.data?.queue_id ?? "");
  const leave = useLeaveQueue();
  const { notify } = useInternalNotifications();
  const guest = useGuestStore();
  const lastNotified = useRef<number | null>(null);

  const ahead = entry.data ? Math.max(0, entry.data.position - 1) : 0;

  useEffect(() => {
    if (!entry.data) return;
    if (entry.data.status === "served") {
      notify("C'est votre tour !", queue.data?.name ?? "");
      Alert.alert("À toi !", "C'est ton tour.");
    }
    if (entry.data.status === "missed") {
      notify("Tour manqué", "Tu reculs de 3 places.");
    }
    if (entry.data.status === "excluded") {
      notify("Exclusion", "Tu as été retiré de la file.");
      router.replace("/(app)/home");
    }
    if (ahead <= NOTIFY_REMAINING_THRESHOLD && lastNotified.current !== ahead && entry.data.status === "waiting") {
      notify("Bientôt votre tour", `${ahead} personne(s) devant vous`);
      lastNotified.current = ahead;
    }
  }, [entry.data?.status, ahead]);

  const handleLeave = async () => {
    if (!entry.data) return;
    try {
      await leave.mutateAsync(entry.data.id);
      await guest.setEntry(null);
      router.replace("/(app)/home");
    } catch (e) {
      Alert.alert("Erreur", getErrorMessage(e));
    }
  };

  if (!entry.data || !queue.data) {
    return <View className="flex-1 bg-bg items-center justify-center"><Text className="text-muted">Chargement…</Text></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold flex-1">{queue.data.name}</Text>
          <Badge tone={entry.data.status === "waiting" ? "success" : "warning"}>{entry.data.status}</Badge>
        </View>

        <PositionRing position={entry.data.position} ahead={ahead} />

        <Card className="flex-row justify-around">
          <View className="items-center"><Text className="text-muted text-xs">FILE</Text>
            <Text className="text-white text-xl font-bold">{stats.data?.people_count ?? 0}</Text></View>
          <View className="items-center"><Text className="text-muted text-xs">ATTENTE</Text>
            <Text className="text-white text-xl font-bold">{formatWait((ahead) * queue.data.avg_time_per_person_s)}</Text></View>
          <View className="items-center"><Text className="text-muted text-xs">RATÉS</Text>
            <Text className="text-white text-xl font-bold">{entry.data.missed_count}/3</Text></View>
        </Card>

        <Button variant="danger" onPress={handleLeave} loading={leave.isPending}>Quitter la file</Button>
      </ScrollView>
    </SafeAreaView>
  );
}