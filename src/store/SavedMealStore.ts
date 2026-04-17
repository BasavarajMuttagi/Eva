import { apiClient } from "@/src/lib/apiClient";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

export const SAVED_MEAL_STATE_VALUES = ["processing", "done", "error"] as const;

export type SavedMealLogItem = {
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

export type SavedMealLog = {
  id: string;
  userId: string;
  rawText: string;
  explanation: string | null;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  state: (typeof SAVED_MEAL_STATE_VALUES)[number];
  errorMessage: string | null;
  version: number;
  items: SavedMealLogItem[];
  createdAt: string;
  updatedAt: string;
};

type SavedMealStore = {
  savedMeals: SavedMealLog[];
  syncing: boolean;

  sync: () => Promise<void>;
  fetchById: (id: string) => Promise<SavedMealLog | null>;
  createSavedMeal: (rawText: string, userId: string) => Promise<SavedMealLog>;
  updateSavedMeal: (id: string, rawText: string) => Promise<void>;
  retrySavedMeal: (id: string) => Promise<void>;
  deleteSavedMeal: (id: string) => Promise<void>;
  upsertSavedMeal: (savedMeal: Partial<SavedMealLog> & { id: string }) => void;
  removeSavedMeal: (id: string) => void;
  clear: () => void;
};

function toIso(value: unknown): string {
  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
    return new Date().toISOString();
  }
  if (typeof value === "number") return new Date(value).toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

function normalizeSavedMeal(log: any): SavedMealLog {
  return {
    id: log.id,
    userId: log.userId,
    rawText: log.rawText ?? "",
    explanation: log.explanation ?? null,
    totalCalories: Number(log.totalCalories ?? 0),
    totalProtein: Number(log.totalProtein ?? 0),
    totalCarbs: Number(log.totalCarbs ?? 0),
    totalFat: Number(log.totalFat ?? 0),
    state: log.state === "pending" ? "processing" : (log.state ?? "processing"),
    errorMessage: log.errorMessage ?? null,
    version: Number(log.version ?? 1),
    items: Array.isArray(log.items) ? log.items : [],
    createdAt: toIso(log.createdAt),
    updatedAt: toIso(log.updatedAt),
  };
}

function sortByCreatedAtDesc(logs: SavedMealLog[]) {
  return [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function getSavedMealFromResponse(data: any): SavedMealLog | null {
  const candidate = data?.savedMeal ?? data?.log ?? data;
  if (!candidate || typeof candidate !== "object" || !candidate.id) return null;
  return normalizeSavedMeal(candidate);
}

export const useSavedMealStore = create<SavedMealStore>((set, get) => ({
  savedMeals: [],
  syncing: false,

  sync: async () => {
    set({ syncing: true });
    try {
      const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const res = await apiClient.get(`/api/saved-meals?since=${since}`);
      const incoming: SavedMealLog[] = Array.isArray(res.data)
        ? res.data.map(normalizeSavedMeal)
        : [];

      set((state) => {
        const serverIds = new Set(incoming.map((l) => l.id));
        const localProcessing = state.savedMeals.filter(
          (l) => l.state === "processing" && !serverIds.has(l.id),
        );
        return {
          savedMeals: sortByCreatedAtDesc([...localProcessing, ...incoming]),
          syncing: false,
        };
      });
    } catch {
      set({ syncing: false });
    }
  },

  fetchById: async (id) => {
    const local = get().savedMeals.find((l) => l.id === id);
    if (local) return local;

    try {
      const res = await apiClient.get(`/api/saved-meal/${id}`);
      const normalized = getSavedMealFromResponse(res.data);
      if (!normalized) return local ?? null;
      get().upsertSavedMeal(normalized);
      return normalized;
    } catch {
      return local ?? null;
    }
  },

  createSavedMeal: async (rawText, userId) => {
    const id = uuidv4();
    const now = new Date().toISOString();

    const optimistic: SavedMealLog = {
      id,
      userId,
      rawText,
      explanation: null,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      state: "processing",
      errorMessage: null,
      version: 1,
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    get().upsertSavedMeal(optimistic);

    try {
      const res = await apiClient.post("/api/saved-meal", {
        id,
        rawText,
        createdAt: now,
        version: 1,
      });
      const normalized = getSavedMealFromResponse(res.data);
      if (normalized) get().upsertSavedMeal(normalized);

      return optimistic;
    } catch (err: any) {
      if (err.message === "OFFLINE") return optimistic;
      get().upsertSavedMeal({
        id,
        state: "error",
        errorMessage: "Failed to process",
      });
      throw err;
    }
  },

  retrySavedMeal: async (id) => {
    const meal = get().savedMeals.find((l) => l.id === id);
    if (!meal) return;

    get().upsertSavedMeal({
      id,
      state: "processing",
      errorMessage: null,
    });

    try {
      const res = await apiClient.post("/api/saved-meal", {
        id: meal.id,
        rawText: meal.rawText,
        createdAt: meal.createdAt,
        version: meal.version,
      });
      const normalized = getSavedMealFromResponse(res.data);
      if (normalized) get().upsertSavedMeal(normalized);
    } catch (err: any) {
      if (err.message === "OFFLINE") return;
      get().upsertSavedMeal({
        id,
        state: "error",
        errorMessage: "Failed to process",
      });
    }
  },

  updateSavedMeal: async (id, rawText) => {
    const existing = get().savedMeals.find((l) => l.id === id);
    if (!existing) return;
    if (existing.state === "processing") return;

    const updatedVersion = existing.version + 1;
    get().upsertSavedMeal({
      id,
      rawText,
      version: updatedVersion,
      state: "processing",
      errorMessage: null,
      explanation: null,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      items: [],
      updatedAt: new Date().toISOString(),
    });

    try {
      const res = await apiClient.put(`/api/saved-meal/${id}`, {
        rawText,
        version: updatedVersion,
      });
      const normalized = getSavedMealFromResponse(res.data);
      if (normalized) get().upsertSavedMeal(normalized);
    } catch (err: any) {
      if (err.message === "OFFLINE") return;
      get().upsertSavedMeal({
        id,
        state: "error",
        errorMessage: "Failed to update",
      });
      throw err;
    }
  },

  deleteSavedMeal: async (id) => {
    const existing = get().savedMeals.find((l) => l.id === id);
    if (!existing) return;

    get().removeSavedMeal(id);
    try {
      await apiClient.delete(`/api/saved-meal/${id}`);
    } catch (err) {
      get().upsertSavedMeal(existing);
      throw err;
    }
  },

  upsertSavedMeal: (savedMeal) =>
    set((state) => {
      const merged = state.savedMeals.some((l) => l.id === savedMeal.id)
        ? state.savedMeals.map((l) =>
            l.id === savedMeal.id
              ? ({ ...l, ...savedMeal } as SavedMealLog)
              : l,
          )
        : ([savedMeal as SavedMealLog, ...state.savedMeals] as SavedMealLog[]);

      return { savedMeals: sortByCreatedAtDesc(merged) };
    }),

  removeSavedMeal: (id) =>
    set((state) => ({
      savedMeals: state.savedMeals.filter((l) => l.id !== id),
    })),

  clear: () =>
    set({
      savedMeals: [],
      syncing: false,
    }),
}));
