import { Alert, Text, View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { authService } from "@/services/auth.service";
import { useQuery } from "@tanstack/react-query";
import { queuesService } from "@/services/queues.service";
import { colors, spacing, fontSize, fontWeight } from "@/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  appContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    color: colors.white,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    color: colors.muted,
  },
  label: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  email: {
    color: colors.white,
    fontSize: fontSize.lg,
  },
});

export default function Profile() {
  const { user } = useAuthStore();
  const ownedQueues = useQuery({
    queryKey: ["queues", "owned"],
    queryFn: () => queuesService.listOwned(),
    enabled: !!user,
  });

  const logout = async () => {
    await authService.signOut();
    router.replace("/(auth)/login");
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.title}>Mode invité</Text>
        <Text style={styles.subtitle}>Crée un compte pour gérer tes files.</Text>
        <Button onPress={() => router.push("/(auth)/login")}>Se connecter</Button>
        <Button variant="secondary" onPress={() => router.push("/(auth)/register")}>Créer un compte</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <Text style={styles.title}>Profil</Text>
      <Card>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.email}>{user.email}</Text>
      </Card>

      {(ownedQueues.data ?? []).length > 0 && (
        <>
          <Text style={{ color: colors.white, fontWeight: fontWeight.semibold, marginTop: spacing.md }}>
            Mes files
          </Text>
          <FlatList
            scrollEnabled={false}
            data={ownedQueues.data}
            keyExtractor={(q) => q.id}
            renderItem={({ item }) => (
              <View key={item.id} style={{ marginVertical: spacing.xs }}>
                <Card>
                  <View style={{ marginBottom: spacing.sm }}>
                    <Text style={{ color: colors.white, fontWeight: fontWeight.semibold }}>{item.name}</Text>
                  </View>
                  <Button
                    onPress={() => router.push({ pathname: "/manage-queue/[id]" as any, params: { id: item.id } })}
                  >
                    Gérer
                  </Button>
                </Card>
              </View>
            )}
          />
        </>
      )}

      <Button variant="danger" onPress={() => Alert.alert("Déconnexion", "Confirmer ?", [
        { text: "Annuler" }, { text: "Oui", onPress: logout }])}>Se déconnecter</Button>
    </SafeAreaView>
  );
}
