import { FlatList, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { useLocation } from "@/hooks/useLocation";
import { useNearbyQueues } from "@/features/queues/useQueues";
import { QueueCard } from "@/components/queue/QueueCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
import { haversineMeters } from "@/utils/geo";

export default function Home() {
  const { coords, error, loading, refresh } = useLocation();
  const queues = useNearbyQueues(coords);
  const { user } = useAuthStore();

  const items = (queues.data ?? []).map((q) => ({
    ...q,
    distance_m: coords ? haversineMeters(coords.latitude, coords.longitude, q.latitude, q.longitude) : undefined,
  }));

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-6 pt-2 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-muted text-xs uppercase tracking-widest">Files à proximité</Text>
          <Text className="text-white text-2xl font-bold">Invisible Queue</Text>
        </View>
        <Link href="/(app)/profile" className="text-primary">Profil</Link>
      </View>

      {loading && <View className="px-6 gap-3"><Skeleton /><Skeleton /><Skeleton /></View>}
      {error && <ErrorState message={error} onRetry={refresh} />}

      {!loading && !error && (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={queues.isFetching} onRefresh={() => queues.refetch()} tintColor="#fff" />}
          ListEmptyComponent={<EmptyState title="Aucune file proche" description="Élargis ta zone ou crée une nouvelle file." />}
          renderItem={({ item }) => (
            <QueueCard queue={item} onPress={() => router.push({ pathname: "/(app)/queue/[id]", params: { id: item.id } })} />
          )}
        />
      )}

      {user && (
        <View className="absolute bottom-6 left-6 right-6">
          <Button onPress={() => router.push("/(app)/create-queue")}>+ Créer une file</Button>
        </View>
      )}
    </SafeAreaView>
  );
}