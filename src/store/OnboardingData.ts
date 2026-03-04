import { ACTIVITY_VALUES, GENDER_VALUES } from "@/src/db/schema";
import { create } from "zustand";

type Gender = (typeof GENDER_VALUES)[number];
type ActivityLevel = (typeof ACTIVITY_VALUES)[number];

type OnboardingDataState = {
  heightCm: number;
  weightKg: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;

  setHeight: (v: number) => void;
  setWeight: (v: number) => void;
  setAge: (v: number) => void;
  setGender: (g: Gender) => void;
  setActivityLevel: (a: ActivityLevel) => void;
  reset: () => void;
};

export const useOnboardingData = create<OnboardingDataState>((set) => ({
  heightCm: 0,
  weightKg: 0,
  age: 0,
  gender: "male",
  activityLevel: "sedentary",

  setHeight: (heightCm) => set({ heightCm }),
  setWeight: (weightKg) => set({ weightKg }),
  setAge: (age) => set({ age }),
  setGender: (gender) => set({ gender }),
  setActivityLevel: (activityLevel) => set({ activityLevel }),

  reset: () =>
    set({
      heightCm: 0,
      weightKg: 0,
      age: 0,
      gender: "male",
      activityLevel: "sedentary",
    }),
}));
