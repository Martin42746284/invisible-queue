import { ScrollView, Text, View, Alert, StyleSheet } from "react-native";
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
import { colors, spacing, fontSize, fontWeight } from "@/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.white,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    flex: 1,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  statValue: {
    color: colors.white,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  queueTitle: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emptyText: {
    color: colors.muted,
  },
  warningText: {
    color: colors.warning,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.muted,
  },
});

export default function QueueDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queue = useQueue(id!);
  const stats = useQueueStats(id!);
  const entries = useQueueEntries(id!);
  const { coords } = useLocation();
  const distance = useDistance(coords, queue.data ?? null);

  if (queue.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Skeleton height={120} />
        <Skeleton height={80} />
      </View>
    );
  }

  if (!queue.data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>File introuvable</Text>
      </View>
    );
  }

  const inRange = distance != null && distance <= (queue.data?.radius_m ?? 0);

  const handleJoin = () => {
    if (!coords) return Alert.alert("Position requise", "Active la géolocalisation.");
    if (!inRange) return Alert.alert("Hors zone", `Tu es à ${formatDistance(distance ?? undefined)} (max ${queue.data?.radius_m ?? 0} m).`);
    if (!queue.data) return Alert.alert("Erreur", "File introuvable.");
    router.push({ pathname: "/(app)/join/[id]", params: { id: queue.data.id } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{queue.data.name}</Text>
          <Badge tone={queue.data.status === "open" ? "success" : "warning"}>{queue.data.status}</Badge>
        </View>

        <Card>
          <View style={styles.statsCard}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>PERSONNES</Text>
              <Text style={styles.statValue}>{stats.data?.people_count ?? 0}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>ATTENTE</Text>
              <Text style={styles.statValue}>{formatWait(stats.data?.estimated_wait_s ?? 0)}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.statValue}>{formatDistance(distance ?? undefined)}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.queueTitle}>File en cours</Text>
          {(entries.data ?? []).slice(0, 10).map((e: any) => (
            <View key={e.id} style={styles.entryRow}>
              <Text style={styles.emptyText}>#{e.position}</Text>
              <Text style={{ color: colors.white }}>{e.guest_name ?? "Utilisateur"}</Text>
            </View>
          ))}
          {(entries.data?.length ?? 0) === 0 && <Text style={styles.emptyText}>Personne pour l'instant.</Text>}
        </Card>

        <Button onPress={handleJoin} disabled={queue.data.status !== "open"}>
          Rejoindre la file
        </Button>
        {!inRange && distance != null && (
          <Text style={styles.warningText}>Trop loin de la file ({formatDistance(distance)})</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
