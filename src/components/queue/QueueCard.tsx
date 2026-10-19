import { Pressable, Text, View, StyleSheet } from "react-native";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatDistance, formatWait } from "@/utils/format";
import { colors, spacing, fontSize, fontWeight } from "@/theme";
import type { QueueWithMeta } from "@/types/models";

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  stat: {
    gap: spacing.xs,
  },
  statLabel: {
    color: colors.muted,
    fontSize: fontSize.xs,
  },
  statValue: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
});

export const QueueCard = ({ queue, onPress }: { queue: QueueWithMeta; onPress: () => void }) => (
  <Pressable onPress={onPress}>
    <Card>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{queue.name}</Text>
          <Badge tone={queue.status === "open" ? "success" : "warning"}>{queue.status}</Badge>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>File</Text>
            <Text style={styles.statValue}>{queue.people_count} pers.</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Attente</Text>
            <Text style={styles.statValue}>{formatWait(queue.estimated_wait_s)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{formatDistance(queue.distance_m)}</Text>
          </View>
        </View>
      </View>
    </Card>
  </Pressable>
);
