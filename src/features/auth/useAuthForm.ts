import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export const useSignIn = () =>
  useMutation({ mutationFn: ({ email, password }: { email: string; password: string }) =>
    authService.signIn(email, password) });

export const useSignUp = () =>
  useMutation({ mutationFn: ({ email, password, fullName }: { email: string; password: string; fullName: string }) =>
    authService.signUp(email, password, fullName) });