import { View, StyleSheet } from "react-native";
import { colors } from "@/theme";

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.6,
  },
});

export const Skeleton = ({ height = 60 }: { height?: number }) => (
  <View style={[styles.skeleton, { height }]} />
);
