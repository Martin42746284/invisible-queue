import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Text, View, StyleSheet, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerSchema, RegisterInput } from "@/validations/auth.schema";
import { useSignUp } from "@/features/auth/useAuthForm";
import { getErrorMessage } from "@/utils/errors";
import { colors, spacing, fontSize, fontWeight } from "@/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
    color: colors.primary,
  },
});

export default function Register() {
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", fullName: "" },
  });
  const signUp = useSignUp();

  const onSubmit = (v: RegisterInput) =>
    signUp.mutate(v, {
      onSuccess: () => router.replace("/(app)/home"),
      onError: (e: any) => Alert.alert("Erreur", getErrorMessage(e)),
    });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>Crée ton compte</Text>
      </View>
      <View style={styles.form}>
        <Controller name="fullName" control={control} render={({ field }: any) => (
          <Input label="Nom complet" value={field.value} onChangeText={field.onChange} error={errors.fullName?.message} />)} />
        <Controller name="email" control={control} render={({ field }: any) => (
          <Input label="Email" autoCapitalize="none" keyboardType="email-address"
            value={field.value} onChangeText={field.onChange} error={errors.email?.message} />)} />
        <Controller name="password" control={control} render={({ field }: any) => (
          <Input label="Mot de passe" secureTextEntry value={field.value}
            onChangeText={field.onChange} error={errors.password?.message} />)} />
        <Button onPress={handleSubmit(onSubmit)} loading={signUp.isPending}>Créer mon compte</Button>
      </View>
      <Link href="/(auth)/login" asChild>
        <Pressable><Text style={styles.link}>J'ai déjà un compte</Text></Pressable>
      </Link>
    </SafeAreaView>
  );
}
