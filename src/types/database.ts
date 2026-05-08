export type QueueStatus = "open" | "paused" | "closed";
export type EntryStatus = "waiting" | "served" | "missed" | "cancelled" | "excluded";

export interface DbProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface DbQueue {
  id: string;
  owner_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  avg_time_per_person_s: number;
  status: QueueStatus;
  created_at: string;
}

export interface DbQueueEntry {
  id: string;
  queue_id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  position: number;
  status: EntryStatus;
  missed_count: number;
  joined_at: string;
  updated_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string | null;
  entry_id: string | null;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}