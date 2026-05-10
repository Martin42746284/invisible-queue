import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Text, View, StyleSheet, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginSchema, LoginInput } from "@/validations/auth.schema";
import { useSignIn } from "@/features/auth/useAuthForm";
import { getErrorMessage } from "@/utils/errors";
import { colors, spacing, fontSize, fontWeight } from "@/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    color: colors.muted,
  },
  form: {
    gap: spacing.lg,
  },
  link: {
    textAlign: 'center',
  },
  primaryLink: {
    color: colors.primary,
  },
  mutedLink: {
    color: colors.muted,
  },
});

export default function Login() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const signIn = useSignIn();

  const onSubmit = (v: LoginInput) =>
    signIn.mutate(v, {
      onSuccess: () => router.replace("/(app)/home"),
      onError: (e: any) => Alert.alert("Erreur", getErrorMessage(e)),
    });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Accède à ton compte Invisible Queue</Text>
      </View>
      <View style={styles.form}>
        <Controller name="email" control={control} render={({ field }: any) => (
          <Input label="Email" autoCapitalize="none" keyboardType="email-address"
            value={field.value} onChangeText={field.onChange} error={errors.email?.message} />)} />
        <Controller name="password" control={control} render={({ field }: any) => (
          <Input label="Mot de passe" secureTextEntry value={field.value}
            onChangeText={field.onChange} error={errors.password?.message} />)} />
        <Button onPress={handleSubmit(onSubmit)} loading={signIn.isPending}>Se connecter</Button>
      </View>
      <Link href="/(auth)/register" asChild>
        <Pressable><Text style={[styles.link, styles.primaryLink]}>Créer un compte</Text></Pressable>
      </Link>
      <Link href="/(app)/home" asChild>
        <Pressable><Text style={[styles.link, styles.mutedLink]}>Continuer en invité</Text></Pressable>
      </Link>
    </SafeAreaView>
  );
}
