import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, "Nom trop court"),
});
export type RegisterInput = z.infer<typeof registerSchema>;