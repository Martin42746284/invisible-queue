import { ScrollView, Text, View, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueue, useQueueStats } from "@/features/queues/useQueue";
import { entriesService } from "@/services/entries.service";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { colors, spacing, fontSize, fontWeight } from "@/theme";
import { useInternalNotifications } from "@/hooks/useInternalNotifications";
import { useQueueNotifications } from "@/hooks/useQueueNotifications";
import { formatWait } from "@/utils/format";

export default function ManageQueue() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queue = useQueue(id!);
  const stats = useQueueStats(id!);
  const queryClient = useQueryClient();
  const { notify } = useInternalNotifications();

  const entries = useQuery({
    queryKey: ["queue-entries", id],
    queryFn: () => entriesService.listByQueue(id!),
    enabled: !!id,
    refetchInterval: 3_000,
  });

  useQueueNotifications(id);

  const serveNextMutation = useMutation({
    mutationFn: async () => {
      await entriesService.serveNext(id!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-entries", id] });
      queryClient.invalidateQueries({ queryKey: ["queue-stats", id] });
      notify("Personne servie", "La personne suivante a été appelée", 500);
    },
    onError: (error) => {
      Alert.alert("Erreur", "Impossible de servir la personne suivante");
    },
  });

  const markMissedMutation = useMutation({
    mutationFn: async (entryId: string) => {
      await entriesService.markMissed(entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-entries", id] });
      queryClient.invalidateQueries({ queryKey: ["queue-stats", id] });
      notify("Marquée manquée", "La personne a été marquée manquée", 500);
    },
    onError: (error) => {
      Alert.alert("Erreur", "Impossible de marquer manquée");
    },
  });

  if (queue.isLoading || entries.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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

  const currentEntry = (entries.data ?? [])[0];

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
              <Text style={styles.statLabel}>EN ATTENTE</Text>
              <Text style={styles.statValue}>{stats.data?.people_count ?? 0}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>ATTENTE MOY</Text>
              <Text style={styles.statValue}>{formatWait(stats.data?.estimated_wait_s ?? 0)}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Personne en cours</Text>
          {currentEntry ? (
            <View>
              <View style={styles.currentEntry}>
                <View>
                  <Text style={styles.entryNumber}>#{currentEntry.position}</Text>
                  <Text style={styles.entryName}>{currentEntry.guest_name ?? "Client"}</Text>
                </View>
              </View>

              <View style={styles.buttonGroup}>
                <Button
                  onPress={() => serveNextMutation.mutate()}
                  disabled={serveNextMutation.isPending}
                >
                  {serveNextMutation.isPending ? "..." : "✓ Personne suivante"}
                </Button>
                <Button
                  variant="secondary"
                  onPress={() => {
                    Alert.alert(
                      "Confirmer",
                      `Marquer ${currentEntry.guest_name ?? "cette personne"} comme manquée ?`,
                      [
                        { text: "Annuler" },
                        {
                          text: "Oui",
                          onPress: () => markMissedMutation.mutate(currentEntry.id),
                        },
                      ]
                    );
                  }}
                  disabled={markMissedMutation.isPending}
                >
                  {markMissedMutation.isPending ? "..." : "✗ Manquée"}
                </Button>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>Aucune personne en attente</Text>
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>File d'attente</Text>
          {(entries.data ?? []).length > 0 ? (
            (entries.data ?? []).slice(0, 10).map((e: any, index: number) => (
              <View key={e.id} style={styles.entryRow}>
                <Text style={styles.entryPosition}>#{e.position}</Text>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryNameAlt}>{e.guest_name ?? "Client"}</Text>
                  {e.missed_count > 0 && (
                    <Text style={styles.missedBadge}>Manquée {e.missed_count}x</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>File vide</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.muted,
    fontSize: fontSize.base,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    color: colors.white,
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    flex: 1,
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  statValue: {
    color: colors.white,
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
  },
  sectionTitle: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  currentEntry: {
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  entryNumber: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  entryName: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  buttonGroup: {
    gap: spacing.sm,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  entryPosition: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    minWidth: 30,
  },
  entryInfo: {
    flex: 1,
  },
  entryNameAlt: {
    color: colors.white,
    fontSize: fontSize.base,
  },
  missedBadge: {
    color: colors.warning,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  emptyText: {
    color: colors.muted,
    fontSize: fontSize.sm,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
});
