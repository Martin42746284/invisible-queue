import { z } from "zod";

export const guestSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(60),
  email: z.string().email("Email invalide"),
});
export type GuestInput = z.infer<typeof guestSchema>;