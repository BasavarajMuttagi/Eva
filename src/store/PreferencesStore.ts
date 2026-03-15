import { create } from "zustand";
import { apiClient } from "../lib/apiClient";

export type Preferences = {
  heightCm: number;
  weightKg: number;
  age: number;
  gender: "male" | "female" | "other";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
};

type PreferencesStore = {
  prefs: Preferences | null;
  loading: boolean;
  fetch: () => Promise<void>;
  clear: () => void;
};

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  prefs: null,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const res = await apiClient.get("/api/preferences");
      set({ prefs: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  clear: () => set({ prefs: null, loading: false }),
}));
