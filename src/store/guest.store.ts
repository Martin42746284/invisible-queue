import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface GuestState {
  name: string | null;
  email: string | null;
  activeEntryId: string | null;
  hydrate: () => Promise<void>;
  setIdentity: (name: string, email: string) => Promise<void>;
  setEntry: (id: string | null) => Promise<void>;
}

const KEY = "iq:guest";

export const useGuestStore = create<GuestState>((set, get) => ({
  name: null,
  email: null,
  activeEntryId: null,
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) set(JSON.parse(raw));
  },
  setIdentity: async (name, email) => {
    set({ name, email });
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...get(), name, email }));
  },
  setEntry: async (id) => {
    set({ activeEntryId: id });
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...get(), activeEntryId: id }));
  },
}));