import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginSchema, LoginInput } from "@/validations/auth.schema";
import { useSignIn } from "@/features/auth/useAuthForm";
import { getErrorMessage } from "@/utils/errors";

export default function Login() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const signIn = useSignIn();

  const onSubmit = (v: LoginInput) =>
    signIn.mutate(v, {
      onSuccess: () => router.replace("/(app)/home"),
      onError: (e) => Alert.alert("Erreur", getErrorMessage(e)),
    });

  return (
    <SafeAreaView className="flex-1 bg-bg px-6 justify-center gap-6">
      <View className="gap-2"><Text className="text-white text-3xl font-bold">Connexion</Text>
        <Text className="text-muted">Accède à ton compte Invisible Queue</Text></View>
      <Controller name="email" control={control} render={({ field }) => (
        <Input label="Email" autoCapitalize="none" keyboardType="email-address"
          value={field.value} onChangeText={field.onChange} error={errors.email?.message} />)} />
      <Controller name="password" control={control} render={({ field }) => (
        <Input label="Mot de passe" secureTextEntry value={field.value}
          onChangeText={field.onChange} error={errors.password?.message} />)} />
      <Button onPress={handleSubmit(onSubmit)} loading={signIn.isPending}>Se connecter</Button>
      <Link href="/(auth)/register" className="text-primary text-center">Créer un compte</Link>
      <Link href="/(app)/home" className="text-muted text-center">Continuer en invité</Link>
    </SafeAreaView>
  );
}