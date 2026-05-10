import { supabase } from "./supabase";
import type { DbQueue, QueueWithMeta } from "@/types/models";

export const queuesService = {
  async listNearby(lat: number, lng: number, radiusM: number): Promise<QueueWithMeta[]> {
    const { data, error } = await supabase.rpc("list_nearby_queues", {
      p_lat: lat,
      p_lng: lng,
      p_radius_m: radiusM,
    });
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<DbQueue | null> {
    const { data, error } = await supabase.from("queues").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(input: {
    name: string;
    latitude: number;
    longitude: number;
    radius_m: number;
    avg_time_per_person_s: number;
  }) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase.from("queues").insert({
      ...input,
      owner_id: user.id,
    }).select().single();
    if (error) throw error;
    return data as DbQueue;
  },

  async getStats(queueId: string) {
    const { data, error } = await supabase.rpc("queue_stats", { p_queue_id: queueId });
    if (error) throw error;
    return (data?.[0] ?? { people_count: 0, estimated_wait_s: 0 }) as {
      people_count: number;
      estimated_wait_s: number;
    };
  },
};
