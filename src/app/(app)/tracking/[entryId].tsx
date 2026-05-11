import { useEffect, useRef } from "react";
import { Alert, ScrollView, Text, View, StyleSheet } from "react-native";
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
import { useRealtimeEntry } from "@/hooks/useRealtimeEntry";
import { useTrackingNotifications } from "@/hooks/useTrackingNotifications";
import { getErrorMessage } from "@/utils/errors";
import { useGuestStore } from "@/store/guest.store";
import { colors, spacing, fontSize, fontWeight } from "@/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.muted,
  },
});

export default function Tracking() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const entry = useMyEntryById(entryId!);
  const queue = useQueue(entry.data?.queue_id ?? "");
  const stats = useQueueStats(entry.data?.queue_id ?? "");
  const leave = useLeaveQueue();
  const guest = useGuestStore();

  useRealtimeEntry(entryId!);
  useTrackingNotifications(entry.data ?? null, queue.data?.name ?? "");

  const ahead = entry.data ? Math.max(0, entry.data.position - 1) : 0;

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
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{queue.data.name}</Text>
          <Badge tone={entry.data.status === "waiting" ? "success" : "warning"}>{entry.data.status}</Badge>
        </View>

        <PositionRing position={entry.data.position} ahead={ahead} />

        <Card>
          <View style={styles.statsCard}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>FILE</Text>
              <Text style={styles.statValue}>{stats.data?.people_count ?? 0}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>ATTENTE</Text>
              <Text style={styles.statValue}>{formatWait((ahead) * queue.data.avg_time_per_person_s)}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>RATÉS</Text>
              <Text style={styles.statValue}>{entry.data.missed_count}/3</Text>
            </View>
          </View>
        </Card>

        <Button variant="danger" onPress={handleLeave} loading={leave.isPending}>Quitter la file</Button>
      </ScrollView>
    </SafeAreaView>
  );
}
