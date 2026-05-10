import { FlatList, RefreshControl, Text, View, StyleSheet } from "react-native";
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
import { colors, spacing, fontSize, fontWeight } from "@/theme";

export default function Home() {
  const { coords, error, loading, refresh } = useLocation();
  const queues = useNearbyQueues(coords);
  const { user } = useAuthStore();

  const items = (queues.data ?? []).map((q: any) => ({
    ...q,
    distance_m: coords ? haversineMeters(coords.latitude, coords.longitude, q.latitude, q.longitude) : undefined,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Files à proximité</Text>
          <Text style={styles.title}>Invisible Queue</Text>
        </View>
        <Link href="/(app)/profile" style={styles.profileLink}>
          <Text style={styles.profileText}>Profil</Text>
        </Link>
      </View>

      {loading && <View style={styles.skeletonContainer}><Skeleton /><Skeleton /><Skeleton /></View>}
      {error && <ErrorState message={error} onRetry={refresh} />}

      {!loading && !error && (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={queues.isFetching} onRefresh={() => queues.refetch()} tintColor="#fff" />}
          ListEmptyComponent={<EmptyState title="Aucune file proche" description="Élargis ta zone ou crée une nouvelle file." />}
          renderItem={({ item }) => (
            <QueueCard queue={item} onPress={() => router.push({ pathname: "/(app)/queue/[id]", params: { id: item.id } })} />
          )}
        />
      )}

      {user && (
        <View style={styles.buttonContainer}>
          <Button onPress={() => router.push("/(app)/create-queue")}>+ Créer une file</Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  subtitle: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.white,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    marginTop: spacing.xs,
  },
  profileLink: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  profileText: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  listContainer: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 120,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
});
