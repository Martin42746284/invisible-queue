import { supabase } from "./supabase";
import type { DbQueueEntry } from "@/types/models";

export const entriesService = {
  async listByQueue(queueId: string): Promise<DbQueueEntry[]> {
    const { data, error } = await supabase
      .from("queue_entries")
      .select("*")
      .eq("queue_id", queueId)
      .in("status", ["waiting"])
      .order("position", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async myActive(userId: string | null): Promise<DbQueueEntry | null> {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("queue_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "waiting")
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<DbQueueEntry | null> {
    const { data, error } = await supabase
      .from("queue_entries")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async join(args: {
    queueId: string;
    userLat: number;
    userLng: number;
    guestName?: string;
    guestEmail?: string;
  }) {
    const { data, error } = await supabase.rpc("join_queue", {
      p_queue_id: args.queueId,
      p_user_lat: args.userLat,
      p_user_lng: args.userLng,
      p_guest_name: args.guestName ?? null,
      p_guest_email: args.guestEmail ?? null,
    });
    if (error) throw error;
    return data as string; // entry id
  },

  async leave(entryId: string) {
    const { error } = await supabase.rpc("leave_queue", { p_entry_id: entryId });
    if (error) throw error;
  },

  async serveNext(queueId: string) {
    const { error } = await supabase.rpc("serve_next", { p_queue_id: queueId });
    if (error) throw error;
  },

  async markMissed(entryId: string) {
    const { error } = await supabase.rpc("mark_missed", { p_entry_id: entryId });
    if (error) throw error;
  },
};