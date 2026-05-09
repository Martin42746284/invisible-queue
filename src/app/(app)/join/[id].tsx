import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { guestSchema, GuestInput } from "@/validations/guest.schema";
import { useJoinQueue } from "@/features/queues/useJoinQueue";
import { useAuthStore } from "@/store/auth.store";
import { useGuestStore } from "@/store/guest.store";
import { useLocation } from "@/hooks/useLocation";
import { getErrorMessage } from "@/utils/errors";

export default function JoinQueue() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const guest = useGuestStore();
  const { coords } = useLocation();
  const join = useJoinQueue();

  const { control, handleSubmit, formState: { errors } } = useForm<GuestInput>({
    resolver: zodResolver(guestSchema),
    defaultValues: { name: guest.name ?? "", email: guest.email ?? "" },
  });

  const submit = async (vals?: GuestInput) => {
    if (!coords) return Alert.alert("Position requise");
    try {
      const entryId = await join.mutateAsync({
        queueId: id!,
        userLat: coords.latitude,
        userLng: coords.longitude,
        guestName: user ? undefined : vals?.name,
        guestEmail: user ? undefined : vals?.email,
      });
      if (vals && !user) await guest.setIdentity(vals.name, vals.email);
      if (!user) await guest.setEntry(entryId);
      router.replace({ pathname: "/(app)/tracking/[entryId]", params: { entryId } });
    } catch (e) {
      Alert.alert("Erreur", getErrorMessage(e));
    }
  };

  if (user) {
    return (
      <SafeAreaView className="flex-1 bg-bg px-6 justify-center gap-4">
        <Text className="text-white text-2xl font-bold">Confirmer</Text>
        <Text className="text-muted">Tu vas rejoindre la file en tant que {user.email}.</Text>
        <Button onPress={() => submit()} loading={join.isPending}>Confirmer</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg px-6 justify-center gap-4">
      <Text className="text-white text-2xl font-bold">Rejoindre en invité</Text>
      <Controller name="name" control={control} render={({ field }: any) => (
        <Input label="Nom" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />)} />
      <Controller name="email" control={control} render={({ field }: any) => (
        <Input label="Email" autoCapitalize="none" keyboardType="email-address"
          value={field.value} onChangeText={field.onChange} error={errors.email?.message} />)} />
      <Button onPress={handleSubmit(submit)} loading={join.isPending}>Rejoindre la file</Button>
    </SafeAreaView>
  );
}
