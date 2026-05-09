import { ScrollView, Text, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQueue, useQueueStats } from "@/features/queues/useQueue";
import { useQueueEntries } from "@/features/queues/useQueueEntries";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatWait, formatDistance } from "@/utils/format";
import { useLocation } from "@/hooks/useLocation";
import { useDistance } from "@/hooks/useDistance";

export default function QueueDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queue = useQueue(id!);
  const stats = useQueueStats(id!);
  const entries = useQueueEntries(id!);
  const { coords } = useLocation();
  const distance = useDistance(coords, queue.data ?? null);

  if (queue.isLoading) return <View className="flex-1 bg-bg p-6 gap-3"><Skeleton height={120} /><Skeleton height={80} /></View>;
  if (!queue.data) return <View className="flex-1 bg-bg items-center justify-center"><Text className="text-muted">File introuvable</Text></View>;

  const inRange = distance != null && distance <= (queue.data?.radius_m ?? 0);

  const handleJoin = () => {
    if (!coords) return Alert.alert("Position requise", "Active la géolocalisation.");
    if (!inRange) return Alert.alert("Hors zone", `Tu es à ${formatDistance(distance ?? undefined)} (max ${queue.data?.radius_m ?? 0} m).`);
    if (!queue.data) return Alert.alert("Erreur", "File introuvable.");
    router.push({ pathname: "/(app)/join/[id]", params: { id: queue.data.id } });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-2xl font-bold flex-1">{queue.data.name}</Text>
          <Badge tone={queue.data.status === "open" ? "success" : "warning"}>{queue.data.status}</Badge>
        </View>

        <Card className="flex-row justify-around">
          <View className="items-center"><Text className="text-muted text-xs">PERSONNES</Text>
            <Text className="text-white text-2xl font-bold">{stats.data?.people_count ?? 0}</Text></View>
          <View className="items-center"><Text className="text-muted text-xs">ATTENTE</Text>
            <Text className="text-white text-2xl font-bold">{formatWait(stats.data?.estimated_wait_s ?? 0)}</Text></View>
          <View className="items-center"><Text className="text-muted text-xs">DISTANCE</Text>
            <Text className="text-white text-2xl font-bold">{formatDistance(distance ?? undefined)}</Text></View>
        </Card>

        <Card>
          <Text className="text-white font-semibold mb-2">File en cours</Text>
          {(entries.data ?? []).slice(0, 10).map((e: any) => (
            <View key={e.id} className="flex-row justify-between py-2 border-b border-border">
              <Text className="text-muted">#{e.position}</Text>
              <Text className="text-white">{e.guest_name ?? "Utilisateur"}</Text>
            </View>
          ))}
          {(entries.data?.length ?? 0) === 0 && <Text className="text-muted">Personne pour l'instant.</Text>}
        </Card>

        <Button onPress={handleJoin} disabled={queue.data.status !== "open"}>
          Rejoindre la file
        </Button>
        {!inRange && distance != null && (
          <Text className="text-warning text-center">Trop loin de la file ({formatDistance(distance)})</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
