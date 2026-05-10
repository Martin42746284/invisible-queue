import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createQueueSchema, CreateQueueInput } from "@/validations/queue.schema";
import { queuesService } from "@/services/queues.service";
import { useLocation } from "@/hooks/useLocation";
import { useEffect } from "react";
import { getErrorMessage } from "@/utils/errors";
import { colors, spacing, fontSize, fontWeight } from "@/theme";

const styles = StyleSheet.create({
  container: {
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
});

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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nouvelle file</Text>
      <Controller name="name" control={control} render={({ field }: any) => (
        <Input label="Nom" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />)} />
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Controller name="latitude" control={control} render={({ field }: any) => (
            <Input label="Latitude" keyboardType="numeric" value={String(field.value)} onChangeText={(t: string) => field.onChange(Number(t) || 0)} error={errors.latitude?.message} />)} />
        </View>
        <View style={styles.flex1}>
          <Controller name="longitude" control={control} render={({ field }: any) => (
            <Input label="Longitude" keyboardType="numeric" value={String(field.value)} onChangeText={(t: string) => field.onChange(Number(t) || 0)} error={errors.longitude?.message} />)} />
        </View>
      </View>
      <Controller name="radius_m" control={control} render={({ field }: any) => (
        <Input label="Rayon (m)" keyboardType="numeric" value={String(field.value)} onChangeText={(t: string) => field.onChange(Number(t) || 0)} error={errors.radius_m?.message} />)} />
      <Controller name="avg_time_per_person_s" control={control} render={({ field }: any) => (
        <Input label="Temps moyen / personne (s)" keyboardType="numeric" value={String(field.value)} onChangeText={(t: string) => field.onChange(Number(t) || 0)} error={errors.avg_time_per_person_s?.message} />)} />
      <Button onPress={handleSubmit(submit)} loading={isSubmitting}>Créer</Button>
    </SafeAreaView>
  );
}
