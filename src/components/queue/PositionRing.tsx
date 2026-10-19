import { Text, View, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight, spacing } from "@/theme";

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  ring: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  position: {
    color: colors.white,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
  },
  label: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  ahead: {
    color: colors.muted,
  },
});

export const PositionRing = ({ position, ahead }: { position: number; ahead: number }) => (
  <View style={styles.container}>
    <View style={styles.ring}>
      <Text style={styles.position}>{position}</Text>
      <Text style={styles.label}>Position</Text>
    </View>
    <Text style={styles.ahead}>{ahead} personne{ahead > 1 ? "s" : ""} devant vous</Text>
  </View>
);
