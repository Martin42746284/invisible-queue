export type { DbQueue, DbQueue as Queue, DbQueueEntry, DbQueueEntry as QueueEntry, DbProfile as Profile, DbNotification as AppNotification, QueueStatus, EntryStatus } from "./database";

export interface QueueWithMeta {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  avg_time_per_person_s: number;
  status: "open" | "paused" | "closed";
  people_count: number;
  estimated_wait_s: number;
  distance_m?: number;
}
