// src/store/LogStore.ts
import { create } from "zustand";
import { apiClient } from "../lib/apiClient";

export const GENDER_VALUES = ["male", "female", "other"] as const;
export const ACTIVITY_VALUES = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
] as const;
export const LOG_STATE_VALUES = ["processing", "done", "error"] as const;
export const UNIT_VALUES = ["g", "ml"] as const;

export type FoodLogItem = {
  id: string;
  logId: string;
  foodName: string;
  quantityDescription: string;
  quantityTotal: number;
  unit: "g" | "ml";
  caloriesPer100: number;
  carbsPer100: number;
  proteinPer100: number;
  fatPer100: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type FoodLog = {
  id: string;
  userId: string;
  rawText: string;
  explanation: string | null;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  state: "processing" | "done" | "error";
  errorMessage: string | null;
  version: number;
  items: FoodLogItem[];
  createdAt: string;
  updatedAt: string;
};

type LogStore = {
  logs: FoodLog[];
  since: number | null;
  hasMore: boolean;
  syncing: boolean;

  sync: () => Promise<void>;
  loadOlder: () => Promise<void>;
  upsertLog: (log: Partial<FoodLog> & { id: string }) => void;
  removeLog: (id: string) => void;
  clear: () => void;
  addLog: (
    id: string,
    rawText: string,
    userId: string,
    createdAt?: string,
  ) => Promise<void>;
  retryLog: (id: string) => Promise<void>;
  editLog: (id: string, rawText: string) => Promise<void>;
};

export const useLogStore = create<LogStore>((set, get) => ({
  logs: [],
  since: null,
  hasMore: true,
  syncing: false,

  sync: async () => {
    set({ syncing: true });
    try {
      const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const res = await apiClient.get(`/api/logs?since=${since}`);
      set({ logs: res.data, since, syncing: false });
    } catch {
      set({ syncing: false });
    }
  },

  loadOlder: async () => {
    const { logs, hasMore } = get();
    if (!hasMore || logs.length === 0) return;

    const before = new Date(logs.at(-1)!.createdAt).getTime();
    const res = await apiClient.get(`/api/logs/older?before=${before}`);

    set((state) => ({
      logs: [...state.logs, ...res.data.logs],
      hasMore: res.data.hasMore,
    }));
  },

  upsertLog: (log) =>
    set((state) => ({
      logs: state.logs.some((l) => l.id === log.id)
        ? state.logs.map((l) => (l.id === log.id ? { ...l, ...log } : l))
        : [log as FoodLog, ...state.logs],
    })),

  removeLog: (id) =>
    set((state) => ({
      logs: state.logs.filter((l) => l.id !== id),
    })),

  clear: () =>
    set({
      logs: [],
      since: null,
      hasMore: true,
      syncing: false,
    }),

  addLog: async (id, rawText, userId, createdAt) => {
    const now = createdAt ?? new Date().toISOString();

    get().upsertLog({
      id,
      userId,
      rawText,
      state: "processing",
      explanation: null,
      errorMessage: null,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      version: 1,
      items: [],
      createdAt: now,
      updatedAt: now,
    });

    try {
      const res = await apiClient.post("/api/log", {
        id,
        rawText,
        createdAt: now,
        version: 1,
      });

      if (res.data.log) get().upsertLog(res.data.log);
    } catch (err: any) {
      if (err.message === "OFFLINE") return;
      get().upsertLog({
        id,
        state: "error",
        errorMessage: "Failed to process",
      });
    }
  },

  retryLog: async (id) => {
    const log = get().logs.find((l) => l.id === id);
    if (!log) return;

    get().upsertLog({ id, state: "processing", errorMessage: null });

    try {
      const res = await apiClient.post("/api/log", {
        id: log.id,
        rawText: log.rawText,
        createdAt: log.createdAt,
        version: log.version,
      });

      if (res.data.log) get().upsertLog(res.data.log);
    } catch (err: any) {
      if (err.message === "OFFLINE") return;
      get().upsertLog({
        id,
        state: "error",
        errorMessage: "Failed to process",
      });
    }
  },

  editLog: async (id, rawText) => {
    const log = get().logs.find((l) => l.id === id);
    if (!log) return;
    if (log.state === "processing") return;

    const newVersion = log.version + 1;

    get().upsertLog({
      id,
      rawText,
      state: "processing",
      version: newVersion,
      errorMessage: null,
      explanation: null,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      items: [],
    });

    try {
      const res = await apiClient.patch(`/api/log/${id}`, {
        rawText,
        version: newVersion,
      });

      if (res.data.log) get().upsertLog(res.data.log);
    } catch (err: any) {
      if (err.message === "OFFLINE") return;
      get().upsertLog({ id, state: "error", errorMessage: "Failed to update" });
    }
  },
}));
