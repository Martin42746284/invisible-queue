import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createQueueSchema, CreateQueueInput } from "@/validations/queue.schema";
import { queuesService } from "@/services/queues.service";
import { useLocation } from "@/hooks/useLocation";
import { useEffect } from "react";
import { getErrorMessage } from "@/utils/errors";

export default function CreateQueue() {
  const { coords } = useLocation();
  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CreateQueueInput>({
    resolver: zodResolver(createQueueSchema),
    defaultValues: { name: "", latitude: 0, longitude: 0, radius_m: 500, avg_time_per_person_s: 120 },
  });

  useEffect(() => {
    if (coords) {
      setValue("latitude", coords.latitude);
      setValue("longitude", coords.longitude);
    }
  }, [coords]);

  const submit = async (v: CreateQueueInput) => {
    try {
      const q = await queuesService.create(v);
      router.replace({ pathname: "/(app)/queue/[id]", params: { id: q.id } });
    } catch (e) {
      Alert.alert("Erreur", getErrorMessage(e));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg px-6 pt-4 gap-4">
      <Text className="text-white text-2xl font-bold">Nouvelle file</Text>
      <Controller name="name" control={control} render={({ field }) => (
        <Input label="Nom" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />)} />
      <View className="flex-row gap-3">
        <View className="flex-1"><Controller name="latitude" control={control} render={({ field }) => (
          <Input label="Latitude" keyboardType="numeric" value={String(field.value)} onChangeText={(t) => field.onChange(Number(t) || 0)} error={errors.latitude?.message} />)} /></View>
        <View className="flex-1"><Controller name="longitude" control={control} render={({ field }) => (
          <Input label="Longitude" keyboardType="numeric" value={String(field.value)} onChangeText={(t) => field.onChange(Number(t) || 0)} error={errors.longitude?.message} />)} /></View>
      </View>
      <Controller name="radius_m" control={control} render={({ field }) => (
        <Input label="Rayon (m)" keyboardType="numeric" value={String(field.value)} onChangeText={(t) => field.onChange(Number(t) || 0)} error={errors.radius_m?.message} />)} />
      <Controller name="avg_time_per_person_s" control={control} render={({ field }) => (
        <Input label="Temps moyen / personne (s)" keyboardType="numeric" value={String(field.value)} onChangeText={(t) => field.onChange(Number(t) || 0)} error={errors.avg_time_per_person_s?.message} />)} />
      <Button onPress={handleSubmit(submit)} loading={isSubmitting}>Créer</Button>
    </SafeAreaView>
  );
}