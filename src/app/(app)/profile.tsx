import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { authService } from "@/services/auth.service";

export default function Profile() {
  const { user } = useAuthStore();

  const logout = async () => {
    await authService.signOut();
    router.replace("/(auth)/login");
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-bg px-6 justify-center gap-4">
        <Text className="text-white text-2xl font-bold">Mode invité</Text>
        <Text className="text-muted">Crée un compte pour gérer tes files.</Text>
        <Button onPress={() => router.push("/(auth)/login")}>Se connecter</Button>
        <Button variant="secondary" onPress={() => router.push("/(auth)/register")}>Créer un compte</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg px-6 pt-4 gap-4">
      <Text className="text-white text-2xl font-bold">Profil</Text>
      <Card>
        <Text className="text-muted text-xs uppercase">Email</Text>
        <Text className="text-white text-lg">{user.email}</Text>
      </Card>
      <Button variant="danger" onPress={() => Alert.alert("Déconnexion", "Confirmer ?", [
        { text: "Annuler" }, { text: "Oui", onPress: logout }])}>Se déconnecter</Button>
    </SafeAreaView>
  );
}