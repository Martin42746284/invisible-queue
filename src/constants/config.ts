import Constants from "expo-constants";

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  (Constants.expoConfig?.extra as any)?.supabaseUrl;

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  (Constants.expoConfig?.extra as any)?.supabaseAnonKey;

export const DEFAULT_RADIUS_M = Number(
  process.env.EXPO_PUBLIC_DEFAULT_RADIUS_M ?? 2000
);

export const MAX_MISSED = 3;
export const MISSED_PUSHBACK = 3;
export const NOTIFY_REMAINING_THRESHOLD = 3;