import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerSchema, RegisterInput } from "@/validations/auth.schema";
import { useSignUp } from "@/features/auth/useAuthForm";
import { getErrorMessage } from "@/utils/errors";

export default function Register() {
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", fullName: "" },
  });
  const signUp = useSignUp();

  const onSubmit = (v: RegisterInput) =>
    signUp.mutate(v, {
      onSuccess: () => router.replace("/(app)/home"),
      onError: (e) => Alert.alert("Erreur", getErrorMessage(e)),
    });

  return (
    <SafeAreaView className="flex-1 bg-bg px-6 justify-center gap-4">
      <View className="gap-2 mb-4"><Text className="text-white text-3xl font-bold">Inscription</Text>
        <Text className="text-muted">Crée ton compte</Text></View>
      <Controller name="fullName" control={control} render={({ field }) => (
        <Input label="Nom complet" value={field.value} onChangeText={field.onChange} error={errors.fullName?.message} />)} />
      <Controller name="email" control={control} render={({ field }) => (
        <Input label="Email" autoCapitalize="none" keyboardType="email-address"
          value={field.value} onChangeText={field.onChange} error={errors.email?.message} />)} />
      <Controller name="password" control={control} render={({ field }) => (
        <Input label="Mot de passe" secureTextEntry value={field.value}
          onChangeText={field.onChange} error={errors.password?.message} />)} />
      <Button onPress={handleSubmit(onSubmit)} loading={signUp.isPending}>Créer mon compte</Button>
      <Link href="/(auth)/login" className="text-primary text-center">J'ai déjà un compte</Link>
    </SafeAreaView>
  );
}