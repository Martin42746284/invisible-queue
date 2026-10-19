import { z } from "zod";

export const createQueueSchema = z.object({
  name: z.string().min(2).max(80),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_m: z.number().int().min(50).max(20000),
  avg_time_per_person_s: z.number().int().min(10).max(3600),
});
export type CreateQueueInput = z.infer<typeof createQueueSchema>;