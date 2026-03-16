import { create } from "zustand";

type InsightsStore = {
  selectedDate: Date;
  selectedWeek: Date;
  selectedMonth: Date;
  setSelectedDate: (d: Date) => void;
  setSelectedWeek: (d: Date) => void;
  setSelectedMonth: (d: Date) => void;
};

export const useInsightsStore = create<InsightsStore>((set) => ({
  selectedDate: new Date(),
  selectedWeek: new Date(),
  selectedMonth: new Date(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedWeek: (selectedWeek) => set({ selectedWeek }),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
}));
